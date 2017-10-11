require("amd-loader");
var assert = require('assert');
var sinon = require('sinon');
var DownloadManager = require('../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager.js');
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');

var sandbox = sinon.createSandbox();

describe('download package', function() {

    var poniesBundledPackage = {
        "packageId": "poniesPackageId",
        "basepath": "http://www.bbc.co.uk/",
        "type": "type",
        "dependencies": [
            "tanks",
            "menu"
        ],
        "metadata": "",
        "tags": [
            "tag1",
            "tag2"
        ],
        "status": "available"
    };

    beforeEach( () => {
        window = {};
        window._packages = {};
        window._packages.availablePackages = [];
        window._packages.bundledPackages = [];
    });

    describe('#download(packageId) -> Resolve', function() {
        var spyDownloadFn = null;

        beforeEach( () => {
            window._packages.availablePackages = [poniesBundledPackage];
            window._packages.bundledPackages = [];
            spyDownloadFn = sandbox.stub(DownloadManager.prototype, 'download')
            spyDownloadFn.resolves(
                {
                    'packages':[
                        {
                            packageId: 'poniesPackageId',
                            status: 'downloading'
                        }
                    ]
                }
            )
        })

        afterEach(function () {
            sandbox.restore();
            spyDownloadFn.restore()
        });

        it('should download an available package', function(done) {
            Packages.download('poniesPackageId').then(function(response) {
                sinon.assert.calledWith(DownloadManager.prototype.download, 'poniesPackageId', poniesBundledPackage, 'http://www.bbc.co.uk/poniesPackageId.zip')
                assert.equal("poniesPackageId", response.packageId)
                assert.equal("download", response.action)
                done()
            }).catch(function(failureResponse) {
                done(failureResponse)
            });
        })

        it('should update status in list', function(done) {
            Packages.download('poniesPackageId').then(function(response) {
                sinon.assert.calledWith(DownloadManager.prototype.download, 'poniesPackageId', poniesBundledPackage, 'http://www.bbc.co.uk/poniesPackageId.zip')

                var list = window._packages.availablePackages
                var poniesUpdatedPackage = list.find((availablePackage) => {
                    return availablePackage.packageId == 'poniesPackageId'
                })

                assert.equal('downloading', poniesUpdatedPackage.status)
                done()
            }).catch(function(failureResponse) {
                done(failureResponse)
            });
        })
    })

    describe('#download(packageId) -> Reject', function() {

        var spyingDownloadFn = null;
        var errorUnknownResolve = {
            'packages':[
                {
                    packageId: 'poniesPackageId',
                    status: 'errorUnknown'
                }
            ]
        }
        var errorOfflineResolve = {
            'packages':[
                {
                    packageId: 'poniesPackageId',
                    status: 'errorOffline'
                }
            ]
        }
        var errorNotFoundResolve = {
            'packages':[
                {
                    packageId: 'poniesPackageId',
                    status: 'errorNotFound'
                }
            ]
        }
        var errorInUseResolve = {
            'packages':[
                {
                    packageId: 'poniesPackageId',
                    status: 'errorInUse'
                }
            ]
        }

        beforeEach( () => {
            window._packages.availablePackages = [poniesBundledPackage];
            window._packages.bundledPackages = [];
            spyingDownloadFn = sandbox.stub(DownloadManager.prototype, 'download')
        })

        afterEach(function () {
            sandbox.restore();
        });

        it('should not attempt to download an unavailable package', function(done) {
            Packages.download('someOtherPackageId').then(function(response) {
                done(response)
            }).catch(function(failureResponse) {
                sinon.assert.notCalled(DownloadManager.prototype.download)
                assert.equal("someOtherPackageId", failureResponse.packageId)
                assert.equal("download", failureResponse.action)
                assert.equal("notFound", failureResponse.error)
                done()
            });
        })

        it('should return an error whe offline', function(done) {
            spyingDownloadFn.resolves(errorOfflineResolve)
            Packages.download('poniesPackageId').then(function(response) {
                done(response)
            }).catch(function(failureResponse) {
                sinon.assert.calledOnce(DownloadManager.prototype.download)
                assert.equal("poniesPackageId", failureResponse.packageId)
                assert.equal("download", failureResponse.action)
                assert.equal("offline", failureResponse.error)
                done()
            });
        })

        it('should return an error when notFound', function(done) {
            spyingDownloadFn.resolves(errorNotFoundResolve)
            Packages.download('poniesPackageId').then(function(response) {
                done(response)
            }).catch(function(failureResponse) {
                sinon.assert.calledOnce(DownloadManager.prototype.download)
                assert.equal("poniesPackageId", failureResponse.packageId)
                assert.equal("download", failureResponse.action)
                assert.equal("notFound", failureResponse.error)
                done()
            });
        })

        it('should return an error when unknown', function(done) {
            spyingDownloadFn.resolves(errorUnknownResolve)
            Packages.download('poniesPackageId').then(function(response) {
                done(response)
            }).catch(function(failureResponse) {
                sinon.assert.calledOnce(DownloadManager.prototype.download)
                assert.equal("poniesPackageId", failureResponse.packageId)
                assert.equal("download", failureResponse.action)
                assert.equal("unknown", failureResponse.error)
                done()
            });
        })

        it('should return an error when inProgress', function(done) {
            spyingDownloadFn.resolves(errorInUseResolve)
            Packages.download('poniesPackageId').then(function(response) {
                done(response)
            }).catch(function(failureResponse) {
                sinon.assert.calledOnce(DownloadManager.prototype.download)
                assert.equal("poniesPackageId", failureResponse.packageId)
                assert.equal("download", failureResponse.action)
                assert.equal("inProgress", failureResponse.error)
                done()
            });
        })
    })
});
