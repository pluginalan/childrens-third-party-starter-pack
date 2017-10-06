define(function(require) {
    "use strict";

    var downloadManager = require('../downloads/download-manager');

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
            return Promise.reject(
                {
                    "packageId" : packageId,
                    "action"    : "download",
                    "error"     : "unknown"
                }
            )
        },

        cancel: function (packageId) {

            return packages.list().then(function (result) {
                return new Promise(function (resolve, reject) {

                    var packageInfo = result.find(i => i.packageId===packageId);
                    if (packageInfo.status === "available") {
                        downloadManager.cancel(packageId);
                        resolve({
                            "packageId": packageId,
                            "action": "cancel"
                        })
                    } else {
                        reject({
                            "packageId": packageId,
                            "action": "cancel",
                            "error": "notDownloading"
                        })
                    }
                })

            }, function (error) {
                //todo reject unknown error
                return "error";
            });

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
