define(['libs/js/gmi-mobile', './demos/dom.js'], function( gmi_platform, domUtils ) {
    "use strict"

    var gmi = gmi_platform.getGMI( {settingsConfig: {}} )
    var experienceConfig = gmi.config

    domUtils.addStylesheet()
    domUtils.addTitle( experienceConfig.title )
    domUtils.addLine()
    domUtils.addButton( "Open Downloads Demo", "downloads" ).onclick = function() {
        gmi.openExperience( "downloads" )
    }

    gmi.gameLoaded()

})
