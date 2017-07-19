define(function(require) {
    "use strict";

    /*
     * Generic function which will return the correct AMI for the current platform
     * that the game is being run on.
     *
     */
    var getAMI = function() {

        var BaseAMI = function() {
            Object.defineProperty(BaseAMI.prototype, 'config', {
                get: function() {
                    if( typeof window._experience !== 'undefined' && typeof window._experience.config !== 'undefined') {
                        return window._experience.config;
                    }else{
                        return {}
                    }
                }
            });
        }

        function AppleAMI() {
            BaseAMI.call(this);
        }

        AppleAMI.prototype = Object.create(BaseAMI.prototype);

        AppleAMI.prototype.openExperience = function(experienceKey) {
            window.webkit.messageHandlers.ami.postMessage({ "name" : "openExperience",  "body" : experienceKey });
        };

        AppleAMI.prototype.openParentExperience = function() {
            if( typeof window._experience !== 'undefined' && typeof window._experience.parent !== 'undefined') {
                window.webkit.messageHandlers.ami.postMessage({ "name" : "openExperience",  "body" : window._experience.parent });
            }
        };

        function AndroidAMI() {
            BaseAMI.call(this);
        }

        AndroidAMI.prototype = Object.create(BaseAMI.prototype);

        AndroidAMI.prototype.openExperience = function(experienceKey) {
            GameInterface.openExperience(experienceKey);
        };

        AndroidAMI.prototype.openParentExperience = function() {
            GameInterface.openExperience(window._experience.parent);
        };

        if(window.gmiSettings.platform === 'apple') {
            return new AppleAMI();
        } else if(window.gmiSettings.platform === 'android') {
            return new AndroidAMI();
        }
    }

    var amiInstance;

    return {
        getAMI: function() {
            if(amiInstance) {
                console.warn("Attempted to create multiple copies of the AMI. Only a single instance should be created");
            }

            return amiInstance = getAMI();
        }
    }
});
