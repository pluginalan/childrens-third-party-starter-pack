define(['pnm-library/gmi-mobile', './dom', 'pnm-library/downloads/package-manager'], function( gmi_platform, domUtils, packageManager ) {
    "use strict"

    var gmi = gmi_platform.getGMI( {settingsConfig: {}} )
    var experienceConfig = gmi.config

    domUtils.addStylesheet()
    domUtils.addBackButton().onclick = function() {
        gmi.exit()
    }
    domUtils.addTitle( experienceConfig.title )
    domUtils.addLine()

    domUtils.addButton( "Download a Thing" ).onclick = function() {

    }

    // start the monitor
    
    
    gmi.gameLoaded()
})
