/**
 * Created by monkss04 on 07/07/2017.
 */
define(function (require, exports, module) {

    var Networking = require('downloads/networking');


    function PackageManager() {
    }


    PackageManager.prototype = Object.create(Object.prototype);
    PackageManager.prototype.constructor = PackageManager;


    // Base URL for accessing packages. This is a pre-defined route set up via config on our local proxy
    PackageManager.PackageBase = "package/";

    // Base URL for accessing packages. This is a pre-defined route set up via config on our local proxy
    PackageManager.CommandBase = "package-manager/";


    // Status values returned by various Package-Manager methods.
    PackageManager.Status_Ok                     = "ok";

    PackageManager.Status_Downloading            = "downloading";
    PackageManager.Status_Installing             = "installing";
    PackageManager.Status_Installed              = "installed";
    PackageManager.Status_Cancelled              = "cancelled";
    PackageManager.Status_Delete                 = "delete";

    PackageManager.Status_ErrorInterrupted       = "errorInterrupted";
    PackageManager.Status_ErrorOffline           = "errorOffline";
    PackageManager.Status_ErrorNotFound          = "errorNotFound";
    PackageManager.Status_ErrorTimedOut          = "errorTimedOut";
    PackageManager.Status_ErrorInsufficientSpace = "errorInsufficientSpace";
    PackageManager.Status_ErrorUnknown           = "errorUnknown";
    PackageManager.Status_ErrorLocked            = "errorLocked";
    PackageManager.Status_ErrorDisallowed        = "errorDisallowed";





    /**
     * Gets a list of the currently installed packages
     * @returns {Promise}
     */
    PackageManager.prototype.installed = function() {

        // A safe, empty object to return in the event of a catastrophic failure
        var failureReturnObject = {
            packages: [],
            spaceAvailable: 0
        };

        var rv = new Promise(function (resolve, reject) {

            Networking.sendQuery(PackageManager.CommandBase+"installed").then(function(response) {

                try {
                    var installationInfo = JSON.parse(response);
                    for (var ix = 0; ix < installationInfo.packages.length; ix++) {
                        var package = installationInfo.packages[ix];

                        // unstringify metadata
                        try {
                            package.metadata = JSON.parse(package.metadata);
                        }
                        catch(e) {
                            package.metadata = null;
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
    PackageManager.prototype.download = function(packageId, metadataObject, packageURL) {
        // A safe, empty object to return in the event of a catastrophic failure
        var failureReturnObject = {
            packageId: packageId,
            status: PackageManager.Status_ErrorUnknown
        };

        var metadataString = JSON.stringify(metadataObject);

        var requestString = PackageManager.CommandBase+"download/"
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
    PackageManager.prototype.downloading = function() {
        // A safe, empty object to return in the event of a catastrophic failure
        var failureReturnObject = {
            packageId: "unknown",
            progress: 0,
            status: PackageManager.Status_ErrorUnknown
        };


        var requestString = PackageManager.CommandBase+"downloading";

        var rv = new Promise(function (resolve, reject) {

            Networking.sendQuery(requestString).then(function(response) {
                var resultObj;

                try {
                    resultObj = JSON.parse(response);
                    resolve(resultObj);
                }
                catch(e) {
                    // broken response
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
     * Attempts to cancel the in flight download. This will return an immediate failure status if;
     * - the named package is not being downloaded
     * - the package has downloaded and is being installed
     *
     * If it returns "ok", the actual cancel will be confirmed through a subsequent call to downloading() via a "cancelled" response.
     * @param packageId
     * @returns {Promise}
     */
    PackageManager.prototype.cancel = function(packageId) {
        // A safe, empty object to return in the event of a catastrophic failure
        var failureReturnObject = {
            packageId: packageId,
            status: PackageManager.Status_ErrorUnknown
        };

        var requestString = PackageManager.CommandBase+"cancel/"+packageId;

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
    PackageManager.prototype.delete = function(packageId) {
        // A safe, empty object to return in the event of a catastrophic failure
        var unknownErrorFailureReturnObject = {
            packageId: packageId,
            status: PackageManager.Status_ErrorUnknown
        };

        var requestString = PackageManager.CommandBase+"delete/"+packageId;

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
    PackageManager.findPackage = function (responseObj, packageId) {
        var package = null;

        for (var ix = 0; ix < responseObj.packages.length; ix++) {

            if (responseObj.packages[ix].packageId === packageId) {
                package = responseObj.packages[ix];
                break;
            }
        }

        return package;

    }
    return PackageManager;
});