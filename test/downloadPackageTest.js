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

  describe('when online, and there are available packages', function() {
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

    it('calls download when it is given an id which is in availablePackages', function(done) {
      Packages.download('poniesPackageId').then(function(response) {
        sinon.assert.calledWith(DownloadManager.prototype.download, 'poniesPackageId', poniesBundledPackage, 'http://www.bbc.co.uk/poniesPackageId')
        assert.equal("poniesPackageId", response.packageId)
        assert.equal("download", response.action)
        done()
      }).catch(function(failureResponse) {
        done(failureResponse)
      });
    })

    it('does not call download when it is given an id which is not in availablePackages', function(done) {
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

    it('should update status in list, if download was called', function(done) {
      Packages.download('poniesPackageId').then(function(response) {
        sinon.assert.calledWith(DownloadManager.prototype.download, 'poniesPackageId', poniesBundledPackage, 'http://www.bbc.co.uk/poniesPackageId')

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

  describe('when the download manager is offline', function() {

    var spyingDownloadFn = null;

    beforeEach( () => {
      window._packages.availablePackages = [poniesBundledPackage];
      window._packages.bundledPackages = [];
      spyingDownloadFn = sandbox.stub(DownloadManager.prototype, 'download')
      spyingDownloadFn.resolves (
        {
          'packages':[
            {
              packageId: 'poniesPackageId',
              status: 'errorOffline'
            }
          ]
        }
      )
    })

    afterEach(function () {
      sandbox.restore();
    });

    it('returns an error with value offline', function(done) {
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
  })

  describe('when the packageId or the URL generated by Packages is considered malformed by the download manager', function() {

    var spyingDownloadFn = null;

    beforeEach( () => {
      window._packages.availablePackages = [poniesBundledPackage];
      window._packages.bundledPackages = [];
      spyingDownloadFn = sandbox.stub(DownloadManager.prototype, 'download')
      spyingDownloadFn.resolves (
        {
          'packages':[
            {
              packageId: 'poniesPackageId',
              status: 'errorNotFound'
            }
          ]
        }
      )
    })

    afterEach(function () {
      sandbox.restore();
    });

    it('returns an error with value notFound', function(done) {
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
  })

  describe('when the download manager throws an unknown error', function() {

    var spyingDownloadFn = null;

    beforeEach( () => {
      window._packages.availablePackages = [poniesBundledPackage];
      window._packages.bundledPackages = [];
      spyingDownloadFn = sandbox.stub(DownloadManager.prototype, 'download')
      spyingDownloadFn.resolves (
        {
          'packages':[
            {
              packageId: 'poniesPackageId',
              status: 'errorUnknown'
            }
          ]
        }
      )
    })

    afterEach(function () {
      sandbox.restore();
    });

    it('returns an error with value unknown', function(done) {
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
  })

  describe('when the download manager is already downloading from the URL generated by Packages', function() {

    var spyingDownloadFn = null;

    beforeEach( () => {
      window._packages.availablePackages = [poniesBundledPackage];
      window._packages.bundledPackages = [];
      spyingDownloadFn = sandbox.stub(DownloadManager.prototype, 'download')
      spyingDownloadFn.resolves (
        {
          'packages':[
            {
              packageId: 'poniesPackageId',
              status: 'errorInUse'
            }
          ]
        }
      )
    })

    afterEach(function () {
      sandbox.restore();
    });

    it('returns an error with value inProgress', function(done) {
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
