define(function(require) {
       "use strict"
       
       return {
       startAccelerometer: function() {
            window.webkit.messageHandlers.gmi.postMessage({"name" : "startAccelerometer"});
       },
       
       stopAccelerometer: function() {
            window.webkit.messageHandlers.gmi.postMessage({"name" : "stopAccelerometer"});
       },
       
       getAcceleration: function() {
            window.webkit.messageHandlers.gmi.postMessage({"name" : "getAcceleration"});
       },
       
       logAcceleration: function() {
            window.webkit.messageHandlers.gmi.postMessage({"name" : "logAcceleration"});
       },
       
       addAccelerometerCallback: function( callback ) {
            window.webkit.messageHandlers.gmi.postMessage({"name" : "registerAccelerometerListener",
                                                           "callback" : callback });
       }
    }
});
