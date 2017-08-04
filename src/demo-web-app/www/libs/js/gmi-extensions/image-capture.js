define( function(require) {
    "use strict";

    var imageCapture = {

        images: {},
        get images() {
            return images
        },

        openCameraForImageCapture: function() {
            if( window.webkit ) {
                window.webkit.messageHandlers.gmi.postMessage( {"name": "openCamera",  "body": "image"} )
            } else {
                GameInterface.openCamera("image")
            }
        },

        openCameraForVideoCapture: function() {
            if( window.webkit ) {
                window.webkit.messageHandlers.gmi.postMessage( {"name": "openCamera",  "body": "video"} )
            } else {
                GameInterface.openCamera("video")
            }
        }
    }

    return imageCapture
});
