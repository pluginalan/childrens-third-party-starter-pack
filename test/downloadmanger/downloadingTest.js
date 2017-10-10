require("amd-loader");
var assert = require('assert');
var sinon = require('sinon');
var DownloadManager = require('../../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager.js');
var Networking = require('../../src/demo-web-app/pnm-container/pnm/js/downloads/networking.js');

var sandbox = sinon.createSandbox();

describe('downloading response has metadataObject', function() {
    
    var emptyMetadataNetworkResponse = '{"packages":[{"metadata":"{}","packageId":"somePackageId","status":"downloading","progress":50}]}'
    var missingMetadataNetworkResponse = '{"packages":[{"packageId":"somePackageId","status":"downloading","progress":50}]}'
    var populatedMetadataNetworkResponse = '{"packages":[{"metadata":"{\\\"dependencies\\\":[\\\"a\\\",\\\"b\\\",\\\"c\\\"]}","packageId":"somePackageId","status":"downloading","progress":50}]}'
    var spyNetworkFn

    beforeEach( () => {
        spyNetworkFn = sandbox.stub(Networking, 'sendQuery')
    })
    
    afterEach(function () {
      sandbox.restore();
    });
    
    it('should parse stringified metadata into JS Object', function(done) {
        spyNetworkFn.resolves(emptyMetadataNetworkResponse)

        var downloadManager = new DownloadManager()
        downloadManager.downloading().then((resolvedObject)=>{
            assert.deepEqual(resolvedObject.packages[0].metadata, {});
            done()
        }).catch((rejectedResponse)=>{
            done(rejectedResponse)
        })
    })

    it('should parse stringified metadata into JS Object with dependencies', function(done) {
        spyNetworkFn.resolves(populatedMetadataNetworkResponse)

        var downloadManager = new DownloadManager()
        downloadManager.downloading().then((resolvedObject)=>{
            assert.deepEqual(resolvedObject.packages[0].metadata, {"dependencies":["a","b","c"]});
            done()
        }).catch((rejectedResponse)=>{
            done(rejectedResponse)
        })
    })

    it('should set metadata to null if missing in network response', function(done) {
        spyNetworkFn.resolves(missingMetadataNetworkResponse)
    
        var downloadManager = new DownloadManager()
        downloadManager.downloading().then((resolvedObject)=>{
            console.log(resolvedObject.packages[0].metadata);
            assert.ok(resolvedObject.packages[0].metadata === null);
            done()
        }).catch((rejectedResponse)=>{
            done(rejectedResponse)
        })
    })
    
})