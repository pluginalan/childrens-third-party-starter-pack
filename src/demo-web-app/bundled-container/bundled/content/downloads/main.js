define(['pnm-library/gmi-mobile', 'pnm-library/downloads/package-manager', '../js/ui-helper'],
function(gmi_platform, PackageManager, ui_helper) {
    "use strict";

    var settingsConfig = {};

    // Create a gmi object using getGMI. If window.getGMI is defined i.e we have
    // already got the gmi library from the server, then this will be used over
    // the local one.
    var gmi = gmi_platform.getGMI({settingsConfig: settingsConfig});
    var numberOfStatsButtonClicks = 0;
    var packageManager = new PackageManager();

    //PackageManager.CommandBase = "localhost:3030/"+PackageManager.CommandBase;

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
    ui_helper.appendTitle(gmi.gameDir, "Package Downloader Exaples");

    // ---------- GMI Exit Example -----------
    ui_helper.appendBtn("Pop", function() {
      gmi.experience.pop();
    });
    ui_helper.appendHorizontalRule();

    // ---------- Package Manager: Fetch Installed Package List ------------

    ui_helper.appendSubtitle("Installed Packages");

    /**
     * Add some UI for an installed package. This consists of a div containing a delete button for the package
     * and an image read from the package itself.
     * @param pkg
     */
    function addInstalledPackageUI(pkg) {
        var div = ui_helper.appendDiv(installedPackagesContainer);
        div.style.backgroundColor = "#cccccc"

        // Add a delete button for this package.
        // this invokes the delete API call and, upon receiving a response updates the installed packages UI.
        ui_helper.appendBtn("delete ", function (pkgInfo) {
                packageManager.delete(pkgInfo.packageInfo.packageId).then(function(response) {
                    // In a more complete implementation, we'd check the status code and display suitable error UI
                    // if required, but for this simple example we'll just refresh the display.
                    getInstalledPackagesFn();
                });
            }.bind(null, pkg),
            div);

        // Add an image for this package. This illustrates how to access content within the package.
        if(pkg.packageInfo.packageId == 'gnomes'){
            ui_helper.appendBtn("open red_gnome", function () {
                gmi.experience.push('red_gnome')
            }, div);
            ui_helper.appendBtn("open blue_gnome", function () {
                gmi.experience.push('blue_gnome')
            }, div);
        }
        ui_helper.appendImage("/packages/"+pkg.packageInfo.packageId+"/gameLogo.png", div);
        ui_helper.appendBreak(div);

        // Display some package specific info, read from the packageInfo data.
        ui_helper.appendSpan("PackageID: "+pkg.packageInfo.packageId, div);
        ui_helper.appendBreak(installedPackagesContainer);

    }

    /**
     * Fetches the list of installed packages and updates the UI
     */
    var getInstalledPackagesFn = function () {

        // invoke the installed API command and for each entry add some UI for it.
        packageManager.installed().then(function (response) {

            // clear list, delete all of the document elements within the root div of the installed packages list.
            while(installedPackagesContainer.children.length) {
                installedPackagesContainer.removeChild(installedPackagesContainer.children[0]);
            }

            if (response.status === PackageManager.Status_Ok) {
                for (var ix = 0; ix < response.packages.length; ix++) {
                    var pkg = response.packages[ix];
                    addInstalledPackageUI(pkg);

                }
            }

        })
    };

    // Build the "installed packages" UI
    ui_helper.appendBreak();
    ui_helper.appendBtn("Refresh Installed Packages", getInstalledPackagesFn);
    ui_helper.appendBreak();
    ui_helper.appendBreak();
    var installedPackagesContainer = ui_helper.appendToInnerDiv();
    ui_helper.appendBreak();

    // do this when the page first loads to initially populate the installed package list
    getInstalledPackagesFn();

    // ---------- Package Manager: Download Package ------------

    /**
     * Function to track a download.
     *
     *
     * @param packageId
     */
    var monitorDownloadingFn = function trackDownloads() {
        packageManager.downloading().then(function(response) {

            // for every package listed in the response, update our UI representation.
            for (var ix = 0; ix < response.packages.length; ix++) {
                var pkg = response.packages[ix];

                switch (pkg.status) {
                    case PackageManager.Status_Downloading:
                        // downloading, update progress indicator and check again in a second.
                        updateDownloadUI(pkg.packageId, "Downloading - " + pkg.packageId + " " + pkg.progress + "%", false);
                        break;

                    case PackageManager.Status_Installing:
                        // still installing, update progress indicator and check again in a second.
                        updateDownloadUI(pkg.packageId, "Installing - " + pkg.packageId + " " + pkg.progress + "%", false);
                        break;

                    case PackageManager.Status_Installed:
                        // The download has successfully completed download and installation.
                        // this status will only appear once when we first poll after the download has completed.
                        // from this point on the download will no longer appear in the response.
                        updateDownloadUI(pkg.packageId, "Downloading; complete", true);
                        // refresh the installed list
                        getInstalledPackagesFn();
                        break;

                    default:
                        // something went wrong, show the relevant UI
                        // this status will only appear once when we first poll after the download has failed.
                        // from this point on the download will no longer appear in the response.
                        updateDownloadUI(pkg.packageId, "Downloading: error=" + pkg.status, true);
                        break;
                }
            }

            // reschedule this function to poll again in a second.
            setTimeout(monitorDownloadingFn.bind(null), 1000);
        });
    }

    /**
     * Initiates the download for the requested package. Guards against requests to donwload a package that is already in-flight (downloading or installing).
     * @param packageId - the package to download, this will be used to derive the folder it will be installed into
     * @param metaData - data captured at the time of the download request that we want to permanently associate with the download
     * @param url - URL to download the package from.
     */
    var downloadPackageFn = function(packageId, metaData, url) {

        // check if we're already downloading this package.
        // we're using our download UI list to track the state here
        var idx = findDownloadingUI(packageId);
        if (idx != -1) {
            var ui = downloadingUIs[idx];
            if (!ui.finished) {
                return;
            }
        }

        // not already in-flight so attempt to start the download

        // remove any leftover UI from a previous attempt to download this package.
        var idx = findDownloadingUI(packageId);

        if (idx != -1) {
            var ui = downloadingUIs[idx];
            ui.container.parentNode.removeChild(ui.container);
            downloadingUIs.splice(idx,1);
        }

        // create a new UI to track this download
        updateDownloadUI(packageId, "starting...", false);

        packageManager.download(packageId, url, metaData).then(function(response) {
            if (response.status === PackageManager.Status_Downloading) {
                // successfully started, so nothing to do, the tracker will update the UI.
            }
            else {
                // failed to start, so indicate this in the UI as it will not be returned in the tracker
                updateDownloadUI(packageId, "Downloading: error="+response.status, true);
            }
        });

    }

    /**
     * Removes any download buttons and repopulates reflecting the current contents of the config's donwloadablePackages array.
     */
    function initialiseDownloadButtons() {

        // clear list, delete all of the document elements within the root div of the download buttons list.
        while(downloadButtonsContainer.children.length) {
            downloadButtonsContainer.removeChild(downloadButtonsContainer.children[0]);
        }

        if (gmi.experience.getConfig().downloadablePackages) {
            gmi.experience.getConfig().downloadablePackages.forEach(function(element) {
                ui_helper.appendBtn("Download "+element.title + " - (V"+element.version+")", downloadPackageFn.bind(null, element.packageId,element.url), "", downloadButtonsContainer);
                ui_helper.appendBreak(downloadButtonsContainer);
                ui_helper.appendBreak(downloadButtonsContainer);
            });

        }
        else {
            ui_helper.appendParagraph("The config for this experience does not contain a downloadablePackages array", downloadButtonsContainer);
        }

    }


    // build the "download" UI
    ui_helper.appendSubtitle("Download Packages");
    var downloadButtonsContainer = ui_helper.appendToInnerDiv();
    initialiseDownloadButtons();



    ui_helper.appendBreak();
    ui_helper.appendBreak();
    ui_helper.appendSubtitle("Download Progress");

    //var downloadingStatus = appendParagraph("Downloading Status: idle");
    var downloadStatusContainer = ui_helper.appendToInnerDiv();

    /**
     * Start tracking downloads.
     */
    monitorDownloadingFn();

    // ---------- Notify App That Game Has Loaded And Send Stats ----------

    gmi.gameLoaded();
    gmi.sendStatsEvent('game_loaded', true, {});

    //----------  Boiler plate UI code to assist downloads examples ----------

    /**
     * Downloading UI's show the current status of an in-flight download. In addition to a status, there is also
     * a button to send a cancel request for the download. This gets replaced with a button that can delete this
     * piece of UI when it is no longer required.
     */


    var downloadingUIs = [];    // array of visible download progress UI objects


    /**
     * searches for a downloading UI using the supplied package ID as a key.
     * @param packageId
     * @returns {number|*} - the index of the UI object or -1 if not found
     */
    function findDownloadingUI(packageId) {
        var idx = downloadingUIs.findIndex(function (element) {
            return (element.packageId === packageId);
        })

        return idx;
    }


    /**
     * Adds a downloading UI object containing a status text and a button (initially a "cancel" button
     * but reconfigured as a "remove" button once the download has completed or failed.
     * @param packageId - package to add UI for
     * @param message - initial status text to display
     * @returns {Number} - the index in teh downloadingUIs array
     */
    function addDownloadingUI(packageId, message) {
        var div = ui_helper.appendDiv(downloadStatusContainer);
        div.style.backgroundColor = "#cccccc"
        var para = ui_helper.appendParagraph(message, div);

        var btn = ui_helper.appendBtn("cancel",
            function(packageId) {
                packageManager.cancel(packageId);
            }.bind(null, packageId),
            div);

        var ui = {
            packageId: packageId,
            container: div,
            paragraph: para,
            button: btn,
            finished: false
        }

        var idx = downloadingUIs.length;
        downloadingUIs.push(ui);

        return idx;
    }


    /**
     * Locates and updates a downloading UI object for the specified package ID with the given status information.
     * If a UI object cannot be found for the specified package ID, then a new one is created.
     * @param packageId - package to update the UI for.
     * @param message - the new status message.
     * @param finished - if set to true, the "cancel" button is replaced by a "remove" button
     */
    function updateDownloadUI(packageId, message, finished) {

        var idx = findDownloadingUI(packageId);

        if (idx == -1) {
            idx = addDownloadingUI(packageId,"");
        }

        if (idx != -1) {
            var ui = downloadingUIs[idx];

            ui.paragraph.innerText = "PKG: "+ packageId + " - " + message;

            if (finished) {
                ui.finished = true;
                // change cancel button to a "remove" button
                ui.button.innerHTML = "remove";
                ui.button.onclick = function(ui) {
                    var idx = downloadingUIs.findIndex(function (element) {
                        return (element == ui);
                    });

                    if (idx != -1) {
                        var ui = downloadingUIs[idx];
                        ui.container.parentNode.removeChild(ui.container);
                        downloadingUIs.splice(idx,1);
                    }
                }.bind(null,ui);
            }
        }
    }

});
