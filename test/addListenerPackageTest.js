require("amd-loader");

var assert = require('assert');
var sinon = require('sinon');
var sandbox = sinon.createSandbox();
var DownloadManager = require('../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager.js');
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');

describe('add listener', function() {

  window = {};
  window.packageManagerCallback = function() {};

  describe('When listeners are added to the error callback', function() {

    var callback = undefined;

    var eventResponse = {
      "status" : "error",
      "data" : {
        "packageId" : "somePackageId",
        "error"     :  "unknown"
      }
    }

    beforeEach(function () {

    })

    afterEach(function () {
      sandbox.restore();
    });

    it('the error listener gets called', function(done) {
      var callback = sinon.spy();
      Packages.addListener("error", callback);

      window.packageManagerCallback(eventResponse)
      assert.equal(callback.calledOnce, true);
      assert.equal(callback.calledWith(eventResponse.data), true)
      done();

      })

      it('multiple error listeners gets called', function(done) {
        var callback = sinon.spy();
        var otherCallback = sinon.spy();

        Packages.addListener("error", callback);
        Packages.addListener("error", otherCallback);
        window.packageManagerCallback(eventResponse)
        assert.equal(callback.calledOnce, true);
        assert.equal(otherCallback.calledOnce, true);
        done();
      })
  })

  describe('When listeners are added to the error callback with insufficientSpace', function() {

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

    it('the error listener gets called', function(done) {
      var callback = sinon.spy();
      Packages.addListener("error", callback);

      window.packageManagerCallback(eventResponse)
      assert.equal(callback.calledOnce, true);
      assert.equal(callback.calledWith(eventResponse.data), true)
      done();

      })

      it('multiple error listeners gets called', function(done) {
        var callback = sinon.spy();
        var otherCallback = sinon.spy();

        Packages.addListener("error", callback);
        Packages.addListener("error", otherCallback);
        window.packageManagerCallback(eventResponse)
        assert.equal(callback.calledOnce, true);
        assert.equal(otherCallback.calledOnce, true);
        done();
      })
  })


  describe('When listeners are added to the progress callback', function() {

    var callback = undefined;

    var eventResponse = {
      "status" : "progress",
      "data" : {
        "packageId" : "somePackageId",
        "progress"  :  0
      }
    }

    beforeEach(function () {

    })

    afterEach(function () {
      sandbox.restore();
    });

    it('the progress listener gets called', function(done) {
      var callback = sinon.spy();
      Packages.addListener("progress", callback);
      window.packageManagerCallback(eventResponse)
      assert.equal(callback.calledOnce, true);
      assert.equal(callback.calledWith(eventResponse.data), true)

      done();

      })

      it('multiple progress listeners gets called', function(done) {
        var callback = sinon.spy();
        var otherCallback = sinon.spy();
        Packages.addListener("progress", callback);
        Packages.addListener("progress", otherCallback);
        window.packageManagerCallback(eventResponse)
        assert.equal(callback.calledOnce, true);
        assert.equal(otherCallback.calledOnce, true);
        assert.equal(callback.calledWith(eventResponse.data), true)
        done();
      })
  })

  describe('When listeners are added to the installed callback', function() {

    var callback = undefined;

    var eventResponse = {
      "status" : "installed",
      "data" : {
        "packageId" : "somePackageId",
      }
    }

    beforeEach(function () {

    })

    afterEach(function () {
      sandbox.restore();
    });

    it('the installed listener gets called', function(done) {
      var callback = sinon.spy();
      Packages.addListener("installed", callback);
      window.packageManagerCallback(eventResponse)
      assert.equal(callback.calledOnce, true);
      assert.equal(callback.calledWith(eventResponse.data), true)

      done();

      })

      it('multiple installed listeners gets called', function(done) {
        var callback = sinon.spy();
        var otherCallback = sinon.spy();
        Packages.addListener("installed", callback);
        Packages.addListener("installed", otherCallback);
        window.packageManagerCallback(eventResponse)
        assert.equal(callback.calledOnce, true);
        assert.equal(otherCallback.calledOnce, true);
        assert.equal(callback.calledWith(eventResponse.data), true)

        done();
      })
  })

  describe('When listeners are added to the installing callback', function() {

    var callback = undefined;

    var eventResponse = {
      "status" : "installing",
      "data" : {
        "packageId" : "somePackageId",
      }
    }

    beforeEach(function () {

    })

    afterEach(function () {
      sandbox.restore();
    });

    it('the installing listener gets called', function(done) {
      var callback = sinon.spy();
      Packages.addListener("installing", callback);
      window.packageManagerCallback(eventResponse)
      assert.equal(callback.calledOnce, true);
      assert.equal(callback.calledWith(eventResponse.data), true)

      done();

      })

      it('multiple installing listeners gets called', function(done) {
        var callback = sinon.spy();
        var otherCallback = sinon.spy();
        Packages.addListener("installing", callback);
        Packages.addListener("installing", otherCallback);
        window.packageManagerCallback(eventResponse)
        assert.equal(callback.calledOnce, true);
        assert.equal(otherCallback.calledOnce, true);
        assert.equal(callback.calledWith(eventResponse.data), true)

        done();
      })

  })
})
