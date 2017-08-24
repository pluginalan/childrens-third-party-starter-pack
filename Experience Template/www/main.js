define(['libs/js/gmi-mobile'], function(gmi_platform) {
    "use strict"

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
    }

    // Create a gmi object using getGMI
    var gmi = gmi_platform.getGMI( {settingsConfig: settingsConfig} )

    var stylesheet  = document.createElement( "link" )
    stylesheet.rel  = "stylesheet"
    stylesheet.type = "text/css"
    stylesheet.href = "style.css"
    stylesheet.media = "all"
    document.getElementsByTagName( "head" )[0].appendChild( stylesheet )

    var h1 = document.createElement( "h1" )
    var h1Text = document.createTextNode( "Pick 'n' Mix Download Demo" )
    h1.appendChild( h1Text )

    document.getElementsByTagName( "body" )[0].appendChild( h1 )

    addLine()

    gmi.gameLoaded()


    var addLine = function() {
        var line = document.createElement( "div" )
        line.setAttribute( "class", "line" )
        document.getElementsByTagName( "body" )[0].appendChild( line )
    }

});
