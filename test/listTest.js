require("amd-loader");
var assert = require('assert');
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages.js');

describe('list packages', function() {

    var poniesAvailablePackage = {
        "packageId": "poniesAvailablePackageId",
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

    var poniesBundledPackage = {
        "packageId": "poniesAvailablePackageId",
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
        window._packages.availablePackages = [];
        window._packages.bundledPackages = [];
        done()
    });

    describe('#list()', function() {

        it('should return error when availablePackages is undefined',
        function(done) {
            window._packages.availablePackages = undefined;

            Packages.list().then(function(result){
                done(result)
            }).catch(function(error){
                assert.equal(error.action, "list");
                assert.equal(error.error, "unknown");
                done()
            });
        });

        it('should return empty array when there are no available packages',
        function(done) {
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

        it('should return one package in array when there is one available package',
        function(done) {
            window._packages.availablePackages = [poniesAvailablePackage];

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

        it('should return error when bundledPackages is undefined',
        function(done) {
            window._packages.availablePackages = [];
            window._packages.bundledPackages = undefined;

            Packages.list().then(function(result){
                done(result)
            }).catch(function(error){
                assert.equal(error.action, "list");
                assert.equal(error.error, "unknown");
                done()
            });
        });

        it('should return one package in the array if there is one bundled package',
        function(done) {
            window._packages.availablePackages = [];
            window._packages.bundledPackages = [poniesBundledPackage];

            Packages.list().then(function(result){
                var packages = result
                assert.notEqual(packages, undefined, "list returns result")
                assert.equal(packages.length, 1, "1 package in list")
                assert.equal(packages[0].readOnly, true)
                assert.equal(packages[0].packageId, "poniesAvailablePackageId")
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

        it('should return two packages if there are two bundledPackages',
        function(done) {
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

        it('should return two packages if there is one available and bundled package',
        function(done) {
            window._packages.availablePackages = [goatsBundledPackage];
            window._packages.bundledPackages = [poniesBundledPackage];

            Packages.list().then(function(result){
                var packages = result
                assert.equal(packages.length, 2)

                var readOnlyInstalledPackages = packages.filter( pkg => {
                    return pkg.readOnly && pkg.status == "installed"
                })
                assert.equal(readOnlyInstalledPackages.length, 1)
                assert.equal(readOnlyInstalledPackages[0].packageId, "poniesAvailablePackageId")

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
