define(['pnm-library/gmi-mobile', '../js/ui-helper'], function(gmi_platform, ui_helper) {
    "use strict";

    var settingsConfig = {};

    var gmi = gmi_platform.getGMI({settingsConfig: settingsConfig});

    ui_helper.addStylesheet(gmi.gameDir);

    // ----- Set up container for the example --------

    var container = document.getElementById(gmi.gameContainerId);
    var wrapper = document.createElement("div");
    var inner = document.createElement("div");
    wrapper.className = "wrapper";
    wrapper.id = "wrapper";
    inner.className = "inner";
    inner.id = "inner";

    wrapper.style.backgroundColor = gmi.experience.getConfig().background;

    container.appendChild(wrapper);
    wrapper.appendChild(inner);
    ui_helper.appendTitle(gmi.gameDir, "Tanks");

    // Audio
    ui_helper.appendSubtitle("Audio");
    var audioParagraph = ui_helper.appendParagraph();
    ui_helper.appendSpan("Game audio value: ", audioParagraph);
    audioParagraph.appendChild(ui_helper.createLabel(gmi.getAllSettings().audio, "audio-label"));

    ui_helper.appendSpacer();
    ui_helper.appendBtn("Toggle audio", function() {
        gmi.setAudio(!gmi.getAllSettings().audio);
        document.getElementById("audio-label").innerHTML = gmi.getAllSettings().audio;
    });

    // Motion
    ui_helper.appendSubtitle("Motion");
    var motionParagraph = ui_helper.appendParagraph();
    ui_helper.appendSpan("Game motion value: ", motionParagraph);
    motionParagraph.appendChild(ui_helper.createLabel(gmi.getAllSettings().motion, "motion-label"));

    ui_helper.appendSpacer();
    ui_helper.appendBtn("Toggle motion", function() {
        gmi.setMotion(!gmi.getAllSettings().motion);
        document.getElementById("motion-label").innerHTML = gmi.getAllSettings().motion;
    });

    // Subtitles
    ui_helper.appendSubtitle("Subtitles");
    var paragraph = ui_helper.appendParagraph();
    ui_helper.appendSpan("Game subtitles value: ", paragraph);
    paragraph.appendChild(ui_helper.createLabel(gmi.getAllSettings().subtitles, "subtitles-label"));

    ui_helper.appendSpacer();
    ui_helper.appendBtn("Toggle subtitles", function() {
        gmi.setSubtitles(!gmi.getAllSettings().subtitles);
        document.getElementById("subtitles-label").innerHTML = gmi.getAllSettings().subtitles;
    });

    ui_helper.appendHorizontalRule()

    // Game loaded

    gmi.gameLoaded();

    // ---------- GMI Settings Example----------

    ui_helper.appendSubtitle("GMI Settings Example");
    var settingsParagraph = ui_helper.appendParagraph();
    settingsParagraph.appendChild(ui_helper.createLabel("", "settings-label"));

    ui_helper.appendSpacer();
    ui_helper.appendBtn("Save", function() {
        var dummySetting = "{\"setting_string\" : \"tanks setting\", \"setting_number\": 100}";

        gmi.setGameData("test", dummySetting)
        settingsParagraph.innerHTML = "Settings saved: " + dummySetting;
     });
    ui_helper.appendBtn("Load", function() {
        settingsParagraph.innerHTML = "Settings loaded: " + gmiSettings.gameData.test;
    });

    settingsParagraph.innerHTML = "Test setting: " + gmiSettings.gameData.test;

    ui_helper.appendHorizontalRule();

    ui_helper.appendBtn("Ponies", function(){
        gmi.experience.push("ponies");
    });

    ui_helper.appendBtn("Back", function(){
        gmi.experience.pop();
    });

});
