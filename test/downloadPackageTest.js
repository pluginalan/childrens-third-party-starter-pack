require("amd-loader");
var assert = require('assert');
var sinon = require('sinon');
var DownloadManager = require('../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager.js');
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');

var sandbox = sinon.createSandbox();

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

            var stubDownloadFn = sandbox.stub(DownloadManager.prototype, 'download')
            stubDownloadFn.rejects(
                {
                    packageId: 'somePackageId',
                    status: 'unknown'
                }
            )

        })

        afterEach(function () {
            sandbox.restore();
        });

        it('should reject download promise, with error notFound',
        function(done) {
            Packages.download('somePackageId').then(function(result){
                done(result)
            }).catch(function(failureResponse){
                // sinon.assert.calledOnce(DownloadManager.prototype.download)
                assert.equal(failureResponse.packageId, "somePackageId");
                assert.equal(failureResponse.action, "download");
                assert.equal(failureResponse.error, "notFound");
                done()
            });
        });
    });
});
