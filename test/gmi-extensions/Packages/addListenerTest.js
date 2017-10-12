require("amd-loader");

var assert = require('assert');
var sinon = require('sinon');
var sandbox = sinon.createSandbox();
var DownloadManager = require('../../../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager.js');
var Packages = require('../../../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');

describe('add package event listener', function() {

    window = {};
    window._packages = {}
    window._packages.callback = function() {};

    describe('#addListener(eventType, eventResponse)', function() {
        var errorResponse = {
            "status" : "error",
            "data" : {
                "packageId" : "somePackageId",
                "error"     :  "unknown"
            }
        }

        var progResponse = {
            "status" : "progress",
            "data" : {
                "packageId" : "somePackageId",
                "progress"  :  0
            }
        }

        var installedResponse = {
            "status" : "installed",
            "data" : {
                "packageId" : "somePackageId",
            }
        }

        var installingResponse = {
            "status" : "installing",
            "data" : {
                "packageId" : "somePackageId",
            }
        }

        afterEach(function () {
            sandbox.restore();
            Packages.removeAllListeners();
            var callback = undefined;
        });

        it('should call a single "error" listener on an error package event', function(done) {
            var callback = sinon.spy();
            Packages.addListener("error", callback);
            window._packages.callback(errorResponse)
            assert.equal(callback.calledOnce, true);
            assert.equal(callback.calledWith(errorResponse.data), true)
            done();
        })

        it('should call more than one "error" listener on an error package event', function(done) {
            var callback = sinon.spy();
            var otherCallback = sinon.spy();
            Packages.addListener("error", callback);
            Packages.addListener("error", otherCallback);
            window._packages.callback(errorResponse)
            assert.equal(callback.calledOnce, true);
            assert.equal(otherCallback.calledOnce, true);
            done();
        })

        it('should call a "progress" listener on a progress package event', function(done) {
            var callback = sinon.spy();
            Packages.addListener("progress", callback);
            window._packages.callback(progResponse)
            assert.equal(callback.calledOnce, true);
            assert.equal(callback.calledWith(progResponse.data), true)
            done();
        })

        it('should call more than one "progress" listener on an progress package event', function(done) {
            var callback = sinon.spy();
            var otherCallback = sinon.spy();
            Packages.addListener("progress", callback);
            Packages.addListener("progress", otherCallback);
            window._packages.callback(progResponse)
            assert.equal(callback.calledOnce, true);
            assert.equal(otherCallback.calledOnce, true);
            assert.equal(callback.calledWith(progResponse.data), true)
            done();
        })

        it('should call a "installed" listener on a installed package event', function(done) {
            var callback = sinon.spy();
            Packages.addListener("installed", callback);
            window._packages.callback(installedResponse)
            assert.equal(callback.calledOnce, true);
            assert.equal(callback.calledWith(installedResponse.data), true)
            done();
        })

        it('should call more than one "installed" listener on an installed package event', function(done) {
            var callback = sinon.spy();
            var otherCallback = sinon.spy();
            Packages.addListener("installed", callback);
            Packages.addListener("installed", otherCallback);
            window._packages.callback(installedResponse)
            assert.equal(callback.calledOnce, true);
            assert.equal(otherCallback.calledOnce, true);
            assert.equal(callback.calledWith(installedResponse.data), true)
            done();
        })

        it('should call a "installing" listener on a installing package event', function(done) {
            var callback = sinon.spy();
            Packages.addListener("installing", callback);
            window._packages.callback(installingResponse)
            assert.equal(callback.calledOnce, true);
            assert.equal(callback.calledWith(installingResponse.data), true)
            done();
        })

        it('should call more than one "installing" listener on an installing package event', function(done) {
            var callback = sinon.spy();
            var otherCallback = sinon.spy();
            Packages.addListener("installing", callback);
            Packages.addListener("installing", otherCallback);
            window._packages.callback(installingResponse)
            assert.equal(callback.calledOnce, true);
            assert.equal(otherCallback.calledOnce, true);
            assert.equal(callback.calledWith(installingResponse.data), true)
            done();
        })

        it('should call the appropriate listener once for every event', function(done) {
            var callback = sinon.spy();
            var progCallback = sinon.spy();
            var installCallback = sinon.spy();
            var installingCallback = sinon.spy();

            Packages.addListener("error", callback);
            Packages.addListener("progress", progCallback);
            Packages.addListener("installed", installCallback);
            Packages.addListener("installing", installingCallback);

            window._packages.callback(errorResponse)
            window._packages.callback(progResponse)
            window._packages.callback(installingResponse)
            window._packages.callback(installedResponse)

            assert.equal(callback.calledOnce, true);
            assert.equal(progCallback.calledOnce, true);
            assert.equal(installCallback.calledOnce, true);
            assert.equal(installingCallback.calledOnce, true);

            done();
        })

        it('should throw exception if add listener incorrectly', function() {
            var errorString = null;
            var callback = sinon.spy();
            assert.throws(function() {Packages.addListener("blabla", callback)}, Error, /Unknown EventType: /);
        })

    })
})
