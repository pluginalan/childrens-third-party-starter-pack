require("amd-loader");
var assert = require('assert');
var sinon = require('sinon');
var DownloadManager = require('../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager.js');
var Networking = require('../src/demo-web-app/pnm-container/pnm/js/downloads/networking.js');

var sandbox = sinon.createSandbox();

describe('downloading metadata', function() {
    
    var networkResponse = '{"packages":[{"metadata":"{}","packageId":"somePackageId","status":"downloading","progress":50}]}'
    
    beforeEach( () => {
        var spyNetworkFn = sandbox.stub(Networking, 'sendQuery')
        spyNetworkFn.resolves(networkResponse)
    })
    
    afterEach(function () {
      sandbox.restore();
    });
    
    it('it parses stringified metadata into object', function(done) {
        var downloadManager = new DownloadManager()
        downloadManager.downloading().then((resolvedObject)=>{
            assert.deepEqual(resolvedObject.packages[0].metadata, {});
            done()
        }).catch((rejectedResponse)=>{
            done(rejectedResponse)
        })
    })
    
})