require("amd-loader");
//var assert = require('assert');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe("cancel download", function () {
    var downloadManager = require("../../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager");
    var packages = require("../../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages");
    var sandbox;
    const packageId = "packageId";

    describe("for valid download id", function () {

        const resolvedResponse = {
            "packageId": packageId,
            "action": "cancel"
        };

        beforeEach(function () {
            sandbox = sinon.sandbox.create()
        });

        it("should cancel with successful response", function () {
            //given
            downloadManager.cancel = sandbox.mock();

            //when
            var promise = packages.cancel(packageId);

            //then
            expect(downloadManager.cancel.called).to.be.true;
            return expect(promise).to.eventually.equal(resolvedResponse);
        });

        afterEach(function () {
            sandbox.restore()
        })
    })
});
