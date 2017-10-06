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
          var downloadUrl = thePackage.basepath + thePackage.packageId
          let metadataObject = thePackage
          let downloadPromise = downloadManager.download(packageId, metadataObject, downloadUrl)

          downloadPromise.then( successResponse => {
                if (successResponse.packages[0].status == "downloading"){
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

    }
  }

    return packages
  })

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
