define(['libs/js/gmi-mobile', './storage.js', 'libs/js/downloads/package-manager'], function(gmi_platform, storage, PackageManager) {
    "use strict";

    var settingsConfig = {
        pages: [
            {
                title: "Global Settings",
                settings: [
                   {
                        "key": "audio",
                        "type": "toggle",
                        "title": "Audio",
                        "description": "Turn audio on or off"
                    },
                    {
                        "key": "motion",
                        "type": "toggle",
                        "title": "Motion",
                        "description": "Reduce background animation"
                    },
                    {
                        "key": "subtitles",
                        "type": "toggle",
                        "title": "Subtitles",
                        "description": "Show on screen subtitles"
                    }
                ]
            },
            {
                title: "Game Settings",
                settings: [
                    {
                        "key"          : "hard_mode",
                        "type"         : "toggle",
                        "title"        : "Hard Mode",
                        "description"  : "Turn hard mode on/off",
                        "defaultValue" : false
                    },
                    {
                        "key"          : "night_mode",
                        "type"         : "toggle",
                        "title"        : "Night Mode",
                        "description"  : "Turn night mode on/off",
                        "defaultValue" : false
                    },
                    {
                        "key"          : "wibbleMode",
                        "type"         : "toggle",
                        "title"        : "Wibble Mode",
                        "description"  : "this should only affect the wibble mode setting in this experience",
                        "defaultValue" : false
                    }
                ]
            }
        ]
    };

    // Create a gmi object using getGMI. If window.getGMI is defined i.e we have
    // already got the gmi library from the server, then this will be used over
    // the local one.
    var gmi = gmi_platform.getGMI({settingsConfig: settingsConfig});
    var numberOfStatsButtonClicks = 0;
    var packageManager = new PackageManager();

    //PackageManager.CommandBase = "localhost:3030/"+PackageManager.CommandBase;

    addStylesheet();

    // ----- Set up container for the example --------

    var container = document.getElementById(gmi.gameContainerId);
    var wrapper = document.createElement("div");
    var inner = document.createElement("div");
    wrapper.className = "wrapper";
    inner.className = "inner";
    appendTitle("Games Messaging Interface Examples");
    container.appendChild(wrapper);
    wrapper.appendChild(inner);

    // ---------- GMI Storage Example----------

    appendSubtitle("GMI Storage Example");
    var outputText = document.createElement("pre");
    outputText.id = "save-load-text";
    inner.appendChild(outputText);
    appendSpacer();
    appendBtn("Save", function() { storage.onSaveButton(gmi, outputText); });
    appendBtn("Load", function() { storage.onLoadButton(gmi, outputText); });
    appendHorizontalRule();


    // --------- GMI Set Audio Example ---------

    appendSubtitle("GMI Audio Example");
    var audioParagraph = appendParagraph();

    appendSpan("Game audio value: ", audioParagraph);
    audioParagraph.appendChild(createAudioLabel());

    appendSpacer();
    appendBtn("Toggle audio", function() {
        gmi.setAudio(!gmi.getAllSettings().audio);
        document.getElementById("audio-label").innerHTML = gmi.getAllSettings().audio;
    });
    appendHorizontalRule();


    // ---------- GMI Exit Example -----------
    appendSubtitle("GMI Exit Example");
    appendParagraph("Android only: at this level in the experience stack, exit will quit the app.");
    appendParagraph("Exit at this level is not supported on iOS as you can't exit an app in this manner.");
    appendBtn("Exit", function() { gmi.exit(); });
    appendHorizontalRule();


    // --------- Call Settings Function --------------

    appendSubtitle("Show Settings");

    appendBtn("Show Settings", function() {
      var showSettings = gmi.showSettings(onSettingChanged, onSettingsClosed);
      appendSpan("Settings screen requested...", settingsParagraph);
      if (!showSettings) {
        appendSpan("settings screen not provided by this host. Trigger internal one here. ", settingsParagraph);
      }
    });
    var settingsParagraph = appendParagraph();

    appendHorizontalRule();

    function onSettingsClosed() {
      appendSpan("onSettingsClosed has been called", settingsParagraph);
    }

    function onSettingChanged(key, value) {
        if (key === "audio") {
            gmi.setAudio(!gmi.getAllSettings().audio);
            document.getElementById("audio-label").innerHTML = gmi.getAllSettings().audio;
            // Toggle in game audio
            appendSpan("Audio setting toggled. ", settingsParagraph);
        }
        if (key === "hard") {
            // The chosen value will already have been persisted, and
            // will available as gmi.getAllSettings().gameData.hard
            appendSpan("Difficulty has been set to...", settingsParagraph);
            if (value) {
                appendSpan("Hard. ", settingsParagraph); //setHardMode
            }
            else {
                appendSpan("Easy. ", settingsParagraph); //setEasyMode
            }
        }
    }

    // ---------- Connectivity -------------

    appendSubtitle("Connectivity");
    var connectivityP = appendParagraph();

    function updateConnectivity(paragraph){
    packageManager.getConnectivity().then(function(response){
        connectivityCallback(response);
            })
    }

    function connectivityCallback(response) {
        connectivityP.innerHTML = response.connectionType;
    }

    packageManager.setConnectivityCallback(connectivityCallback);

    appendHorizontalRule();


    // ---------- Menu Demo -------------

    appendSubtitle("Game menu");

    gmi.config.available.forEach(function(element) {
            appendBtn(element.title, function(){
                gmi.openExperience(element.key);
        });
    });

    appendHorizontalRule();


    // ---------- Media Playback -------------

    appendSubtitle("Media Playback")

    var mediaPlayerClosedCallback = function() {
        appendSpan( "Media playback finished... ", playbackParagraph )
    }

    appendBtn( "Play Video", function() {
        gmi.playMedia( "p02mpl5y", mediaPlayerClosedCallback )
        appendSpan( "Media playback requested... ", playbackParagraph )
    })

    var playbackParagraph = appendParagraph();

    appendHorizontalRule()



    // ---------- Package Manager: Fetch Installed Package List ------------

    /**
     * This example illustrates how to retrieve a list of installed packages
     */
    appendTitle("Package Manager Examples", inner, true);

    appendSubtitle("Installed Packages");




    /**
     * Add some UI for an installed package. This consists of a div containing a delete button for the package
     * and an image read from the package itself.
     * @param pkg
     */
    function addInstalledPackageUI(pkg) {
        var div = appendDiv(installedPackagesContainer);
        div.style.backgroundColor = "#cccccc"

        // Add a delete button for this package.
        // this invokes the delete API call and, upon receiving a response updates the installed packages UI.
        appendBtn("delete ", function (pkgInfo) {
                packageManager.delete(pkgInfo.packageInfo.packageId).then(function(response) {
                    // In a more complete implementation, we'd check the status code and display suitable error UI
                    // if required, but for this simple example we'll just refresh the display.
                    getInstalledPackagesFn();
                });
            }.bind(null, pkg),
            div);

        // Add an image for this package. This illustrates how to access content within the package.
        if(pkg.packageInfo.packageId == 'gnomes'){
            appendBtn("open red_gnome", function () {
                gmi.openExperience('red_gnome')
            }, div);
            appendBtn("open blue_gnome", function () {
                gmi.openExperience('blue_gnome')
            }, div);
        }
        appendImage("/packages/"+pkg.packageInfo.packageId+"/gameLogo.png", div);
        appendBreak(div);

        // Display some package specific info, read from the packageInfo data.
        appendSpan("PackageID: "+pkg.packageInfo.packageId, div);
        appendBreak(installedPackagesContainer);

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
    appendBreak();
    appendBtn("Refresh Installed Packages", getInstalledPackagesFn);
    appendBreak();
    appendBreak();
    var installedPackagesContainer = appendDiv();
    appendBreak();

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

        if (gmi.config.downloadablePackages) {
            gmi.config.downloadablePackages.forEach(function(element) {
                appendBtn("Download "+element.title + " - (V"+element.version+")", downloadPackageFn.bind(null, element.packageId,element.url), "", downloadButtonsContainer);
                appendBreak(downloadButtonsContainer);
                appendBreak(downloadButtonsContainer);
            });

        }
        else {
            appendParagraph("The config for this experience does not contain a downloadablePackages array", downloadButtonsContainer);
        }

    }


    // build the "download" UI
    appendSubtitle("Download Packages");
    var downloadButtonsContainer = appendDiv();
    initialiseDownloadButtons();



    appendBreak();
    appendBreak();
    appendSubtitle("Download Progress");

    //var downloadingStatus = appendParagraph("Downloading Status: idle");
    var downloadStatusContainer = appendDiv();




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
        var div = appendDiv(downloadStatusContainer);
        div.style.backgroundColor = "#cccccc"
        var para = appendParagraph(message, div);

        var btn = appendBtn("cancel",
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






    // ---------- Helper Functions ----------

    function addStylesheet() {
        var link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = gmi.gameDir + 'style.css';
        link.media = 'all';
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    function appendHorizontalRule() {
        var hr = document.createElement("hr");
        inner.appendChild(hr);
    }

    function appendSpacer() {
        var div = document.createElement("div");
        inner.appendChild(div);
    }

    function appendTitle(titleStr, parent, noLogo) {
        if (!parent) {
            parent = wrapper;
        }
        var bbcLogo = document.createElement("img");
        var title = document.createElement("h1");
        if (!noLogo) {
            bbcLogo.src = gmi.gameDir + "bbc-blocks-dark.png";
            bbcLogo.className = "bbc-logo";
            bbcLogo.alt = "BBC Logo";
            parent.appendChild(bbcLogo);
        }
        title.innerHTML = titleStr;
        parent.appendChild(title);
    }

    function appendSubtitle(titleStr) {
        var title = document.createElement("h2");
        title.innerHTML = titleStr;
        inner.appendChild(title);
    }

    function appendParagraph(text, parent) {
        if (!parent) {
            parent = inner;
        }
        var paragraph = document.createElement("p");
        paragraph.innerHTML = text || '';
        parent.appendChild(paragraph);
        return paragraph;
    }

    function appendSpan(text, div) {
        var span = document.createElement("span");
        span.innerHTML = text;
        if (div) {
            div.appendChild(span);
        }
        else {
            inner.appendChild(span);
        }
    }

    function appendLink(linkText, link, div) {
        var a = document.createElement('a');
        a.innerHTML = linkText;
        a.href = link;
        if (div) {
            div.appendChild(a);
        }
        else {
            inner.appendChild(a);
        }
    }

    function appendBtn(label, onClick, parent) {
        if (!parent) {
            parent = inner;
        }
        var btn = document.createElement("button");
        btn.innerHTML = label;
        btn.onclick = onClick;
        parent.appendChild(btn);

        return btn;
    }

    function appendDiv(parent) {
        if (!parent) {
            parent = inner;
        }
        var div = document.createElement("div");
        parent.appendChild(div);
        return div;
    }


    function appendImage(url, parent) {
        if (!parent) {
            parent = inner;
        }
        var img = document.createElement("img");
        img.setAttribute("src", url);
        parent.appendChild(img);
        return img;
    }


    function appendBreak(parent) {
        if (!parent) {
            parent = inner;
        }
        var br = document.createElement("br");
        parent.appendChild(br);
    }

    function inputOnlick(event) {
        var inputEle = event.target;
        if (inputEle.value === 'Enter a message here') {
            inputEle.value = '';
            inputEle.className = 'strong-text';
        }
    }

    function inputOnBlur(event) {
        var inputEle = event.target;
        if (inputEle.value === '') {
            inputEle.value = 'Enter a message here';
            inputEle.className = '';
        }
    }

    function appendTextInput( elementID, defaultValue = undefined ) {
        var input = document.createElement("input");
        input.type = "text";
        input.id = elementID;
        input.value = defaultValue ? defaultValue : 'Enter a message here';
        input.onclick = inputOnlick;
        input.onblur = inputOnBlur;
        inner.appendChild(input);
    }

    function createAudioLabel() {
        var audioLabel = document.createElement("span");
        audioLabel.innerHTML = gmi.getAllSettings().audio;
        audioLabel.id = "audio-label";
        return audioLabel;
    }


    // --------- Settings ---------


});
