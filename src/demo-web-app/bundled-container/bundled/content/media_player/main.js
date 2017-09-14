define(['pnm-library/gmi-mobile', '../js/ui-helper'], function(gmi_platform, ui_helper) {
    "use strict";

    var settingsConfig = {};

    // Create a gmi object using getGMI. If window.getGMI is defined i.e we have
    // already got the gmi library from the server, then this will be used over
    // the local one.
    var gmi = gmi_platform.getGMI({settingsConfig: settingsConfig});
    var numberOfStatsButtonClicks = 0;

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
    ui_helper.appendTitle(gmi.gameDir, "Media Playback Examples");

    // ---------- GMI Exit Example -----------
    ui_helper.appendBtn("Back", function() {
      gmi.experience.pop(); 
    });

    ui_helper.appendHorizontalRule();


    // ---------- Media Playback -------------

    ui_helper.appendSubtitle("Media Playback")

    var mediaPlayerClosedCallback = function() {
        ui_helper.appendSpan( "Media playback finished... ", playbackParagraph )
    }

    ui_helper.appendBtn( "Play Video", function() {
        gmi.playMedia( gmi.experience.getConfig().demo_vpid, mediaPlayerClosedCallback )
        ui_helper.appendSpan( "Media playback requested... ", playbackParagraph )
    })

    var playbackParagraph = ui_helper.appendParagraph();

    ui_helper.appendHorizontalRule();

    // ---------- Notify App That Game Has Loaded And Send Stats ----------

    gmi.gameLoaded();
    gmi.sendStatsEvent('game_loaded', true, {});

});
