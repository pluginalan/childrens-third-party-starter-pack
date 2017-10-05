require("amd-loader");


// Get Download manager
var DownloadManager = require("../../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager")

// Chai stuff
var chai = require("chai");
var spies = require("chai-spies");

chai.use(spies);

var should = chai.should()
var expect = chai.expect

//Mocking cancel
var cancel = function() {};
var spy = chai.spy(cancel);
DownloadManager.cancel = spy;

describe("packages",function () {

    var packages = require("../../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages")

    beforeEach(function () {



    });
    it("Should cancel a download", function () {
        packages.cancel("somePackageId");
        expect(spy).to.have.been.called();
    });
});
