define(['pnm-library/gmi-mobile', '/packages/uihelper/ui-helper.js'], function(gmi_platform, ui_helper) {
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
    ui_helper.appendTitle(gmi.gameDir, "Packages");

    //packages
    ui_helper.appendSubtitle("Available packages");
    var packagesParagraph = ui_helper.appendParagraph();

    gmi.packages.list().then((result) => {
        result.forEach((aPackage) => {
            packagesParagraph.appendChild(ui_helper.appendParagraph(JSON.stringify(aPackage)));
        })
    })

    ui_helper.appendHorizontalRule()

    // Game loaded

    gmi.gameLoaded();

    var popParams = {
        "last_experience": "packages",
        "method": "pop",
        "stars": "12345"
    };

    ui_helper.appendBtn("Pop", function(){
        gmi.experience.pop(popParams);
    });


});
