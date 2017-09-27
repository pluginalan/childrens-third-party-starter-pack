define(function(require) {
    "use strict";

    var packages = {
        list: function() {
        return new Promise((resolve, reject) =>{
                if(window._packages.availablePackages){
                    resolve(window._packages.availablePackages);
                } else {
                    reject("unknown")
                }
            })
        }
    }

    return packages

})
