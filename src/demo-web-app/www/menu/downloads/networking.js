/**
 * Created by monkss04 on 07/07/2017.
 */
define(function (require, exports, module) {


    function Networking() {
    }


    Networking.prototype = Object.create(Object.prototype);
    Networking.prototype.constructor = Networking;

    Networking.sendQuery = function (url) {
        var rv = new Promise(function (resolve, reject) {

            var xmlHttp = new XMLHttpRequest();

            // progress
            // xmlHttp.addEventListener("progress", function() {
            //
            // });

            // finished
            xmlHttp.addEventListener("load", function () {
                if (this.status === 200) {
                    resolve(this.responseText);
                }
                else {
                    reject("network-error-"+this.status);
                }
            });
            // failed
            xmlHttp.addEventListener("error", function () {
                reject("error");
            });
            // cancelled
            xmlHttp.addEventListener("abort", function () {
                reject("abort");
            });

            xmlHttp.open("GET", url, true); // true for asynchronous
            xmlHttp.send(null);

        });

        return rv;
    }


    /**
     * Tests if the specified URL exists
     * @param url
     * @returns {Promise} - invokes resolve with the responseText on success, any failure invokes reject with the status code e.g. 404
     */
    Networking.checkUrlExists = function (url) {
        var rv = new Promise(function (resolve, reject) {

            var xmlHttp = new XMLHttpRequest();

            xmlHttp.onload = function (e) {
                console.log("checkUrlExists("+url+") - response: "+this.status);
                if (this.status === 200) {
                    resolve(this.responseText);
                }
                else {
                    reject(this.status);
                }
            };

            // failed
            // xmlHttp.addEventListener("error", function () {
            //     reject(404);
            // });
            xmlHttp.onerror = function (e) {
                reject(404);
            };
            // cancelled
            xmlHttp.onabort = function () {
                reject(404);
            };

            xmlHttp.timeout = 1000;
            try {
                xmlHttp.open("HEAD", url, true); // HEAD just retrieves the header, true for asynchronous
                xmlHttp.send(null);
            }
            catch(e) {
                reject(404);
            }

        });

        return rv;
    }

    return Networking;
});