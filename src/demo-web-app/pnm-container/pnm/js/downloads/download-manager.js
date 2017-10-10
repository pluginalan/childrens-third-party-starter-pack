/**
 * Created by monkss04 on 07/07/2017.
 */
define(function (require, exports, module) {

    var Networking = require('./networking');


    function DownloadManager() {

    }


    DownloadManager.prototype = Object.create(Object.prototype);
    DownloadManager.prototype.constructor = DownloadManager;


    // Base URL for accessing packages. This is a pre-defined route set up via config on our local proxy
    DownloadManager.PackageBase = "/package/";

    // Base URL for accessing packages. This is a pre-defined route set up via config on our local proxy
    DownloadManager.CommandBase = "/download-manager/";


    // Status values returned by various download-manager methods.
    DownloadManager.Status_Ok                     = "ok";

    DownloadManager.Status_Downloading            = "downloading";
    DownloadManager.Status_Installing             = "installing";
    DownloadManager.Status_Installed              = "installed";
    DownloadManager.Status_Cancelled              = "cancelled";
    DownloadManager.Status_Delete                 = "delete";

    DownloadManager.Status_ErrorInterrupted       = "errorInterrupted";
    DownloadManager.Status_ErrorOffline           = "errorOffline";
    DownloadManager.Status_ErrorNotFound          = "errorNotFound";
    DownloadManager.Status_ErrorTimedOut          = "errorTimedOut";
    DownloadManager.Status_ErrorInsufficientSpace = "errorInsufficientSpace";
    DownloadManager.Status_ErrorUnknown           = "errorUnknown";
    DownloadManager.Status_ErrorLocked            = "errorLocked";
    DownloadManager.Status_ErrorDisallowed        = "errorDisallowed";

    // Network types
    DownloadManager.NetworkType_Offline           = "offline"
    DownloadManager.NetworkType_Mobile            = "mobile"
    DownloadManager.NetworkType_Wifi              = "wifi"


    DownloadManager.connectivityTimer = null;
    DownloadManager.connectivityCallback = null;
    DownloadManager.connectivityState = null;

    /**
     * Gets a list of the currently installed packages
     * @returns {Promise}
     */
    DownloadManager.prototype.installed = function() {

        // A safe, empty object to return in the event of a catastrophic failure
        var failureReturnObject = {
            packages: [],
            spaceAvailable: 0
        };

        var rv = new Promise(function (resolve, reject) {

            Networking.sendQuery(DownloadManager.CommandBase+"installed").then(function(response) {

                try {
                    var installationInfo = JSON.parse(response);
                    for (var ix = 0; ix < installationInfo.packages.length; ix++) {
                        var pkg = installationInfo.packages[ix];

                        // unstringify metadata
                        try {
                            pkg.metadata = JSON.parse(pkg.metadata);
                        }
                        catch(e) {
                            pkg.metadata = null;
                        }
                    }
                }
                catch(e) {
                    console.log("** Catastrophic failure: queryInstalledPackages - Could not parse installed list **");
                    // catastrophic failure, return a safe, but empty object
                    installationInfo = failureReturnObject;
                }

                resolve(installationInfo);

            }).catch(function (error) {
                console.log("** Catastrophic failure: queryInstalledPackages - received error:"+error);
                reject(failureReturnObject);
            });
        });

        return rv;

    }




    /**
     * Initiates a download
     * @param packageId
     * @param metadataObject
     * @param packageURL
     * @returns {Promise}
     */
    DownloadManager.prototype.download = function(packageId, metadataObject, packageURL) {
        // A safe, empty object to return in the event of a catastrophic failure
        var failureReturnObject = {
            packageId: packageId,
            status: DownloadManager.Status_ErrorUnknown
        };

        var metadataString = JSON.stringify(metadataObject);

        var requestString = DownloadManager.CommandBase+"download/"
            +packageId
            +"?metadata="+metadataString
            +"&url="+encodeURIComponent(packageURL);

        var rv = new Promise(function (resolve, reject) {

            Networking.sendQuery(requestString).then(function(response) {
                var resultObj;

                try {
                    resultObj = JSON.parse(response);
                    resolve(resultObj);
                }
                catch(e) {
                    // broken response
                    console.log("** Catastrophic failure: download - could not parse response");
                    reject(failureReturnObject);
                }

            }).catch(function (error) {
                console.log("** Catastrophic failure: download - received error:"+error);
                reject(failureReturnObject);
            });
        });

        return rv;
    }


    /**
     * Gets the current download status
     * @returns {Promise}
     */
    DownloadManager.prototype.downloading = function() {
        // A safe, empty object to return in the event of a catastrophic failure
        var failureReturnObject = {
            packageId: "unknown",
            progress: 0,
            status: DownloadManager.Status_ErrorUnknown
        };


        var requestString = DownloadManager.CommandBase+"downloading";

        var rv = new Promise(function (resolve, reject) {

            Networking.sendQuery(requestString).then(function(response) {
                var resultObj;
                
                try {
                    resultObj = JSON.parse(response);
                    
                    resultObj.packages.forEach((pkg)=>{
                        // unstringify metadata
                        try {
                            pkg.metadata = JSON.parse(pkg.metadata);
                        }
                        catch(e) {
                            pkg.metadata = null;
                        }
                    })
                    
                    resolve(resultObj);
                }
                catch(e) {
                    // broken response
                    console.error(e);
                    console.log("** Catastrophic failure: downloading - could not parse response");
                    reject(failureReturnObject);
                }

            }).catch(function (error) {
                console.log("** Catastrophic failure: downloading - received error:"+error);
                reject(failureReturnObject);
            });
        });

        return rv;
    }


    /**
     * Gets the current connectivity status
     * @returns {Promise}
     */
    DownloadManager.prototype.getConnectivity = function() {
        // A safe, empty object to return in the event of a catastrophic failure
        var failureReturnObject = {
            status: DownloadManager.Status_ErrorUnknown,
            connectionType: DownloadManager.NetworkType_Offline,
            captivePortal: false
        };


        var requestString = DownloadManager.CommandBase+"connectivity";

        var rv = new Promise(function (resolve, reject) {

            Networking.sendQuery(requestString).then(function(response) {
                var resultObj;

                try {
                    resultObj = JSON.parse(response);
                    resolve(resultObj);
                }
                catch(e) {
                    // broken response
                    console.log("** Catastrophic failure: connectivity - could not parse response");
                    reject(failureReturnObject);
                }

            }).catch(function (error) {
                console.log("** Catastrophic failure: connectivity - received error:"+error);
                reject(failureReturnObject);
            });
        });

        return rv;
    }

    DownloadManager.prototype.connectivityTimerFunction = function(){
        DownloadManager.prototype.getConnectivity().then(function (response){
            if(DownloadManager.connectivityCallback){
                var nextState = JSON.stringify(response);
                if(DownloadManager.connectivityState !== nextState){
                    DownloadManager.connectivityState = nextState;
                    DownloadManager.connectivityCallback(response);
                }
                DownloadManager.connectivityTimer = setTimeout(DownloadManager.prototype.connectivityTimerFunction,DownloadManager.ConnectivityDelay);
            } else{
                DownloadManager.connectivityTimer = 0;
            }
        });
    }

    DownloadManager.ConnectivityDelay = 2000;

    DownloadManager.prototype.setConnectivityCallback = function(callback){
        if (!DownloadManager.connectivityTimer) {
            DownloadManager.connectivityTimer = setTimeout(DownloadManager.prototype.connectivityTimerFunction,1000);
        }
        DownloadManager.connectivityCallback =  callback;

    }

    /**
     * Attempts to cancel the in flight download. This will return an immediate failure status if;
     * - the named package is not being downloaded
     * - the package has downloaded and is being installed
     *
     * If it returns "ok", the actual cancel will be confirmed through a subsequent call to downloading() via a "cancelled" response.
     * @param packageId
     * @returns {Promise}
     */
    DownloadManager.prototype.cancel = function(packageId) {
        // A safe, empty object to return in the event of a catastrophic failure
        var failureReturnObject = {
            packageId: packageId,
            status: DownloadManager.Status_ErrorUnknown
        };

        var requestString = DownloadManager.CommandBase+"cancel/"+packageId;

        var rv = new Promise(function (resolve, reject) {

            Networking.sendQuery(requestString).then(function(response) {
                var resultObj;

                try {
                    resultObj = JSON.parse(response);
                    resolve(resultObj);
                }
                catch(e) {
                    // broken response
                    console.log("** Catastrophic failure: cancel - could not parse response");
                    reject(failureReturnObject);
                }

            }).catch(function (error) {
                console.log("** Catastrophic failure: cancel - received error:"+error);
                reject(failureReturnObject);
            });
        });

        return rv;
    }



    /**
     * Initiates the deletion of a package.
     * @param packageId
     * @returns {Promise}
     */
    DownloadManager.prototype.delete = function(packageId) {
        // A safe, empty object to return in the event of a catastrophic failure
        var unknownErrorFailureReturnObject = {
            packageId: packageId,
            status: DownloadManager.Status_ErrorUnknown
        };

        var requestString = DownloadManager.CommandBase+"delete/"+packageId;

        var rv = new Promise(function (resolve, reject) {

            Networking.sendQuery(requestString).then(function(response) {
                var resultObj;

                try {
                    resultObj = JSON.parse(response);
                    resolve(resultObj);
                }
                catch(e) {
                    // broken response
                    console.log("** Catastrophic failure: delete - could not parse response");
                    reject(unknownErrorFailureReturnObject);
                }

            }).catch(function (error) {
                console.log("** Catastrophic failure: delete - received error:"+error);
                reject(unknownErrorFailureReturnObject);
            });
        })

        return rv;
    }


    /**
     * Static methods
     */


    /**
     * Helper function to locate a specific package in a command response. Most Package Manager methods return a response object
     * containing an array of packages, this method will locate a specific package within that response and return its object or
     * null if not found.
     * @param responseObj - the response returned by the Package Manager
     * @param packageId - the ID of the package we're looking for
     * @returns {*} - the found package or null if not found.
     */
    DownloadManager.findPackage = function (responseObj, packageId) {
        var package = null;

        for (var ix = 0; ix < responseObj.packages.length; ix++) {

            if (responseObj.packages[ix].packageId === packageId) {
                package = responseObj.packages[ix];
                break;
            }
        }

        return package;

    }
    return DownloadManager;
});
