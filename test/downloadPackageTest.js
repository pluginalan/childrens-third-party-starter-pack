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

    afterEach(function () {
        sandbox.restore();
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

        it('should reject download promise, with error notFound',
        function(done) {
            Packages.download('somePackageId').then(function(result){
                done(result)
            }).catch(function(failureResponse){
                sinon.assert.notCalled(DownloadManager.prototype.download)
                assert.equal(failureResponse.packageId, "somePackageId");
                assert.equal(failureResponse.action, "download");
                assert.equal(failureResponse.error, "notFound");
                done()
            });
        });
    });

    describe('when available packages more than one', function() {

        var spyDownloadFn = null;

        beforeEach( () => {
            window._packages.availablePackages = [{'packageId': 'goats'}];
            spyDownloadFn = sandbox.stub(DownloadManager.prototype, 'download')
            spyDownloadFn.rejects(
                {
                    packageId: 'somePackageId',
                    status: 'unknown'
                }
            )
        })

        it('should call download with the same packageId when packageId in available', function(done) {

            var test = function() {
                sinon.assert.calledOnce(DownloadManager.prototype.download)
                assert.equal("goats", spyDownloadFn.getCall(0).args[0])
                done()
            }
            Packages.download('goats').then(test).catch(test);
        })

        it('should not call download when packageId not available, and reject with notFound', function(done) {
            Packages.download('mikes').then(function(response) {
                done("should fail")
            }
            ).catch(function(failureResponse) {
                sinon.assert.notCalled(DownloadManager.prototype.download)
                assert.equal(failureResponse.packageId, "mikes");
                assert.equal(failureResponse.action, "download");
                assert.equal(failureResponse.error, "notFound");
                done()
            });
        })
    })
});
