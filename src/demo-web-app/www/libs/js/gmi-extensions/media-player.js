define(function(require) {
    "use strict"

    return {
    	playMedia: function( vpid, onMediaPlayerClosed ) {

            window.gmiCallbacks.onMediaPlayerClosed = onMediaPlayerClosed

    		if( window.webkit ) {
    			window.webkit.messageHandlers.gmi.postMessage({ "name": "playMedia",  "vpid": vpid })
    		} else {
        		GameInterface.playMedia( vpid )
    		}
        	return true
    	}
    }
})
