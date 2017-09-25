define([
    'pnm-library/gmi-extensions/experience',
    'pnm-library/gmi-extensions/media-player'
], function( experience, mediaPlayer  ) {

    /*
     * Generic function which will return the correct GMI for the current platform
     *  that the game is being run on.
     *
     */
    var getGMI = function(options) {

        var BaseGMI = function(options) {


            // App settings
            this.debugEnabled = window.gmiSettings.debugEnabled;
            this.options = options;
            this.callbacks = {};
            this.callbackCounter = 0;
            this.muted;

            // OG CMS Settings

            Object.defineProperty(BaseGMI.prototype, 'options', {
              get: function() {
                return options ? options : {};
              }
            });

            Object.defineProperty(BaseGMI.prototype, 'embedVars', {
              get: function() {
                return window.gmiConfiguration.embedVars;
              }
            });

            Object.defineProperty(BaseGMI.prototype, 'environment', {
              get: function() {
                return window.gmiConfiguration.environment;
              }
            });

            Object.defineProperty(BaseGMI.prototype, 'gameContainerId', {
              get: function() {
                return window.gmiConfiguration.gameContainerId;
              }
            });

            Object.defineProperty(BaseGMI.prototype, 'gameUrl', {
              get: function() {
                return window.gmiConfiguration.gameUrl;
              }
            });

            Object.defineProperty(BaseGMI.prototype, 'gameDir', {
              get: function() {
                return window.gmiConfiguration.gameDir;
              }
            });

            Object.defineProperty(BaseGMI.prototype, 'shouldShowExitButton', {
              get: function() {
                if( typeof window.gmiSettings.shouldShowExitButton !== 'undefined' ) {
                    return window.gmiSettings.shouldShowExitButton;
                }
                return true;
              }
            });

            Object.defineProperty(BaseGMI.prototype, 'shouldDisplayMuteButton', {
              get: function() {
                return true;
              }
            });

            Object.defineProperty(BaseGMI.prototype, 'shouldLongPressForSettings', {
              get: function() {
                return true;
              }
            });


        }

        BaseGMI.prototype.gameUrl = window.gmiSettings.gameUrl;

        BaseGMI.prototype.resizeFrame = function() {
            console.error('This has been deprecated on this platform')
        }

        BaseGMI.prototype.setupDebugOverrides = function() {
          var that = this;

          var console = (function(oldConsole) {

            return {
              log: function(text) {

                var msg = '';
                for (var i = 0; i < arguments.length; i++) {
                    msg += JSON.stringify(arguments[i]) + ' ';
                }

                that.debug("LOG: " + msg);
                oldConsole.log(text);

              },
              warn: function(text) {

                var msg = '';
                for (var i = 0; i < arguments.length; i++) {
                    msg += JSON.stringify(arguments[i]) + ' ';
                }

                that.debug("LOG: " + msg);
                oldConsole.warn(text);

              },
              error: function(text) {

                var msg = '';
                for (var i = 0; i < arguments.length; i++) {
                    msg += JSON.stringify(arguments[i]) + ' ';
                }

                that.debug("LOG: " + msg);
                oldConsole.error(text);

              }
            };

          }(window.console))

          window.console = console;

        }


        function AppleGMI(options) {
            BaseGMI.call(this, options);

            // Game settings
            this.settings = window.gmiSettings;

            this.os = window.gmiSettings.os;

            if(this.debugEnabled) {
                this.setupDebugOverrides();
            }
        }

        AppleGMI.prototype = Object.create(BaseGMI.prototype);

        AppleGMI.prototype.exit = function() {
            window.webkit.messageHandlers.gmi.postMessage({ "name" : "exit" });
        };

        AppleGMI.prototype.getAllSettings = function() {
            return this.settings;
        };

        AppleGMI.prototype.setGameData = function(key, value) {
            this.settings.gameData[key] = value;
            window.webkit.messageHandlers.gmi.postMessage({
                "name": "updateGameSetting",
                "body": {
                    "experienceKey": window._experience.key,
                    "key": key,
                    "value": JSON.stringify(value)
                }
            });
        };

        AppleGMI.prototype.setMuted = function(state) {
            this.settings.muted = state;
            window.webkit.messageHandlers.gmi.postMessage({ "name" : "muted", "body" : { "value" : state}});
        };

        AppleGMI.prototype.setAudio = function(state) {
        this.settings.audio = state;
        window.webkit.messageHandlers.gmi.postMessage({"name": "audio", "body": {"value": state}});
        };

        AppleGMI.prototype.setSubtitles = function(state) {
            this.settings.subtitles = state;
            window.webkit.messageHandlers.gmi.postMessage({ "name" : "subtitles", "body" : { "value" : state}});
        };

        AppleGMI.prototype.setMotion = function(state) {
            this.settings.motion = state;
            window.webkit.messageHandlers.gmi.postMessage({ "name" : "motion", "body" : { "value" : state}});
        };

        AppleGMI.prototype.setStatisticsSharing = function(state) {
        this.settings.stats = state;
        window.webkit.messageHandlers.gmi.postMessage({ "name" : "stats", "body" : { "value" : state}});
        };

        AppleGMI.prototype.sendStatsEvent = function(valueType, nameKey, additionalParams) {
            var additionalParams_str;

            if (additionalParams === undefined) {
                additionalParams_str = "";
            }
            else {
                additionalParams_str = JSON.stringify(additionalParams);
            }

        window.webkit.messageHandlers.gmi.postMessage({
            "name": "sendStatsEvent",
            "body": {
                "valueType": valueType,
                "actionName": nameKey,
                "additionalParams": additionalParams_str
            }
        });
        };

        AppleGMI.prototype.debug = function(message) {
            window.webkit.messageHandlers.gmi.postMessage({"name" : "debug", "body" : {"value": message}});
        };

        AppleGMI.prototype.gameLoaded = function() {
            window.webkit.messageHandlers.gmi.postMessage({ "name" : "gameLoaded" });
        };

        AppleGMI.prototype.openURL = function(name, link) {
            window.webkit.messageHandlers.gmi.postMessage({
                "name": "openURL",
                "body": {
                    "name": name,
                    "link": link
                }
            });
        };

        AppleGMI.prototype.showSettings = function( onSettingChangedCb, onSettingsClosed ) {
            var self = this;
            window.gmiCallbacks = {
                "onSettingChanged": function(key, value){
                    if (key === "audio") {
                        self.settings.audio = value
                    }else if (key === "muted") {
                        self.settings.audio = !value
                    }else if (key === "motion") {
                        self.settings.motion = value
                    }else if (key === "subtitles") {
                        self.settings.subtitles = value
                    }else{
                        self.settings.gameData[key] = value;
                    }
                    onSettingChangedCb(key, value)
                },
                "onSettingsClosed": onSettingsClosed
            }
            window.webkit.messageHandlers.gmi.postMessage({
                "name": "showSettings",
                "body": {
                    "experienceKey": window._experience.key,
                    "onSettingChanged": "window.gmiCallbacks.onSettingChanged",
                    "onSettingsClosed": "window.gmiCallbacks.onSettingsClosed",
                    "settingsConfig": this.options.settingsConfig
                }
            });
            return true;
       };

       AppleGMI.prototype.showPrompt = function( text ) {
            console.error( "Not implemented on iOS" )
       };

        function AndroidGMI(options) {
            BaseGMI.call(this, options);

            // Game settings
            this.settings = window.gmiSettings;

            if(this.debugEnabled) {
                this.setupDebugOverrides();
            }

        }

        AndroidGMI.prototype = Object.create(BaseGMI.prototype);

        AndroidGMI.prototype.sendStatsEvent = function(valueType, nameKey, additionalParams) {
            if(additionalParams === undefined) {
                additionalParams = {};
            }

            if(this.options.statsLabel != undefined) {
                additionalParams[this.options.statsLabel.name] = this.options.statsLabel.value;
                additionalParams_str = JSON.stringify(additionalParams);
            }

            var additionalParams_str = JSON.stringify(additionalParams);

            // <Function to send a stats event on Android platform>
            GameInterface.sendStatsEvent(valueType, nameKey, additionalParams_str);
        };

        AndroidGMI.prototype.exit = function() {
            GameInterface.quit();
        };

        AndroidGMI.prototype.getAllSettings = function() {
            return this.settings;
        };

        AndroidGMI.prototype.setGameData = function(key, value) {
            this.settings.gameData[key] = value;
            GameInterface.updateGameSetting(window._experience.key, key, JSON.stringify(value));
        };

        AndroidGMI.prototype.setMuted = function(state) {
            this.settings.muted = state;
            GameInterface.setMuted(state);
        };

         AndroidGMI.prototype.setAudio = function(state) {
            this.settings.audio = state;
            GameInterface.setAudio(state);
        };

        AndroidGMI.prototype.setSubtitles = function(state) {
            this.settings.subtitles = state;
            GameInterface.setSubtitles(state);
        };

        AndroidGMI.prototype.setMotion = function(state) {
            this.settings.motion = state;
            GameInterface.setMotion(state);
        };

        AndroidGMI.prototype.setStatisticsSharing = function(state) {
            this.settings.stats = state;
            GameInterface.setStatisticsSharing(state);
        };

        AndroidGMI.prototype.debug = function(message) {
            GameInterface.debug(message);
        };

        AndroidGMI.prototype.gameLoaded = function() {
            GameInterface.gameLoaded();
        };

        AndroidGMI.prototype.openURL = function(name, link) {
            GameInterface.openURL(name, link);
        };

        AndroidGMI.prototype.showSettings = function(onSettingChangedCb, onSettingsClosed) {
            var self = this;
            window.gmiCallbacks = {
                "onSettingChanged": function(key, value){
                    if (key === "audio") {
                        self.settings.audio = value
                    } else if (key === "muted") {
                        self.settings.audio = !value
                    } else if (key === "motion") {
                        self.settings.motion = value
                    } else if (key === "subtitles") {
                        self.settings.subtitles = value
                    } else {
                        self.settings.gameData[key] = value;
                    }
                    onSettingChangedCb(key, value)
                },
                "onSettingsClosed": onSettingsClosed
            }

            GameInterface.showSettings(window._experience.key, "window.gmiCallbacks.onSettingChanged", "window.gmiCallbacks.onSettingsClosed", JSON.stringify(this.options));

            return true;
        };

        if(window.gmiSettings.platform === 'apple') {
            return new AppleGMI(options);
        } else if(window.gmiSettings.platform === 'android') {
            return new AndroidGMI(options);
        }
    }

    var gmiInstance;

    return {
        getGMI: function(options) {
            if(gmiInstance) {
                console.warn("Attempted to create multiple copies of the GMI. Only a single instance should be created");
            }

            if( options !== undefined ) {
                for( var page in options.settingsConfig.pages ) {
                    for( var setting in options.settingsConfig.pages[page].settings ) {
                        var currentSetting = options.settingsConfig.pages[page].settings[setting]

                        if( currentSetting.hasOwnProperty( "defaultValue" ) ) {
                            if( currentSetting.key != "muted" && currentSetting.key != "audio" && currentSetting.key != "subtitles" && currentSetting.key != "motion" ) {
                                if( !window.gmiSettings.gameData.hasOwnProperty(currentSetting.key) ) {
                                    window.gmiSettings.gameData[currentSetting.key] = currentSetting.defaultValue
                                }
                            }
                        }
                    }
                }
            }

            var gmiInstance = getGMI(options)
            gmiInstance.experience = Object.assign( {} , experience )
            return Object.assign( gmiInstance, mediaPlayer )
        }
    }
});
