require("amd-loader");

var assert = require('assert');
var sinon = require('sinon');
var sandbox = sinon.createSandbox();
var DownloadManager = require('../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager.js');
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');

describe('add listener', function() {

  window = {};
  window._packages = {}
  window._packages.callback = function() {};

  describe('When listeners are added to the error callback', function() {

    var callback = undefined;

    var eventResponse = {
      "status" : "error",
      "data" : {
        "packageId" : "somePackageId",
        "error"     :  "unknown"
      }
    }

    afterEach(function () {
      sandbox.restore();
      Packages.removeAllListeners();
    });

    it('the error listener gets called', function(done) {
      var callback = sinon.spy();
      Packages.addListener("error", callback);

      window._packages.callback(eventResponse)
      assert.equal(callback.calledOnce, true);
      assert.equal(callback.calledWith(eventResponse.data), true)
      done();

      })

      it('multiple error listeners gets called', function(done) {
        var callback = sinon.spy();
        var otherCallback = sinon.spy();

        Packages.addListener("error", callback);
        Packages.addListener("error", otherCallback);
        window._packages.callback(eventResponse)
        assert.equal(callback.calledOnce, true);
        assert.equal(otherCallback.calledOnce, true);
        done();
      })

      it('one error listener one progress listener - error gets called', function(done) {
        var callback = sinon.spy();
        var otherCallback = sinon.spy();

        Packages.addListener("error", callback);
        Packages.addListener("progress", otherCallback);
        window._packages.callback(eventResponse)
        assert.equal(callback.calledOnce, true);
        assert.equal(otherCallback.notCalled, true);
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
      window._packages.callback(eventResponse)
      assert.equal(callback.calledOnce, true);
      assert.equal(callback.calledWith(eventResponse.data), true)
      done();

      })

      it('multiple error listeners gets called', function(done) {
        var callback = sinon.spy();
        var otherCallback = sinon.spy();
        Packages.addListener("error", callback);
        Packages.addListener("error", otherCallback);
        window._packages.callback(eventResponse)
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
      window._packages.callback(eventResponse)
      assert.equal(callback.calledOnce, true);
      assert.equal(callback.calledWith(eventResponse.data), true)

      done();

      })

      it('multiple progress listeners gets called', function(done) {
        var callback = sinon.spy();
        var otherCallback = sinon.spy();
        Packages.addListener("progress", callback);
        Packages.addListener("progress", otherCallback);
        window._packages.callback(eventResponse)
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
      window._packages.callback(eventResponse)
      assert.equal(callback.calledOnce, true);
      assert.equal(callback.calledWith(eventResponse.data), true)

      done();

      })

      it('multiple installed listeners gets called', function(done) {
        var callback = sinon.spy();
        var otherCallback = sinon.spy();
        Packages.addListener("installed", callback);
        Packages.addListener("installed", otherCallback);
        window._packages.callback(eventResponse)
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
      window._packages.callback(eventResponse)
      assert.equal(callback.calledOnce, true);
      assert.equal(callback.calledWith(eventResponse.data), true)

      done();

      })

      it('multiple installing listeners gets called', function(done) {
        var callback = sinon.spy();
        var otherCallback = sinon.spy();
        Packages.addListener("installing", callback);
        Packages.addListener("installing", otherCallback);
        window._packages.callback(eventResponse)
        assert.equal(callback.calledOnce, true);
        assert.equal(otherCallback.calledOnce, true);
        assert.equal(callback.calledWith(eventResponse.data), true)
        done();
      })

  })
})
