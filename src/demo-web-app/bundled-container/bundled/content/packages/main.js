define(['pnm-library/gmi-mobile', '../js/ui-helper', 'pnm-library/downloads/download-manager'], function(gmi_platform, ui_helper, DownloadManager) {
    "use strict";


    var downloadManager = new DownloadManager();

    var settingsConfig = {};

    var gmi = gmi_platform.getGMI({settingsConfig: settingsConfig});

    ui_helper.addStylesheet();

    // ----- Set up container for the example --------

    var container = document.getElementById(gmi.gameContainerId);
    var wrapper = document.createElement("div");
    var inner = document.createElement("div");
    wrapper.className = "wrapper";
    wrapper.id = "wrapper";
    inner.className = "inner";
    inner.id = "inner";

    wrapper.style.backgroundColor = gmi.experiences.getConfig().background;

    container.appendChild(wrapper);
    wrapper.appendChild(inner);
    ui_helper.appendTitle(gmi.gameDir, "Packages");

    var popParams = {
        "last_experience": "packages",
        "method": "pop",
        "stars": "12345"
    };

    ui_helper.appendBtn("Pop", function(){
        gmi.experiences.pop(popParams);
    });

    ui_helper.appendHorizontalRule()

    ui_helper.appendSubtitle("Bundled package content");
    ui_helper.appendImage('/packages/bundledcontentpack/pnm_logo.png');

    //packages
    ui_helper.appendSubtitle("Available packages");
    var packagesParagraph = ui_helper.appendParagraph();


    gmi.packages.list().then((packages) => {
        setupView(packages)
    }, (error) => {
        console.log("Error: " + error)
    });

    ui_helper.appendHorizontalRule()

    gmi.gameLoaded();

    function setupView(packages) {
        packages.forEach((aPackage) => {
            var packageContainer = ui_helper.appendDiv()
            packageContainer.className = "package-title"
            ui_helper.appendSpan(aPackage.packageId, packageContainer)
            ui_helper.appendSpan(aPackage.status, packageContainer, "label " + aPackage.status)

            if (aPackage.readOnly) {
                ui_helper.appendSpan("readOnly", packageContainer, "label read-only")
            }

            var buttonsContainer = ui_helper.appendDiv()
            buttonsContainer.appendChild(ui_helper.appendBtn("Download", () => {
                gmi.packages.download(aPackage.packageId).then((successResponse) => {
                    console.log(successResponse.packageId + " - " + successResponse.action)
                },
                (errorResponse) => {
                    console.log(errorResponse.error)
                })
            }))

            buttonsContainer.appendChild(ui_helper.appendBtn("Cancel", () => {
                console.log("Button clicked")
            }))

            buttonsContainer.appendChild(ui_helper.appendBtn("Delete", () => {
                console.log("Button clicked")
            }))

            var listenerTitle = ui_helper.appendDiv()
            listenerTitle.className = "package-title"
            ui_helper.appendSpan("Listeners", listenerTitle)

            var listenerButtons = ui_helper.appendDiv();
            listenerButtons.appendChild(ui_helper.appendBtn("Add", () => {
                console.log("Button clicked")
            }))

            listenerButtons.appendChild(ui_helper.appendBtn("Remove", () => {
                console.log("Button clicked")
            }))

            listenerButtons.appendChild(ui_helper.appendBtn("Remove all", () => {
                console.log("Button clicked")
            }))

            ui_helper.appendHorizontalRule()
        })
    }
});
