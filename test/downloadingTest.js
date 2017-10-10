require("amd-loader");
var assert = require('assert');
var sinon = require('sinon');
var DownloadManager = require('../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager.js');
var Networking = require('../src/demo-web-app/pnm-container/pnm/js/downloads/networking.js');

var sandbox = sinon.createSandbox();

describe('downloading metadata', function() {
    
    var emptyMetadataNetworkResponse = '{"packages":[{"metadata":"{}","packageId":"somePackageId","status":"downloading","progress":50}]}'
    var missingMetadataNetworkResponse = '{"packages":["packageId":"somePackageId","status":"downloading","progress":50}]}'
    var populatedMetadataNetworkResponse = '{"packages":[{"metadata":"{\\\"dependencies\\\":[\\\"a\\\",\\\"b\\\",\\\"c\\\"]}","packageId":"somePackageId","status":"downloading","progress":50}]}'
    var spyNetworkFn

    beforeEach( () => {
        spyNetworkFn = sandbox.stub(Networking, 'sendQuery')
    })
    
    afterEach(function () {
      sandbox.restore();
    });
    
    it('parses stringified metadata into object', function(done) {
        spyNetworkFn.resolves(emptyMetadataNetworkResponse)

        var downloadManager = new DownloadManager()
        downloadManager.downloading().then((resolvedObject)=>{
            assert.deepEqual(resolvedObject.packages[0].metadata, {});
            done()
        }).catch((rejectedResponse)=>{
            done(rejectedResponse)
        })
    })

    it('parses stringified metadata with dependencies into object', function(done) {
        spyNetworkFn.resolves(populatedMetadataNetworkResponse)

        var downloadManager = new DownloadManager()
        downloadManager.downloading().then((resolvedObject)=>{
            console.log(resolvedObject.packages[0].metadata)
            assert.deepEqual(resolvedObject.packages[0].metadata, {"dependencies":["a","b","c"]});
            done()
        }).catch((rejectedResponse)=>{
            done(rejectedResponse)
        })
    })

    /*it('raises an error if metadata is missing', function(done) {
        spyNetworkFn.resolves(missingMetadataNetworkResponse)

        var downloadManager = new DownloadManager()
        downloadManager.downloading().then((resolvedObject)=>{
            //assert.deepEqual(resolvedObject.packages[0].metadata, {});
            done()
        }).catch((rejectedResponse)=>{
            done(rejectedResponse)
        })
    })*/
    
})