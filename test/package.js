require("amd-loader");
var assert = require('assert');
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');


describe('packages', function() {

    var poniesBundledPackage = {
      "packageId": "poniesPackageId",
      "basepath": "/content/ponies/",
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

    var goatsBundledPackage = {
      "packageId": "goatPkgId",
      "basepath": "/content/goats/",
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

    beforeEach(function(done) {
        window = {};
        window._packages = {};
        done()
    });

    describe('#list()', function() {
        it('If no available packages, and one bundled package, should show bundled package', function(done) {
            window._packages.availablePackages = [];
            window._packages.bundledPackages = [poniesBundledPackage];

            Packages.list().then(function(result){
                var packages = result
                assert.notEqual(packages, undefined, "list returns result")
                assert.equal(packages.length, 1, "1 package in list")
                done()
            }).catch(function(error){
                done(error)
            });
        });
    });
});
