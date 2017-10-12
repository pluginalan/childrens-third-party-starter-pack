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
    
    var unknownPackage = {
        "packageId"        : "unknownPackageId",
        "basepath"         : "n/a",
        "type"             : "n/a",
        "status"           : "available",
        "dependencies"     : [],
        "metadata"         : "{}",
        "tags"             : [],
        "downloadProgress" : 0,
        "readOnly"         : false
    }

    ui_helper.appendBtn("Pop", function(){
        gmi.experiences.pop(popParams);
    });
    
    ui_helper.appendBtn("Refresh", function(){
        updatePackages()
    });

    ui_helper.appendHorizontalRule()
    ui_helper.appendImage('/packages/bundledcontentpack/pnm_logo.png');

    //packages

    function updatePackages() {
        gmi.packages.list().then((packages) => {
            console.log(packages)
            setupView(packages.concat(unknownPackage))
        }, (error) => {
            console.log("Error: " + error)
        });
    }

    updatePackages();

    gmi.gameLoaded();
    
    gmi.packages.addListener("progress", (callback) => {
            console.log(callback.packageId + " - progress")
    })
    
    gmi.packages.addListener("installing", (callback) => {
            console.log(callback.packageId + " - installing")
            updatePackages();
    })
    gmi.packages.addListener("installed", (callback) => {
            console.log(callback.packageId + " - installed")
            updatePackages();
    })
    gmi.packages.addListener("error", (callback) => {
            console.log(callback.packageId + " - error: " + callback.error)
            var element = document.getElementById(callback.packageId)
            //ui_helper.appendParagraph("error", element)
             updatePackages();
    })

    var packagesContainer = ui_helper.appendDiv();
    packagesContainer.id = "packagesContainer"

    function setupView(packages) {
        document.getElementById("packagesContainer").innerHTML = ""

        packages.forEach((aPackage) => {
            var packageSubcontainer = ui_helper.appendDiv(packagesContainer)
            packageSubcontainer.className = "package-title"
            packageSubcontainer.id = aPackage.packageId
            
            ui_helper.appendSpan(aPackage.packageId, packageSubcontainer)
            var statusLabel = ui_helper.appendSpan(aPackage.status, packageSubcontainer, "label " + aPackage.status)

            if (aPackage.readOnly) {
                ui_helper.appendSpan("readOnly", packageSubcontainer, "label read-only")
            }

            ui_helper.appendBreak(packageSubcontainer)
            ui_helper.appendBreak(packageSubcontainer)

            var buttonsContainer = ui_helper.appendDiv(packageSubcontainer)
            buttonsContainer.appendChild(ui_helper.appendBtn("Download", () => {
                gmi.packages.download(aPackage.packageId).then((successResponse) => {
                    console.log(successResponse.packageId + " - " + successResponse.action)
                    var element = document.getElementById(aPackage.packageId)
                    statusLabel.innerHTML = "downloading";
                    statusLabel.className = "label downloading"
                    ui_helper.appendParagraph("Downloading", element)
                },
                (errorResponse) => {
                    console.log(errorResponse.error)
                    var element = document.getElementById(aPackage.packageId)
                    ui_helper.appendParagraph("Downloading error - " + errorResponse.error, element)
                })
            }))

            buttonsContainer.appendChild(ui_helper.appendBtn("Cancel", () => {
                console.log("Button clicked")
            }))

            buttonsContainer.appendChild(ui_helper.appendBtn("Delete", () => {
                console.log("Button clicked")
            }))
            
            ui_helper.appendBreak(packageSubcontainer)
            
            if (aPackage.type == "content-pack" && aPackage.status == "installed"){
                ui_helper.appendImage('/packages/'+aPackage.packageId+'/'+aPackage.metadata, packageSubcontainer);
            }
            
            if (aPackage.type == "experience" && aPackage.status == "installed"){
                buttonsContainer.appendChild(ui_helper.appendBtn("Open Red", () => {
                    gmi.experiences.push('red_gnome')
                }))
                buttonsContainer.appendChild(ui_helper.appendBtn("Open Blue", () => {
                    gmi.experiences.push('blue_gnome')
                }))
                ui_helper.appendImage('/packages/'+aPackage.packageId+'/'+aPackage.metadata, packageSubcontainer);
            }

            document.getElementById("packagesContainer").append(document.createElement("hr"))

        })
    }
});
