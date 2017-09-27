define(function(require) {
    "use strict";

    var packages = {
        list: function() {
        return new Promise((resolve, reject) => {
                if(window._packages.availablePackages) {
                    var packages = window._packages.availablePackages;
                    packages.forEach((aPackage) => {
                        aPackage.status = "available"
                        aPackage.downloadProgress = 0
                        aPackage.readOnly = false
                    });
                    resolve(packages);
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
