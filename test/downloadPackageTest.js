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
      ]
    };

    beforeEach( () => {
        window = {};
        window._packages = {};
        window._packages.availablePackages = [];
        window._packages.bundledPackages = [];
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('when there are available packages', function() {

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

    })
});
