define(function(require) {
    "use strict";

    window._experience.emptyStack = function () {
        emptyStackReject({"status" : "errorEmptyStack"})
    }

    window._experience.experienceNotFound = function () {
        notFoundReject({"status" : "errorNotFound"})
    }

    var emptyStackReject = function(){};
    var notFoundReject = function(){};

    var experiences = {
        getConfig: function() {
            if( typeof window._experience !== 'undefined' && typeof window._experience.config !== 'undefined' ) {
                return Object.freeze(window._experience.config);
            } else {
                return {}
            }
        },

        openExperience: function( experienceKey ) {
            if( window.webkit ) {
                window.webkit.messageHandlers.gmi.postMessage({ "name" : "openExperience",  "body" : experienceKey });
            } else {
                GameInterface.openExperience(experienceKey);
            }
        },

        push: function(experienceKey) {
            return new Promise((resolve, reject) => {
                notFoundReject = reject
                if( window.webkit ) {
                    window.webkit.messageHandlers.gmi.postMessage({ "name" : "push",  "body" : experienceKey });
                } else {
                    GameInterface.push(experienceKey);
                }
            });
        },

        pop: function() {
            return new Promise((resolve, reject) => {
                emptyStackReject = reject
                if( window.webkit ) {
                    window.webkit.messageHandlers.gmi.postMessage({ "name" : "pop",  "body" : "" });
                } else {
                    GameInterface.pop();
                }
            });
        },

        popToRoot: function() {
            if( window.webkit ) {
                window.webkit.messageHandlers.gmi.popToRoot({ "name" : "openExperience",  "body" : "" });
            } else {
                GameInterface.popToRoot();
            }
        }
    }

    return experiences
});
