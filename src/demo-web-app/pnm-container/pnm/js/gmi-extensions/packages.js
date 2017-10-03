define(function(require) {
    "use strict";

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
        }
    }

    return packages

})
