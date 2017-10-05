define(function(require) {
    "use strict";

    var DownloadManager = require('../downloads/download-manager');
    var downloadManager = new DownloadManager();

    var packages = {
        list: function() {
            return new Promise((resolve, reject) => {
                if(window._packages.availablePackages && window._packages.bundledPackages) {
                    var availablePackages = window._packages.availablePackages
                    availablePackages.forEach((aPackage) => {
                        aPackage.status = "available"
                        aPackage.downloadProgress = 0
                        aPackage.readOnly = false
                    });
                    var bundledPackages = window._packages.bundledPackages
                    bundledPackages.forEach((bPackage) => {
                        bPackage.status = "installed"
                        bPackage.readOnly = true
                    });
                    var pkgs = availablePackages.concat(bundledPackages)
                    resolve(pkgs);
                } else {
                    reject({
                        "action"    : "list",
                        "error"     : "unknown"
                    })
                }
            })
        },

        download: function(packageId) {
//downloadManager.download(packageId, {}, 'www.someurl.com').catch( (rejected) => {})

            return new Promise((resolve, reject) => {
                var doesExist = false
                var listPromise = packages.list()
          
                listPromise.then(function(pkgs) {
                    pkgs.forEach((aPackage) => {
                        if (aPackage.packageId == packageId) {
                            doesExist = true
                        }
                    })
                })
    
                if(doesExist) {
                    let downloadPromise = downloadManager.download(packageId, {}, '')
                    downloadPromise.then(resolveResponse => {
                        resolve(
                            {
                                "packageId" : packageId,
                                "action"    : "download"
                            }
                        )
                    }, rejectResponse => {
                        reject(
                            {
                                "packageId" : packageId,
                                "action"    : "download",
                                "error"     : "notFound"
                            }
                        )
                    })
                } else {
                    reject({ 
                        "packageId" : packageId, 
                        "action"    : "download", 
                        "error"     : "notFound" 
                    }) 
                }
            })
        }

        // download: function(packageId) {
        //     // from packageId need downloadUrl, and metadata
        //
        //     return new Promise((resolve, reject) => {
        //         // check packageId is in availabe packages, if not reject
        //
        //         // check packageId is not already currently downloading or installing, if so reject
        //
        //         // get download url from some place, likely basePath + packageId
        //
        //         // create metadata object from tags, type, dependencies, etc.
        //
        //         let downloadPromise = downloadManager.download(packageId, metadataObject, downloadUrl)
        //         downloadPromise.then( successResponse => {
        //             if (successResponse.packages[0].status == "downloading"){
        //                 resolve(
        //                     {
        //                         "packageId" : packageId,
        //                         "action"    : "download"
        //                     }
        //                 )
        //             }else{
        //                 // switch on error types, reject with correct response.
        //             }
        //         }, rejectResponse => {
        //             reject(
        //                 {
        //                     "packageId" : packageId,
        //                     "action"    : "download",
        //                     "error"     : "unknown"
        //                 }
        //             )
        //         }
        //         )
        //     }
        // }
    }

    return packages

})
