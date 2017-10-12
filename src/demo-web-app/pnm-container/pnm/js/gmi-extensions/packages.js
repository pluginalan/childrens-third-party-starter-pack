define(function(require) {
    "use strict";

    var DownloadManager = require('../downloads/download-manager');
    var downloadManager = new DownloadManager();

    var errorCallbacks = []
    var progressCallbacks = []
    var installingCallbacks = []
    var installedCallbacks = []

    var eventHandler = function(eventResponse) {
        switch(eventResponse.status) {
            case "error": errorCallbacks.forEach((callback)=>{callback(eventResponse.data)}); break;
            case "progress": progressCallbacks.forEach((callback)=>{callback(eventResponse.data)}); break;
            case "installing": installingCallbacks.forEach((callback)=>{callback(eventResponse.data)}); break;
            case "installed": installedCallbacks.forEach((callback)=>{callback(eventResponse.data)}); break;
            default: {}
        }
    };

    var packages = {

        list: function() {
            return new Promise((resolve, reject) => {
                if(window._packages.availablePackages && window._packages.bundledPackages) {
                    var allPackages = []

                    // Get bundled
                    // For each, set status
                    var bundledPackages = window._packages.bundledPackages
                    bundledPackages.forEach((aPackage) => {
                        aPackage.status = "installed"
                        aPackage.readOnly = true
                        allPackages.push(aPackage)
                    });

                    // Get downloading and installing
                    // For each, set appropriate status]
                    downloadManager.downloading().then(successResponse => {
                        successResponse.packages.forEach((aPackage) => {
                            var packageObject = {}
                            packageObject.packageId = aPackage.metadata.packageId;
                            packageObject.metadata = aPackage.metadata;
                            switch(aPackage.status) {
                                case "downloading":
                                    packageObject.status = "downloading"
                                    packageObject.progress = aPackage.progress
                                    break
                                case "installing":
                                    packageObject.status = "installing"
                                    break
                                default:
                                    // Behaviour undefined
                            }
                            allPackages.push(packageObject)
                        })
                    })

                    // Get installed
                    downloadManager.installed().then(successResponse => {
                        successResponse.packages.forEach((aPackage) => {
                            var packageObject = {}
                            packageObject.packageId = aPackage.metadata.packageId;
                            packageObject.metadata = aPackage.metadata;
                            packageObject.status = "installed"
                            packageObject.downloadProgress = 0
                            packageObject.readOnly = false
                            allPackages.push(packageObject)
                        })

                        // Get available
                        // For each, check packageId not already present in above groups
                        // If not, set status
                        var doesAllPackagesContain = function(aPackage) {
                            var idx = allPackages.findIndex(function(pkg) {
                                return pkg.packageId == aPackage.packageId
                            })

                            return idx != -1                            
                        }

                        var availablePackages = window._packages.availablePackages
                        availablePackages.forEach((aPackage) => {
                            if(!doesAllPackagesContain(aPackage)) {
                                aPackage.status = "available"
                                aPackage.downloadProgress = 0
                                aPackage.readOnly = false
                                allPackages.push(aPackage)
                            }
                        });

                        resolve(allPackages);
                    })

                } else {
                    reject({
                        "action"    : "list",
                        "error"     : "unknown"
                    })
                }
            })
        },

        download: function(packageId) {

            /**
            * Helper function to query if a specific package from a list of available packages.
            * @returns true or false
            */
            var isPackageInTheDownloadPackageList = function () {
                return window._packages.availablePackages.some((availablePackage) => {
                    return availablePackage.packageId == packageId
                })
            }
            /**
            * Helper function to create return objects
            */
            var failureReturnObject = function(errorReason){
                return {"packageId" : packageId, "action" : "download", "error" : errorReason }
            }
            var successReturnObject = function() {return {"packageId" : packageId, "action" : "download" }}

            /**
            * Parse Errors from downloadPromise
            *" DownloadManager can return following error status
            * "downloading" | "errorOffline" | "errorNotFound" | "errorDisallowed" | "errorUnknown" | "errorInUse"
            */
            var parseDownloadResponseErrors = function(response) {
                switch(response.packages[0].status) {
                    case "errorOffline": return failureReturnObject("offline")
                    case "errorNotFound": return failureReturnObject("notFound")
                    case "errorDisallowed": return failureReturnObject("notFound")
                    case "errorUnknown": return failureReturnObject("unknown")
                    case "errorInUse": return failureReturnObject("inProgress")
                    default: return failureReturnObject("unknown")
                }
            }

            return new Promise ((resolve, reject) => {

                if(isPackageInTheDownloadPackageList()) {
                    var thePackage = window._packages.availablePackages.find((availablePackage) => {
                        return availablePackage.packageId == packageId
                    })
                    var downloadUrl = thePackage.basePath + thePackage.packageId + ".zip"
                    let metadataObject = thePackage
                    let downloadPromise = downloadManager.download(packageId, metadataObject, downloadUrl)

                    downloadPromise.then( successResponse => {
                        if (successResponse.status == "downloading") {
                            thePackage.status = "downloading"
                            resolve(successReturnObject());
                        }
                        else {
                            reject(parseDownloadResponseErrors(successResponse));
                        }
                    }, failiureResponse => {
                        // Catastrophic Failiure
                        reject(failureReturnObject("unknown"))
                    } );

                } else {
                    reject(failureReturnObject("notFound"))
                }
            })
        },

        cancel: function (packageId) {

            return packages.list().then(result => {
                return new Promise(function (resolve, reject) {
                    function rejectMessage(packageId, errorType) {
                        return {
                            "packageId": packageId,
                            "action": "cancel",
                            "error": errorType
                        }
                    }

                    let status = result.filter(i => i.packageId === packageId).map(i=>i.status);

                    if (status.length !== 1) { // a package should only have one state
                        reject(rejectMessage(packageId, packages.ERROR_NOT_FOUND))
                    }

                    switch (status[0]) {
                        case "downloading":
                            downloadManager.cancel(packageId).then(cancelResult => {
                                resolve({
                                    "packageId": packageId,
                                    "action": "cancel"
                                });
                            }, cancelError => {
                                console.debug("downloadManager.cancel failed with: " + cancelError);
                                reject(rejectMessage(packageId, packages.ERROR_UNKNOWN))
                            });
                            break;
                        case "installing":
                            reject(rejectMessage(packageId, packages.ERROR_NOT_DOWNLOADING));
                            break;
                        case "available":
                            reject(rejectMessage(packageId, packages.ERROR_NOT_DOWNLOADING));
                            break;
                        default:
                            reject(rejectMessage(packageId, packages.ERROR_NOT_FOUND))
                    }
                })

            }, error => {
                //if list fail, return unknown error
                console.debug(error);
                reject(rejectMessage(packageId, "unknown"));
            });
        },


        addListener: function(eventType, eventObject) {
            window._packages.callback = eventHandler
            switch(eventType) {
                case "error": errorCallbacks.push(eventObject); break;
                case "progress": progressCallbacks.push(eventObject); break;
                case "installing": installingCallbacks.push(eventObject); break;
                case "installed": installedCallbacks.push(eventObject); break;
                default: throw Error("Unknown EventType: " + eventType);
            }
        },

        removeListener: function(eventObject) {

            var errorIdx = errorCallbacks.indexOf(eventObject);
            if(errorIdx > -1) {
                errorCallbacks.splice(errorIdx, 1)
            }
            var progIdx = progressCallbacks.indexOf(eventObject);
            if(progIdx > -1) {
                progressCallbacks.splice(progIdx, 1)
            }
            var installingIdx = installingCallbacks.indexOf(eventObject);
            if(installingIdx > -1) {
                installingCallbacks.splice(installingIdx, 1)
            }
            var installIdx = installedCallbacks.indexOf(eventObject);
            if(installIdx > -1) {
                installedCallbacks.splice(installIdx, 1)
            }
            if(errorIdx == progIdx == installIdx == installingIdx == -1) {
                console.warn("Attempted to remove a listener that doesnt exist!")
            }

        },

        removeAllListeners: function() {
            errorCallbacks = []
            progressCallbacks = []
            installingCallbacks = []
            installedCallbacks = []
        }
    }

    packages.ERROR_NOT_DOWNLOADING = "notDownloading";
    packages.ERROR_UNKNOWN = "unknown";
    packages.ERROR_NOT_FOUND = "notFound";

    return packages
})
