define(function(require) {
    "use strict"

    window._experience.emptyStack = function () {
        emptyStackReject({"status" : "errorEmptyStack"})
    }

    window._experience.experienceNotFound = function () {
        notFoundReject({"status" : "errorNotFound"})
    }

    var emptyStackReject = function(){}
    var notFoundReject = function(){}

    var experience = {
        getConfig: function() {
            if( typeof window._experience !== 'undefined' && typeof window._experience.config !== 'undefined' ) {
                return window._experience.config
            } else {
                return undefined
            }
        },

        getParams: function() {
            if( typeof window._experience !== 'undefined' && typeof window._experience.params !== 'undefined' ) {
                return window._experience.params
            } else {
                return undefined
            }
        },

        //
        // openExperience: function( experienceKey ) {
        //     if( window.webkit ) {
        //         window.webkit.messageHandlers.gmi.postMessage({ "name" : "openExperience",  "body" : experienceKey })
        //     } else {
        //         GameInterface.openExperience(experienceKey)
        //     }
        // },

        push: function(experienceKey, params) {
            return new Promise((resolve, reject) => {
                notFoundReject = reject
                if( window.webkit ) {
                    var body = {
                        "experienceKey" : experienceKey,
                        "params" : JSON.stringify(params)
                    }
                    window.webkit.messageHandlers.gmi.postMessage({ "name" : "push",  "body" : body})
                } else {
                    GameInterface.push(experienceKey, JSON.stringify(body))
                }
            })
        },

        pop: function(params) {
            return new Promise((resolve, reject) => {
                emptyStackReject = reject
                if( window.webkit ) {
                    var body = {
                        "params" : JSON.stringify(params)
                    }
                    window.webkit.messageHandlers.gmi.postMessage({ "name" : "pop",  "body" : body })
                } else {
                    GameInterface.pop(JSON.stringify(params))
                }
            });
        },

        popToRoot: function(params)
        {
            return new Promise((resolve, reject) => {
                if( window.webkit ) {
                    var body = {
                        "params" : JSON.stringify(params)
                    }
                    window.webkit.messageHandlers.gmi.postMessage( {"name": "popToRoot", "body": body} )
                } else {
                    GameInterface.popToRoot(JSON.stringify(params))
                }
            });
        }
    }

    return experience
})
