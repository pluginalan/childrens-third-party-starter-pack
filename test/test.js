require("amd-loader");
var assert = require('assert');
var mediaPlayer = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/media-player.js'); 
var receivedObject; 
 
beforeEach(function(done) {
  window = {}
  window.gmiCallbacks = {}
  window.webkit = {} 
  window.webkit.messageHandlers = {} 
  window.webkit.messageHandlers.gmi = {} 
  window.webkit.messageHandlers.gmi.postMessage = function(object) { 
    receivedObject = object;
  }
  done()
}); 
 
describe('media-player', function() { 
  describe('#playMedia()', function() { 
    it('should have called window.webkit.messageHandlers.gmi.postMessage', function() { 
      mediaPlayer.playMedia("oops", function() {}) 
      assert(receivedObject != undefined)
    }); 
  }); 
}); 