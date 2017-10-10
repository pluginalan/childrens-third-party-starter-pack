require("amd-loader");

var assert = require('assert');
var sinon = require('sinon');
var sandbox = sinon.createSandbox();
var DownloadManager = require('../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager.js');
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');

describe('remove package event listener', function() {

    window = {};
    window._packages = {};
    window._packages.callback = function() {};

    describe('#removeListener(callback)', function() {

        var callback = undefined;

        var errorResponse = {
            "status" : "error",
            "data" : {
                "packageId" : "somePackageId",
                "error"     :  "insufficientSpace"
            }
        }

        var installingResponse = {
            "status" : "installing",
            "data" : {
                "packageId" : "somePackageId",
            }
        }

        var installedResponse = {
            "status" : "installed",
            "data" : {
                "packageId" : "somePackageId",
            }
        }

        var progressResponse = {
            "status" : "progress",
            "data" : {
                "packageId" : "somePackageId",
                "progress"     :  0
            }
        }

        beforeEach(function () {
            callback = sinon.spy();
        })

        afterEach(function () {
            sandbox.restore();
            Packages.removeAllListeners()
        });

        it('should remove error callback', function(done) {
            Packages.addListener("error", callback);
            Packages.removeListener(callback);
            window._packages.callback(errorResponse)
            assert.equal(callback.notCalled, true);
            done();
        })

        it('should remove progress listener', function(done) {
            Packages.addListener("progress", callback);
            Packages.removeListener(callback);
            window._packages.callback(progressResponse)
            assert.equal(callback.notCalled, true);
            done();
        })

        it('should remove installed listener', function(done) {
            Packages.removeListener(callback);
            window._packages.callback(installedResponse)
            assert.equal(callback.notCalled, true);
            done();
        })

        it('should remove installing listener', function(done) {
            Packages.removeListener(callback);
            window._packages.callback(installingResponse)
            assert.equal(callback.notCalled, true);
            done();
        })

        it('should distinguish between different event types', function(done) {
            var secondCallback = sinon.spy();
            Packages.addListener("error", callback);
            Packages.addListener("installed", secondCallback);
            Packages.removeListener(callback);
            Packages.removeListener(callback);
            window._packages.callback(errorResponse)
            window._packages.callback(installedResponse)
            assert.equal(callback.notCalled, true);
            assert.equal(secondCallback.calledOnce, true);
            done();
        })

        it('should do nothing when removing a listener that does not exist', function(done) {
            Packages.addListener("progress", callback);
            var nonExistingListener = function() { }
            Packages.removeListener(nonExistingListener)
            done()
        })
    })
})
