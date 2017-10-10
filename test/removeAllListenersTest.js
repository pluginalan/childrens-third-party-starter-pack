require("amd-loader");

var assert = require('assert');
var sinon = require('sinon');
var sandbox = sinon.createSandbox();
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');

describe('remove all listeners', function() {
    describe('#removeAllListeners()', function() {
        var callback = sinon.spy();

        var eventResponse = {
            "status" : "error",
            "data" : {
                "packageId" : "somePackageId",
                "error"     :  "unknown"
            }
        }

        it('should result in no listeners being called afterwards', function() {

            window = {};
            window._packages = {};
            window._packages.callback = function() {};

            Packages.addListener("error", callback);
            Packages.addListener("installing", callback);
            Packages.addListener("installed", callback);
            Packages.addListener("progress", callback);

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
