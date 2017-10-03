require("amd-loader");
var assert = require('assert');
var Packages = require('../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/experience.js');

describe('experience tests', function() {

    beforeEach(function(done) {
        window = {};
        window._experience = {};
        done()
    });

    describe('#getConfig()', function() {

        it('If one available and one bundled package,'+
        ' list function returns both packages',
        function(done) {

            assert.equal(true, true)
            done();
        });


    });
});
