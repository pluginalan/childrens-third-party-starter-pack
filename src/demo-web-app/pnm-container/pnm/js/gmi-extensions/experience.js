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
                return Object.freeze(window._experience.config)
            } else {
                return {}
            }
        },

        push: function(experienceKey, params) {
            return new Promise((resolve, reject) => {
                notFoundReject = reject
                if( window.webkit ) {
                    window.webkit.messageHandlers.gmi.postMessage(
                    {
                        "name" : "push",
                        "body": {
                            "experienceKey": experienceKey,
                            "params": JSON.stringify(params)
                        }
                    })

                } else {
                    GameInterface.push(experienceKey, JSON.stringify(params))
                }
            })
        },

        pop: function(params) {
            return new Promise((resolve, reject) => {
                emptyStackReject = reject
                if( window.webkit ) {
                    window.webkit.messageHandlers.gmi.postMessage(
                    {
                        "name" : "pop",
                        "body" : {
                            "params": JSON.stringify(params)
                        }
                    })

                } else {
                    GameInterface.pop(JSON.stringify(params))
                }
            });
        },

        popToRoot: function(params) {
            if( window.webkit ) {
                window.webkit.messageHandlers.gmi.popToRoot(
                {
                    "name" : "pop",
                    "body" : {
                        "params": JSON.stringify(params)
                    }
                })

            } else {
                GameInterface.popToRoot(JSON.stringify(params))
            }
        },

        getParams: function() {
            if( typeof window._experience !== 'undefined' && typeof window._experience.params !== 'undefined' ) {
                return window._experience.params
            } else {
                return {}
            }
        }
    }

    return experience
})
