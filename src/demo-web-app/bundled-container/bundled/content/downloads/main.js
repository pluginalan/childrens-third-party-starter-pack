define(['pnm-library/gmi-mobile', 'pnm-library/downloads/download-manager', '../js/ui-helper'],
function(gmi_platform, DownloadManager, ui_helper) {
    "use strict";

    var settingsConfig = {};

    // Create a gmi object using getGMI. If window.getGMI is defined i.e we have
    // already got the gmi library from the server, then this will be used over
    // the local one.
    var gmi = gmi_platform.getGMI({settingsConfig: settingsConfig});
    var numberOfStatsButtonClicks = 0;
    var downloadManager = new DownloadManager();

    //downloadManager.CommandBase = "localhost:3030/"+downloadManager.CommandBase;

    ui_helper.addStylesheet(gmi.gameDir);

    // ----- Set up container for the example --------

    var container = document.getElementById(gmi.gameContainerId);
    var wrapper = document.createElement("div");
    var inner = document.createElement("div");
    wrapper.className = "wrapper";
    wrapper.id = "wrapper";
    inner.className = "inner";
    inner.id = "inner";
    container.appendChild(wrapper);
    wrapper.appendChild(inner);
    ui_helper.appendTitle(gmi.gameDir, "Package Downloader Examples");

    // ---------- GMI Exit Example -----------
    ui_helper.appendBtn("Pop", function() {
      gmi.experiences.pop();
    });
    ui_helper.appendHorizontalRule();

    // ---------- Package Manager: Fetch Installed Package List ------------

    ui_helper.appendSubtitle("Available Packages");

    gmi.packages.list()
            .then((packages) => {
                setupView(packages)
            }, (error) => {
                console.log("Error: " + error)
            });

    function setupView(packages) {
        packages.forEach((aPackage) => {
            var packageContainer = ui_helper.appendDiv()
            ui_helper.appendSpan(aPackage.packageId + " ", packageContainer)

            packageContainer.appendChild(ui_helper.appendBtn("Download", () => {
                console.log("Button clicked")
            }))

            packageContainer.appendChild(ui_helper.appendBtn("Cancel", () => {
                console.log("Button clicked")
            }))

            packageContainer.appendChild(ui_helper.appendBtn("Delete", () => {
                console.log("Button clicked")
            }))

            ui_helper.appendHorizontalRule()
        })
    }
});
