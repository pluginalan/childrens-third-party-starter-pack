require("amd-loader");

// Chai
var chai = require("chai");
var spies = require("chai-spies");
chai.use(spies);

describe("packages",function () {
    var DownloadManager = require("../../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager")

    var packages = require("../../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages")
    var cancel = function() {};
    var spy = null;

    beforeEach(function () {
        spy = chai.spy(cancel);
        DownloadManager.cancel = spy;
    });

    it("Should cancel a download", function () {
        packages.cancel("somePackageId");
        chai.expect(spy).to.have.been.called();
    });
    
    afterEach(function () {
        
    })
});
