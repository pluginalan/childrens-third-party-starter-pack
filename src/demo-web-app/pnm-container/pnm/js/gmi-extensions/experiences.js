define(function(require) {
    "use strict"

    var Networking = require('../networking/networking');

    window._experience.emptyStack = function () {
        emptyStackReject({"status" : "errorEmptyStack"})
    }

    window._experience.experienceNotFound = function () {
        notFoundReject({"status" : "errorNotFound"})
    }

    var emptyStackReject = function(){}
    var notFoundReject = function(){}

    var experiences = {
        getConfig: function() {
            if( typeof window._experience !== 'undefined' && typeof window._experience.config !== 'undefined' ) {
                return Object.freeze(window._experience.config)
            } else {
                return {}
            }
        },

        openExperience: function( experienceKey ) {
            if( window.webkit ) {
                window.webkit.messageHandlers.gmi.postMessage({ "name" : "openExperience",  "body" : experienceKey })
            } else {
                GameInterface.openExperience(experienceKey)
            }
        },

        push: function(experienceKey) {
            // return new Promise((resolve, reject) => {
            //     notFoundReject = reject
            //     if( window.webkit ) {
            //         window.webkit.messageHandlers.gmi.postMessage({ "name" : "push",  "body" : experienceKey })
            //     } else {
            //         GameInterface.push(experienceKey)
            //     }
            // })

            return new Promise(function(resolve, reject) {
                Networking.sendQuery('/experiences/push/'+experienceKey).then(
                    function(response) {
                        console.log(response);
                        resolve({"status" : "ok"});
                    }
                ).catch(
                    function(error) {
                        console.log(error);
                        reject({"status" : "errorNotFound"});
                    }
                );
            });
        },

        pop: function() {

            return new Promise(function(resolve, reject) {
                Networking.sendQuery('/experiences/pop').then(
                    function(response) {
                        console.log(response);
                        resolve({"status" : "ok"});
                    }
                ).catch(
                    function(error) {
                        console.log(error);
                        reject({"status" : "errorEmptyStack"});
                    }
                );
            });

            //
            // return new Promise((resolve, reject) => {
            //     emptyStackReject = reject
            //     if( window.webkit ) {
            //         window.webkit.messageHandlers.gmi.postMessage({ "name" : "pop",  "body" : "" })
            //     } else {
            //         GameInterface.pop()
            //     }
            // })
        }
    }

    return experiences
})
