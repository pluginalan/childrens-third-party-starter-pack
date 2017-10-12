require("amd-loader");
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

describe("cancel packages", function () {
    let DownloadManager = require("../../../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager");
    const packages = require("../../../src/demo-web-app/pnm-container/pnm/js/gmi-extensions/packages");
    let sandbox;
    const packageId = "packageId";

    const availablePackage = {
        "dependencies": [],
        "metadata": "metadata",
        "packageId": packageId,
        "tags": [],
        "type": "type"
    };

    const downloadingPackage = {
        "packages": [{
            "dependencies": [],
            "metadata": {
                "packageId": packageId
            },
            "tags": [],
            "type": "type",
            "status": "downloading",
            "progress": 0
        }]
    };

    const installingPackage = {
        "packages": [{
            "dependencies": [],
            "metadata": {
                "packageId": packageId
            },
            "packageId": packageId,
            "tags": [],
            "type": "type",
            "status": "installing",
            "progress": 0
        }]
    };

    const resolvedResponse = {
        "packageId": packageId,
        "action": "cancel"
    };

    const noPackages = {
        "packages": []
    };

    let errorResponse;

    window = {};
    window._packages = {};

    beforeEach(function () {
        sandbox = sinon.createSandbox();
        window._packages.availablePackages = [];
        window._packages.bundledPackages = [];
        errorResponse = {
            "packageId": packageId,
            "action": "cancel",
        };

    });

    describe("#cancel()", function () { // jira 1681:scenario 1
        const packageManagerResolvedResponse = "resolved";
        const packageManagerRejectedResponse = "rejected";
        it("should cancel a download with successful response", function () {
            //given
            sandbox.stub(DownloadManager.prototype, 'installed').resolves(noPackages);
            sandbox.stub(DownloadManager.prototype, 'cancel').resolves(packageManagerResolvedResponse);
            sandbox.stub(DownloadManager.prototype, 'downloading').resolves(downloadingPackage);
            //when
            let resultPromise = packages.cancel(packageId);
            //then
            return expect(resultPromise).to.eventually.become(resolvedResponse);
        });

        it("should call DownloadManager cancel", function () {
            //given
            sandbox.stub(DownloadManager.prototype, 'installed').resolves(noPackages);
            sandbox.stub(DownloadManager.prototype, 'cancel').resolves(packageManagerResolvedResponse);
            sandbox.stub(DownloadManager.prototype, 'downloading').resolves(downloadingPackage);
            //when
            let result = packages.cancel(packageId).then(function (resolvedJson) {
                expect(DownloadManager.prototype.cancel.called).to.be.true;
                return resolvedJson;
            });
            //then
            return expect(result).to.eventually.become(resolvedResponse);
        });

        it("should return unknown error on package-manager.cancel fail", function () {
            //given
            errorResponse.error = "unknown";
            sandbox.stub(DownloadManager.prototype, 'installed').resolves(noPackages);
            sandbox.stub(DownloadManager.prototype, 'cancel').rejects(packageManagerRejectedResponse);
            sandbox.stub(DownloadManager.prototype, 'downloading').resolves(downloadingPackage);
            //when
            let resultPromise = packages.cancel(packageId);
            //then
            return expect(resultPromise).to.be.rejected.and.to.eventually.deep.equal(errorResponse);
        });

    });
    describe("#cancel()", function () {// jira 1681:scenario 2


        it("should return error notDownloading when download not started", function () {
            //given
            errorResponse.error = "notDownloading";
            sandbox.stub(DownloadManager.prototype, 'installed').resolves(noPackages);
            window._packages.availablePackages = [availablePackage];
            sandbox.stub(DownloadManager.prototype, 'downloading').resolves(noPackages);
            //when
            let resultPromise = packages.cancel(packageId);
            //then
            return expect(resultPromise).to.be.rejected.and.to.eventually.deep.equal(errorResponse);
        })
    });

    describe("cancel()", function () {// jira 1681:scenario 3

        it("Should return error when package is installing", function () {
            //given
            errorResponse.error = "notDownloading";
            sandbox.stub(DownloadManager.prototype, 'installed').resolves(noPackages);
            sandbox.stub(DownloadManager.prototype, 'downloading').resolves(installingPackage);
            //when
            let resultPromise = packages.cancel(packageId);
            //then
            return expect(resultPromise).to.be.rejected.and.to.eventually.deep.equal(errorResponse);
        })
    });

    describe("#cancel()", function () {// jira 1681:scenario 4
        const invalidPackageId = "notInTheList";

        it("Should return error notFound when cancel invalid package", function () {
            //given
            errorResponse.packageId = invalidPackageId;
            errorResponse.error = "notFound";
            sandbox.stub(DownloadManager.prototype, 'installed').resolves(noPackages);
            sandbox.stub(DownloadManager.prototype, 'downloading').resolves(noPackages);
            //when
            let resultPromise = packages.cancel(invalidPackageId);
            //then
            return expect(resultPromise).to.be.rejectedWith(errorResponse);
        })
    });

    afterEach(function () {
        sandbox.restore();
        window._packages.availablePackages = null;
        window._packages.bundledPackages = null;
    })
});
