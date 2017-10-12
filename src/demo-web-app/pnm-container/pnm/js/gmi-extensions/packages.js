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
                    // Logic: Going in reverse-lifecycle order allows us to assume that anything already in the list should not be added with the state being currently evaluated
                    // Starting from available would mean you have to remove available to make way for installing/downloading.
                    // Get bundled
                    Promise.resolve(window._packages.bundledPackages).then(bundled => {
                        var bundledToAdd = []
                        // Give suitable status and add to array
                        bundled.forEach(pkg => {
                            pkg.status = "installed"
                            pkg.readOnly = true
                            bundledToAdd.push(pkg)
                        })
                        return bundledToAdd
                    }).then(allPackages => {
                        // Get downloading and installing
                        var downloadingInstallingToAdd = []
                        return downloadManager.downloading().then(successResponse => {
                            successResponse.packages.filter((pkg)=>{
                                return allPackages.every((existingPackage) => {
                                    return existingPackage.packageId !== pkg.metadata.packageId
                                })
                            }).forEach(pkg => {
                                switch(pkg.status) {
                                    case "downloading":
                                    var progress = pkg.progress
                                    pkg = pkg.metadata
                                    pkg.status = "downloading"
                                    pkg.progress = progress
                                    downloadingInstallingToAdd.push(pkg)
                                    break
                                    case "installing":
                                    pkg = pkg.metadata
                                    pkg.status = "installing"
                                    downloadingInstallingToAdd.push(pkg)
                                    break
                                    default:
                                    // Undefined behaviour, do not add to list.
                                    break
                                }
                            })
                            
                            return allPackages.concat(downloadingInstallingToAdd)
                        }, failureResponse => {
                            console.warn("Download manager returned failure for downloading()")
                            reject({
                                "action"    : "list",
                                "error"     : "unknown"
                            })
                        })
                    }).then(allPackages => {
                        // Get installed
                        
                        var installedToAdd = []
                        return downloadManager.installed().then(successResponse => {
                            successResponse.packages.filter((pkg)=>{
                                return allPackages.every((existingPackage) => {
                                    return existingPackage.packageId !== pkg.metadata.packageId
                                })
                            }).forEach(pkg => {
                                pkg = pkg.metadata
                                pkg.status = "installed" 
                                pkg.downloadProgress = 0 
                                pkg.readOnly = false 
                                
                                installedToAdd.push(pkg)
                            })
                            
                            return allPackages.concat(installedToAdd)
                        }, failureResponse => {
                            console.warn("Download manager returned failure for installed()")
                            reject({
                                "action"    : "list",
                                "error"     : "unknown"
                            })
                        })
                    }).then(allPackages => {
                        // Get available
                        
                        var availableToAdd = []
                        var available = window._packages.availablePackages
                        
                        available.forEach(pkg => {
                            if(allPackages.findIndex(itrPkg => {
                                return itrPkg.packageId == pkg.packageId
                            }) == -1) {
                                pkg.status = "available"
                                pkg.downloadProgress = 0
                                pkg.readOnly = false
                                availableToAdd.push(pkg)
                            }
                        })

                        resolve(allPackages.concat(availableToAdd))
                    }).catch(error => {
                        console.warn(error)
                        reject({
                            "action"    : "list",
                            "error"     : "unknown"
                        })
                    })
                    
                    
                    
                    
                    
                    
                    
                    
                    // Get available
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
                switch(response.status) {
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
    return packages
})
