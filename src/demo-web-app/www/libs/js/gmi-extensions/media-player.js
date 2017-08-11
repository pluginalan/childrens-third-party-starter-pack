define(function(require) {
    "use strict"

    return {
    	playMedia: function(VPID) {
        GameInterface.playMedia(VPID);
        return true;
    	}
    }
});
