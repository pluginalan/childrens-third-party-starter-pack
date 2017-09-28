define(['pnm-library/gmi-mobile', './storage', 'pnm-library/downloads/package-manager', '../js/ui-helper'],
function(gmi_platform, storage, PackageManager, ui_helper) {
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

    ui_helper.addStylesheet(gmi.gameDir);

    // ----- Set up container for the example --------

    var container = document.getElementById(gmi.gameContainerId);
    var wrapper = document.createElement("div");
    var inner = document.createElement("div");
    wrapper.className = "wrapper";
    wrapper.id = "wrapper";
    inner.className = "inner";
    inner.id = "inner";
    wrapper.appendChild(inner);
    container.appendChild(wrapper);
    ui_helper.appendTitle(gmi.gameDir, "Games Messaging Interface Examples");

    // ---------- Params ----------

    ui_helper.appendSubtitle("Experience params");
    var params = gmi.experience.getParams();
    if (Object.keys(params).length === 0 && params.constructor === Object) {
        params = {"params": "no params defined"};
    }
    ui_helper.appendParagraph(JSON.stringify(params));
    ui_helper.appendSpacer();
    ui_helper.appendHorizontalRule();


    // ---------- GMI Storage Example----------

    ui_helper.appendSubtitle("GMI Storage Example");
    var outputText = document.createElement("pre");
    outputText.id = "save-load-text";
    inner.appendChild(outputText);
    ui_helper.appendSpacer();
    ui_helper.appendBtn("Save", function() { storage.onSaveButton(gmi, outputText); });
    ui_helper.appendBtn("Load", function() { storage.onLoadButton(gmi, outputText); });
    ui_helper.appendHorizontalRule();


    // --------- GMI Set Audio Example ---------

    ui_helper.appendSubtitle("GMI Audio Example");
    var audioParagraph = ui_helper.appendParagraph();

    ui_helper.appendSpan("Game audio value: ", audioParagraph);
    audioParagraph.appendChild(ui_helper.createAudioLabel(gmi.getAllSettings().audio));

    ui_helper.appendSpacer();
    ui_helper.appendBtn("Toggle audio", function() {
        gmi.setAudio(!gmi.getAllSettings().audio);
        document.getElementById("audio-label").innerHTML = gmi.getAllSettings().audio;
    });

    ui_helper.appendHorizontalRule();


    // ---------- GMI Exit Example -----------
    ui_helper.appendSubtitle("GMI Exit Example");
    ui_helper.appendParagraph("Android only: at this level in the experience stack, exit will quit the app.");
    ui_helper.appendParagraph("Exit at this level is not supported on iOS as you can't exit an app in this manner.");
    ui_helper.appendBtn("Exit", function() {
        gmi.exit();
    });


    ui_helper.appendBtn("Pop", function() {
        gmi.experience.pop().catch(
            function(rejected){
                console.log(rejected.error)
                ui_helper.appendSpan(rejected.error+ " ", popParagraph)
            }
        );
    });

    var popParagraph = ui_helper.appendParagraph();

    ui_helper.appendHorizontalRule();


    // --------- Call Settings Function --------------

    ui_helper.appendSubtitle("Show Settings");

    ui_helper.appendBtn("Show Settings", function() {
      var showSettings = gmi.showSettings(onSettingChanged, onSettingsClosed);
      ui_helper.appendSpan("Settings screen requested...", settingsParagraph);
      if (!showSettings) {
        ui_helper.appendSpan("settings screen not provided by this host. Trigger internal one here. ", settingsParagraph);
      }
    });
    var settingsParagraph = ui_helper.appendParagraph();

    ui_helper.appendHorizontalRule();

    function onSettingsClosed() {
      ui_helper.appendSpan("onSettingsClosed has been called");
    }

    function onSettingChanged(key, value) {
        if (key === "audio") {
            gmi.setAudio(!gmi.getAllSettings().audio);
            document.getElementById("audio-label").innerHTML = gmi.getAllSettings().audio;
            // Toggle in game audio
            ui_helper.appendSpan("Audio setting toggled. ", settingsParagraph);
        }
        if (key === "hard") {
            // The chosen value will already have been persisted, and
            // will available as gmi.getAllSettings().gameData.hard
            ui_helper.appendSpan("Difficulty has been set to...", settingsParagraph);
            if (value) {
                ui_helper.appendSpan("Hard. ", settingsParagraph); //setHardMode
            }
            else {
                ui_helper.appendSpan("Easy. ", settingsParagraph); //setEasyMode
            }
        }
    }

    ui_helper.appendSubtitle("Connectivity");
    var connectivityP = ui_helper.appendParagraph();

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

    ui_helper.appendSubtitle("Game menu");

    var pushParams = {
        "last_experience": "menu",
        "method": "push",
        "theme": "christmas"
    };

    gmi.experience.getConfig().available.forEach(function(element) {
        ui_helper.appendBtn(element.title, function(){
            gmi.experience.push(element.key, pushParams).catch(
                function(rejected){
                    console.log(rejected.error)
                    ui_helper.appendSpan(rejected.error+ " ", pushParagraph)
                }
            );
        });
    });

    ui_helper.appendHorizontalRule();

    ui_helper.appendBtn("Unknown", function(){
        gmi.experience.push("unknown").catch(
            function(rejected){
                console.log(rejected.error)
                ui_helper.appendSpan(rejected.error + " ", pushParagraph)
            }
        );
    });

    ui_helper.appendBtn("Root", function(){
        gmi.experience.popToRoot({"params": "root_params"});
    });

    ui_helper.appendBtn("Ponies without params", function(){
        gmi.experience.push("ponies");
    });

    var pushParagraph = ui_helper.appendParagraph();
    ui_helper.appendHorizontalRule();

    // ---------- Notify App That Game Has Loaded And Send Stats ----------

    gmi.gameLoaded();
    gmi.sendStatsEvent('game_loaded', true, {});

});
