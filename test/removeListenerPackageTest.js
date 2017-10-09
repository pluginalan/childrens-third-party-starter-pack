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

    var eventErrorResponse = {
      "status" : "error",
      "data" : {
        "packageId" : "somePackageId",
        "error"     :  "insufficientSpace"
      }
    }

    var eventInstalledResponse = {
      "status" : "installed",
      "data" : {
        "packageId" : "somePackageId",
      }
    }

    beforeEach(function () {
      
    })

    afterEach(function () {
      sandbox.restore();
      Packages.removeAllListeners()
    });

    it('the error listener does not get called', function(done) {
      var callback = sinon.spy();
      Packages.addListener("error", callback);
      Packages.removeListener(callback);
      window._packages.callback(eventErrorResponse)
      assert.equal(callback.notCalled, true);
      done();
    })

    it('one error listener and one install listener', function(done) {
      var callback = sinon.spy();
      var secondCallback = sinon.spy();

      Packages.addListener("error", callback);
      Packages.addListener("installed", secondCallback);

      Packages.removeListener(callback);
      Packages.removeListener(callback);

      window._packages.callback(eventErrorResponse)
      window._packages.callback(eventInstalledResponse)

      assert.equal(callback.notCalled, true);
      assert.equal(secondCallback.calledOnce, true);

      done();
    })

    it('remove a listener that does not exist', function(done) {
      var nonExistingListener = function() { }
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
      Packages.addListener("progress", callback);
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

  describe('Removing an event listener for installed', function() {

    var callback = undefined;

    var eventResponse = {
      "status" : "installed",
      "data" : {
        "packageId" : "somePackageId",
      }
    }

    beforeEach(function () {
      callback = sinon.spy();
      Packages.addListener("installed", callback);
    })

    afterEach(function () {
      sandbox.restore();
    });

    it('the installed listener does not get called', function(done) {
      Packages.removeListener(callback);
      window._packages.callback(eventResponse)
      assert.equal(callback.notCalled, true);
      done();
    })
  })

  describe('Removing an event listener for installing', function() {

    var callback = undefined;

    var eventResponse = {
      "status" : "installing",
      "data" : {
        "packageId" : "somePackageId",
      }
    }

    beforeEach(function () {
      callback = sinon.spy();
      Packages.addListener("installing", callback);
    })

    afterEach(function () {
      sandbox.restore();
    });

    it('the installing listener does not get called', function(done) {
      Packages.removeListener(callback);
      window._packages.callback(eventResponse)
      assert.equal(callback.notCalled, true);
      done();
    })

  })

})
