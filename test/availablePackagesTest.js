require("amd-loader");
var assert = require('assert');
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');


describe('available packages', function() {

    var poniesPackage = {
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

    beforeEach(function(done) {
        window = {};
        window._packages = {};
        window._packages.availablePackages = [];
        window._packages.bundledPackages = [];

        done()
    });

    describe('#list()', function() {

      it('If availablePackages is undefined then reject promise', function(done) {
          window._packages.availablePackages = undefined;

          Packages.list().then(function(result){
              done(result)
          }).catch(function(error){
              assert.equal(error.action, "list");
              assert.equal(error.error, "unknown");
              done()
          });
      });


        it('If no available packages do not show any available packages', function(done) {
            window._packages.availablePackages = [];

            Packages.list().then(function(result){
                var packages = result
                assert.notEqual(packages, undefined, "list returns result")
                assert.equal(packages.length, 0, "0 package in list")
                done()
            }).catch(function(error){
                done(error)
            });
        });

        it('If there is one available package show one available package', function(done) {
            window._packages.availablePackages = [poniesPackage];

            Packages.list().then(function(result){
                var packages = result
                assert.notEqual(packages, undefined, "list returns result")
                assert.equal(packages.length, 1, "1 package in list")
                assert.equal(packages[0].status, "available")
                assert.equal(packages[0].downloadProgress, 0)
                assert.equal(packages[0].readOnly, false)
                done()
            }).catch(function(error){
                done(error)
            });
        });
    });
});
