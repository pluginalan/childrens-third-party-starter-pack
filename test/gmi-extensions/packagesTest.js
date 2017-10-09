require("amd-loader");
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

describe("packages", function () {
    let downloadManager = require("../../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager");
    const packages = require("../../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages");
    let sandbox;
    const packageId = "packageId";

    const availablePackage = {
        "dependencies": [],
        "metadata": "metadata",
        "packageId": packageId,
        "tags": [],
        "type": "type"
    };

    window = {};
    window._packages = {};

    beforeEach(function () {
        sandbox = sinon.sandbox.create()
        window._packages.availablePackages = [availablePackage];
        window._packages.bundledPackages = []
    });

    describe("Cancelling a new download", function () { // jira 1681:scenario 1


        const resolvedResponse = {
            "packageId": packageId,
            "action": "cancel"
        };


        it("should cancel with successful response", function () {
            //given
            downloadManager.cancel = sandbox.mock();
            //when
            let resultPromise = packages.cancel(packageId);
            //then
            return expect(resultPromise).to.eventually.become(resolvedResponse);
        });

        it("should call downloadManager cancel", function () {
            //given
            downloadManager.cancel = sandbox.mock();
            //when
            let result = packages.cancel(packageId).then(function (resolvedJson) {
                expect(downloadManager.cancel.called).to.be.true;
                return resolvedJson;
            });
            //then
            return expect(result).to.eventually.become(resolvedResponse);
        });

    });
    describe("Cancel a download that has not begun", function () {// jira 1681:scenario 2
        const notDownloadingResponse = {
            "packageId": packageId,
            "action": "cancel",
            "error": "notDownloading"
        };
        it("Should return error notDownloading", function () {
            //given
            downloadManager.cancel = sandbox.mock();
            //when
            let resultPromise = packages.cancel(packageId);
            //then
            return expect(resultPromise).to.be.rejected.and.to.eventually.deep.equal(notDownloadingResponse);
        })
    });

    describe("Canceling an installation", function () {// jira 1681:scenario 3
        const installingResponse = {
            "packageId": packageId,
            "action": "cancel",
            "error": "installing"
        };
        it("Should return error installing", function () {
            //given
            downloadManager.cancel = sandbox.mock();
            //when
            let resultPromise = packages.cancel(packageId);
            //then
            return expect(resultPromise).to.be.rejected.then(error=>{
                expect(error.error).to.equal("installing")
            });
        })
    });

    describe("Canceling a download for an invalid package", function () {// jira 1681:scenario 4
        const invalidPackageId = "notInTheList";
        const notFoundResponse = {
            "packageId": invalidPackageId,
            "action": "cancel",
            "error": "notFound"
        };
        it("Should return error notFound", function () {
            //given
            downloadManager.cancel = sandbox.mock();
            //when
            let resultPromise = packages.cancel(invalidPackageId);
            //then
            return expect(resultPromise).to.be.rejectedWith(notFoundResponse);
        })
    });

    afterEach(function () {
        sandbox.restore();
        lablePackages = null;
        window._packages.bundledPackages = null;
    })
});
