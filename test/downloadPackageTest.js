require("amd-loader");
var assert = require('assert');
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');

describe('download package', function() {

    beforeEach( () => {
        window = {};
        window._packages = {};
        window._packages.availablePackages = [];
        window._packages.bundledPackages = [];
    });

    describe('when available packages is empty', function() {

        beforeEach( () => {
            window._packages.availablePackages = [];
        })

        it('should reject download promise, with error notFound',
        function(done) {
            Packages.download('somePackageId').then(function(result){
                done(result)
            }).catch(function(failureResponse){
                assert.equal(failureResponse.packageId, "somePackageId");
                assert.equal(failureResponse.action, "download");
                assert.equal(failureResponse.error, "notFound");
                done()
            });
        });
    });
});
