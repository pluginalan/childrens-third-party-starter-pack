require("amd-loader");
var assert = require('assert');
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');


describe('bundled packages', function() {

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
        it('If no available packages, and one bundled package, should return bundled package', function(done) {
            window._packages.availablePackages = [];
            window._packages.bundledPackages = [poniesBundledPackage];

            Packages.list().then(function(result){
                var packages = result
                assert.notEqual(packages, undefined, "list returns result")
                assert.equal(packages.length, 1, "1 package in list")
                assert.equal(packages[0].readOnly, true)
                assert.equal(packages[0].packageId, "poniesPackageId")
                assert.equal(packages[0].basepath, "/content/ponies/")
                assert.equal(packages[0].type, "type")
                assert.equal(packages[0].dependencies[0], "tanks")
                assert.equal(packages[0].dependencies[1], "menu")
                assert.equal(packages[0].metadata, "")
                assert.equal(packages[0].tags[0], "tag1")
                assert.equal(packages[0].tags[1], "tag2")
                done()
            }).catch(function(error){
                done(error)
            });
        });

        it('If no available packages, and two bundled packages, should return bundled packages', function(done) {
            window._packages.availablePackages = [];
            window._packages.bundledPackages = [poniesBundledPackage, goatsBundledPackage];

            Packages.list().then(function(result){
                var packages = result
                assert.notEqual(packages, undefined)
                assert.equal(packages.length, 2)
                done()
            }).catch(function(error){
                done(error)
            });
        });

        it('If there is one available and one bundled package, should return both packages', function(done) {
            window._packages.availablePackages = [goatsBundledPackage];
            window._packages.bundledPackages = [poniesBundledPackage];

            Packages.list().then(function(result){
                var packages = result
                assert.equal(packages.length, 2)

                var readOnlyInstalledPackages = packages.filter( pkg => {
                  return pkg.readOnly && pkg.status == "installed"
                })
                assert.equal(readOnlyInstalledPackages.length, 1)
                assert.equal(readOnlyInstalledPackages[0].packageId, "poniesPackageId")

                var availablePackages = packages.filter( pkg => {
                  return !pkg.readOnly && pkg.status == "available"
                })
                assert.equal(availablePackages.length, 1)
                assert.equal(availablePackages[0].packageId, "goatPkgId")

                done()
            }).catch(function(error){
                done(error)
            });
        });


    });
});
