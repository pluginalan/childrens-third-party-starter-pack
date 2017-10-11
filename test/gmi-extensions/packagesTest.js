require("amd-loader");
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

describe("packages", function () {
    let DownloadManager = require("../../src/demo-web-app/pnm-container/pnm/js/downloads/download-manager");
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
    }

    let errorResponse;

    window = {};
    window._packages = {};

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        window._packages.availablePackages = [];
        window._packages.bundledPackages = [];
        errorResponse = {
            "packageId": packageId,
            "action": "cancel",
        };
        DownloadManager.prototype.installed = sandbox.stub().returns(Promise.resolve({"packages":[]}));
    });

    describe("Cancelling a new download", function () { // jira 1681:scenario 1
        const packageManagerResolvedResponse = "resolved";
        const packageManagerRejectedResponse = "rejected";
        it("should cancel with successful response", function () {
            //given
            DownloadManager.prototype.cancel = sandbox.stub().returns(Promise.resolve(packageManagerResolvedResponse));
            DownloadManager.prototype.downloading = sandbox.stub().returns(Promise.resolve(downloadingPackage));
            //when
            let resultPromise = packages.cancel(packageId);
            //then
            return expect(resultPromise).to.eventually.become(resolvedResponse);
        });

        it("should call DownloadManager cancel", function () {
            //given
            DownloadManager.prototype.cancel = sandbox.stub().returns(Promise.resolve(packageManagerResolvedResponse));
            DownloadManager.prototype.downloading = sandbox.stub().returns(Promise.resolve(downloadingPackage));
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
            DownloadManager.prototype.cancel = sandbox.stub().returns(Promise.reject(packageManagerRejectedResponse));
            DownloadManager.prototype.downloading = sandbox.stub().returns(Promise.resolve(downloadingPackage));
            //when
            let resultPromise = packages.cancel(packageId);
            //then
            return expect(resultPromise).to.be.rejected.and.to.eventually.deep.equal(errorResponse);
        });

    });
    describe("Cancel a download that has not begun", function () {// jira 1681:scenario 2


        it("Should return error notDownloading", function () {
            //given
            errorResponse.error = "notDownloading";
            window._packages.availablePackages = [availablePackage];
            DownloadManager.prototype.downloading = sandbox.stub().returns(Promise.resolve(noPackages));
            //when
            let resultPromise = packages.cancel(packageId);
            //then
            return expect(resultPromise).to.be.rejected.and.to.eventually.deep.equal(errorResponse);
        })
    });

    describe("Canceling an installation", function () {// jira 1681:scenario 3

        it("Should return error installing", function () {
            //given
            errorResponse.error = "notDownloading";
            DownloadManager.prototype.downloading = sandbox.stub().returns(Promise.resolve(installingPackage));
            //when
            let resultPromise = packages.cancel(packageId);
            //then
            return expect(resultPromise).to.be.rejected.and.to.eventually.deep.equal(errorResponse);
        })
    });

    describe("Canceling a download for an invalid package", function () {// jira 1681:scenario 4
        const invalidPackageId = "notInTheList";

        it("Should return error notFound", function () {
            //given
            errorResponse.packageId = invalidPackageId;
            errorResponse.error = "notFound";
            DownloadManager.prototype.downloading = sandbox.stub().returns(Promise.resolve(noPackages));
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
