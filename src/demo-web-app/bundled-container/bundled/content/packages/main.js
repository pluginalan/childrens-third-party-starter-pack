define(['pnm-library/gmi-mobile', '../js/ui-helper'], function(gmi_platform, ui_helper) {
    "use strict";

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

    // Game loaded

    var popParams = {
        "last_experience": "packages",
        "method": "pop",
        "stars": "12345"
    };

    ui_helper.appendBtn("Pop", function(){
        gmi.experiences.pop(popParams);
    });

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

                var success = function( resultObject ) {
                    console.log( "success", resultObject )
                }

                var failure = function( failureObject ) {
                    console.log( "failed", failureObject )
                }

                var pid = aPackage.packageId
                var pmd = aPackage.metadataObject
                var purl = aPackage.basepath + aPackage.packageId
                purl = 

                downloadManager.download( pid, pmd, purl ).then(
                    success, failure
                )
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
