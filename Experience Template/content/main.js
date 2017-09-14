define(['pnm-library/gmi-mobile', './demos/dom'], function( gmi_platform, domUtils ) {
    "use strict"

    var gmi = gmi_platform.getGMI( {settingsConfig: {}} )
    var experienceConfig = gmi.experience.getConfig()

    domUtils.addStylesheet()
    domUtils.addTitle( experienceConfig.title )
    domUtils.addLine()
    domUtils.addButton( "Open Downloads Demo", "downloads" ).onclick = function() {
        gmi.experience.openExperience( "downloads" )
    }

    gmi.gameLoaded()

})
