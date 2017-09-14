define(function(require) {
    "use strict";

    var experiences = {
        config: {},
        getConfig: function() {
            if( typeof window._experience !== 'undefined' && typeof window._experience.config !== 'undefined' ) {
                return window._experience.config;
            } else {
                return this.config
            }
        },

        openExperience: function( experienceKey ) {
            if( window.webkit ) {
                window.webkit.messageHandlers.gmi.postMessage({ "name" : "openExperience",  "body" : experienceKey });
            } else {
                GameInterface.openExperience(experienceKey);
            }
        }
    }

    return experiences
});
