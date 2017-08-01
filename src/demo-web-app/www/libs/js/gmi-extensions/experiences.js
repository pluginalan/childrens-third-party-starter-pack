define(function(require) {
    "use strict";

    var experiences = {
        config: {},
        get config() {
            if( typeof window._experience !== 'undefined' && typeof window._experience.config !== 'undefined' ) {
                return window._experience.config;
            } else {
                return this.config
            }
        },

        openExperience: function( experienceKey ) {
            if( window.webkit ) {
                window.webkit.messageHandlers.ami.postMessage({ "name" : "openExperience",  "body" : experienceKey });
            } else {
                GameInterface.openExperience(experienceKey);
            }
        },

        openParentExperience: function() {
            if( typeof window._experience !== 'undefined' && typeof window._experience.parent !== 'undefined') {
                if( window.webkit ) {
                    window.webkit.messageHandlers.ami.postMessage({ "name" : "openExperience",  "body" : window._experience.parent });
                } else {
                    GameInterface.openExperience(window._experience.parent);
                }
            }
        }
    }

    return experiences
});
