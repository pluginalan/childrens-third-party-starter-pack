define([
    'libs/js/gmi-mobile',
    './storage.js',
    'libs/js/downloads/package-manager',
    'libs/js/downloads/networking.js',
    'libs/js/media/gif'], 
    function(
        gmi_platform,
        storage,
        PackageManager,
        Networking,
        GIF) {

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

    // ---------- Media Access (Upload) ----------

    appendSubtitle("Media Album");

    var albums      = appendSelect(null, "albums", ["Album 1", "Album 2", "Album 3", "Invalid 1 /", "Invalid 2 @"]);
    albums.onchange = function (event) {
        updateThumbnails(thumbnails);
    };

    function selectedValue(element) {
        var index = element.selectedIndex;
        if (index == -1) {
            return null;
        }
        return element.options[index].value;
    }

    appendHorizontalRule();

    appendSubtitle("Media Upload");

    var canvas  = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var size    = 240;

    canvas.width  = size;
    canvas.height = size;

    function drawTree(context, x1, y1, angle, first, next, width, ratio, clear) {
        function radians(degrees) {
            return degrees * (Math.PI / 180.0);
        }

        function random(min, max) {
            return min + Math.floor(Math.random() * (max + 1 - min));
        }

        if (next == 0) {
            if (random(1, 6) <= 3) {
                return;
            }
            context.fillStyle = "#FFF";
            context.beginPath();
            context.arc(x1, y1, 4, radians(0), radians(360));
            context.fill();
            context.fillStyle = "#FAD";
            context.beginPath();
            context.arc(x1, y1, 2, radians(0), radians(360));
            context.fill();
            return;
        }        

        var length = random(1, 4) * ratio;

        var x2 = x1 + (Math.cos(radians(angle)) * next * length);
        var y2 = y1 + (Math.sin(radians(angle)) * next * length);
        
        if (clear) {
            var gradient = context.createLinearGradient(0, 0, 0, clear.height);
            gradient.addColorStop(0, "#8AF");
            gradient.addColorStop(1, "#DDF");
            context.fillStyle = gradient;

            context.clearRect(0, 0, clear.width, clear.height);
            context.rect(0, 0, clear.width, clear.height);
            context.fill();
        }

        context.fillStyle   = "#000";
        context.strokeStyle = "#0A0";
        context.lineWidth   = (width * next / first) * ratio;

        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.closePath();
        context.stroke();

        drawTree(context, x2, y2, angle - random(15, 25), first, next - 1, width, ratio);
        drawTree(context, x2, y2, angle + random(15, 25), first, next - 1, width, ratio);
    }

    function updateCanvas(canvas) {
        var iterations = 10;
        var ratio      = canvas.height / 240;
        var width      = 3;

        drawTree(context, canvas.width / 2, canvas.height, -90, iterations, iterations, width, ratio, canvas);
    }

    updateCanvas(canvas);

    inner.appendChild(canvas);

    appendBreak(inner);
    appendBreak(inner);

    appendBtn("Generate", function () {
        updateCanvas(canvas);
    }, inner); 

    function upload(type, method) {

        var title       = "title";
        var description = "description";

        function send(method, title, description, data, type, width, height) {
            var album = selectedValue(albums);

            if (method === "socket") {

                if (! (data instanceof ArrayBuffer)) {
                    throw "socket expects arraybuffer";
                }

                var socket        = new WebSocket("ws://" + window.location.host + "/socket/media");
                socket.binaryType = "arraybuffer";

                socket.onopen = function (event) {
                    socket.send(title);
                    socket.send(description);
                    socket.send(album);
                    socket.send(type);
                    socket.send(width);
                    socket.send(height);

                    var cursor = 0, length = data.byteLength, chunkSize = 1024;

                    do {
                        socket.send(data.slice(cursor, Math.min(length, cursor + chunkSize)));
                        cursor += chunkSize;
                    }
                    while (cursor < length);

                    socket.close();
                };

                socket.onclose = function (event) {
                    updateThumbnails(thumbnails);
                };

            }

            if (method === "http") {

                var string = JSON.stringify({
                    data: data, title: title, description: description, album: album
                });
                Networking.postString("media", string).then(function () {
                    updateThumbnails(thumbnails);
                });

            }
        }

        function convert(blob, conversion, callback) {
            var reader = new FileReader();

            reader.onload = function (event) {
                callback(event.target.result);
            };

            if (conversion === "arraybuffer") {
                reader.readAsArrayBuffer(blob);
            }

            if (conversion === "data-url") {
                reader.readAsDataURL(blob);
            }
        }

        if (type === "image/gif") {

            var encoder = new GIF({
                repeat: 0,
                transparent: 'rgba(0, 0, 0, 0)',
                workers: 2,
                workerScript: 'libs/js/media/gif.worker.js',
                width: size,
                height: size
            });

            encoder.on('finished', function(blob, data) {

                if (method === "http") {
                    convert(blob, "data-url", function (string) {
                        send(method, title, description, string, type, canvas.width, canvas.height);
                    });
                } 

                if (method === "socket") {
                    send(method, title, description, data.buffer, type, canvas.width, canvas.height);
                }

            });

            updateCanvas(canvas);
            encoder.addFrame(context, { delay: 100, copy: true });

            updateCanvas(canvas);
            encoder.addFrame(context, { delay: 100, copy: true });

            updateCanvas(canvas);
            encoder.addFrame(context, { delay: 100, copy: true });

            encoder.render();

        }

        if (type === "image/png" || type === "image/jpeg" || type === "image/webp") {

            if (method === "http") {
                send(method, title, description, canvas.toDataURL(type), type, canvas.width, canvas.height);
            } 

            if (method === "socket") {
                canvas.toBlob(function (blob) {
                    convert(blob, "arraybuffer", function (buffer) {
                        send(method, title, description, buffer, type, canvas.width, canvas.height);
                    });
                }, type);
            }

        }
    }

    appendBreak(inner);
    appendBreak(inner);

    appendBtn("gif  (http)", function () { upload("image/gif"  , "http"); }, inner);
    appendBtn("png  (http)", function () { upload("image/png"  , "http"); }, inner);
    appendBtn("jpeg (http)", function () { upload("image/jpeg" , "http"); }, inner);
    appendBtn("webp (http)", function () { upload("image/webp" , "http"); }, inner);

    appendBreak(inner);
    appendBreak(inner);

    appendBtn("gif  (socket)", function () { upload("image/gif"  , "socket"); }, inner);
    appendBtn("png  (socket)", function () { upload("image/png"  , "socket"); }, inner);
    appendBtn("jpeg (socket)", function () { upload("image/jpeg" , "socket"); }, inner);
    appendBtn("webp (socket)", function () { upload("image/webp" , "socket"); }, inner);

    appendHorizontalRule();    

    // ---------- Media Access (Thumbnails) ----------

    appendSubtitle("Media Thumbnails");
    var thumbnails = appendDiv(inner);
    appendHorizontalRule();

    function updateThumbnails(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        appendBtn("Refresh", function () {
            updateThumbnails(container);
        }, container);

        appendBreak(container);
        appendBreak(container);

        var subContainer = appendDiv(container);

        var album   = selectedValue(albums);
        var query   = "media?album=" + encodeURIComponent(album);
        var request = Networking.sendQuery(query).then(function (response) {
            try {
                var assets = JSON.parse(response);
                if (Array.isArray(assets)) {
                    if (assets.length > 0) {
                        for (var i = 0; i < assets.length; i++) {
                            //
                            // querystring options:
                            //
                            // - width : <pixels>
                            // - type  : image/png | image/jpeg | image/webp
                            //
                            //   no width implies return existing size
                            //   no type  implies return whatever it was saved as
                            //
                            appendImage(assets[i].url + "?width=120", subContainer);
                        }
                    } else {
                        appendParagraph("There are no images for: " + album, subContainer);
                    }
                } else {
                    throw "not an array";
                }
            }
            catch (e) {
                appendSpan("parse error:" + e, subContainer);
            }
        }).catch(function (error) {
            appendSpan("networking error:" + error, subContainer);
        });
    }

    updateThumbnails(thumbnails);

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
        gmi.playMedia( gmi.config.demo_vpid, mediaPlayerClosedCallback )
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
        return title;
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
        return input;
    }

    function createAudioLabel() {
        var audioLabel = document.createElement("span");
        audioLabel.innerHTML = gmi.getAllSettings().audio;
        audioLabel.id = "audio-label";
        return audioLabel;
    }

    function appendSelect(parent, id, options) {
        if (! parent) {
            parent = inner;
        }

        var element = document.createElement("select");
        element.id  = id;

        if (Array.isArray(options)) {
            for (var i = 0; i < options.length; i++) {
                var child   = document.createElement("option");
                child.value = options[i];
                child.text  = options[i];
                element.appendChild(child);
            }
            element.multiple      = false;
            element.selectedIndex = 0;
        }

        parent.appendChild(element);
        return element;
    }

    // --------- Settings ---------


});
