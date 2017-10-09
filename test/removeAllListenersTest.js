require("amd-loader");

var assert = require('assert');
var sinon = require('sinon');
var sandbox = sinon.createSandbox();
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');

describe('remove all listeners', function() {

  window = {};
  window._packages = {};
  window._packages.callback = function() {};

  var eventResponse = {
    "status" : "error",
    "data" : {
      "packageId" : "somePackageId",
      "error"     :  "unknown"
    }
  }

  var callback = sinon.spy();

  describe('when 4 listeners are added then remove all listeners is called', function() {
    beforeEach(function () {
      Packages.addListener("error", callback);
      Packages.addListener("installing", callback);
      Packages.addListener("installed", callback);
      Packages.addListener("progress", callback);
    })

    it('should no longer callback on any of the listeners', function() {
      Packages.removeAllListeners()
      window._packages.callback(eventResponse)
      eventResponse.status = "installing"
      window._packages.callback(eventResponse)
      eventResponse.status = "installed"
      window._packages.callback(eventResponse)
      eventResponse.status = "progress"
      window._packages.callback(eventResponse)
      assert(callback.notCalled)
    })
  })
})
