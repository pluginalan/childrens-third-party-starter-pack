define(function(require) {
       "use strict"

       return {

       startAccelerometer: function() {
            window.webkit.messageHandlers.gmi.postMessage({"name" : "startAccelerometer"});
       },

       stopAccelerometer: function() {
            window.clearInterval(window.timer);
            window.webkit.messageHandlers.gmi.postMessage({"name" : "stopAccelerometer"});
       },

       getAcceleration: function(callback) {
            window.gmiCallbacks[callback.name] = callback
            window.webkit.messageHandlers.gmi.postMessage({"name" : "getAcceleration", "callback" : callback.name});
       },

       logAcceleration: function() {
            window.webkit.messageHandlers.gmi.postMessage({"name" : "logAcceleration"});
       },

       watchAcceleration: function(callback) {
            window.clearInterval(window.timer);
            window.gmiCallbacks[callback.name] = callback
            window.timer = window.setInterval(function(){
              window.webkit.messageHandlers.gmi.postMessage({"name" : "getAcceleration", "callback" : callback.name});
             }, 100)
       }
    }
});
