require("amd-loader");

var assert = require('assert');
var sinon = require('sinon');
var sandbox = sinon.createSandbox();
var DownloadManager = require('../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager.js');
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');

describe('remove listener', function() {

  window = {};
  window._packages = {};
  window._packages.callback = function() {};

  describe('Removing an event listener for error', function() {

    var callback = undefined;

    var eventResponse = {
      "status" : "error",
      "data" : {
        "packageId" : "somePackageId",
        "error"     :  "insufficientSpace"
      }
    }

    beforeEach(function () {
    })

    afterEach(function () {
      sandbox.restore();
    });

    it('the error listener does not get called', function(done) {
      var callback = sinon.spy();
      Packages.addListener("error", callback);
      Packages.removeListener(callback);
      window._packages.callback(eventResponse)
      assert.equal(callback.notCalled, true);
      done();
    })

    it('remove a listener that does not exist', function(done) {
      var nonExistingListener = function() {}
      Packages.removeListener(nonExistingListener)
      done()
    })

  })

  describe('Removing an event listener for progress', function() {

    var callback = undefined;

    var eventResponse = {
      "status" : "progress",
      "data" : {
        "packageId" : "somePackageId",
        "progress"     :  0
      }
    }

    beforeEach(function () {
      callback = sinon.spy();
      Packages.addListener("error", callback);
    })

    afterEach(function () {
      sandbox.restore();
    });

    it('the error listener does not get called', function(done) {
      Packages.removeListener(callback);
      window._packages.callback(eventResponse)
      assert.equal(callback.notCalled, true);
      done();
    })
  })

})
