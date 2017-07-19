define(['gmi-platform', 'storage', 'brim'], function(gmi_platform, storage, brim) {
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
                        "description": "Turn audio on or off",
                        "defaultValue": false
                    },{
                        "key": "motion",
                        "type": "toggle",
                        "title": "Motion",
                        "description": "Reduce background animation",
                         "defaultValue": false
                    },{
                        "key": "subtitles",
                        "type": "toggle",
                        "title": "Subtitles",
                        "description": "Show on screen subtitles",
                         "defaultValue": false
                    },
                ]
            }, {
                title: "Game Settings",
                settings: [
                    {
                        "key": "hard_mode",
                        "type": "toggle",
                        "title": "Hard Mode",
                        "description": "Turn hard mode on/off",
                        "defaultValue": false
                    },{
                        "key": "night_mode",
                        "type": "toggle",
                        "title": "Night Mode",
                        "description": "Turn night mode on/off",
                         "defaultValue": false
                    }
                ]
            }
        ]
    };

    var testConfig = {
    "config": {
        "menu": {
            "configs": {
                "title": "Game Menu",
                "init": "menu/index.html",
                "description": "This is the game menu",
                "available": [{
                    "title": "Tanks Game",
                    "key": "tanks"
                }, {
                    "title": "Ponies Game",
                    "key": "ponies"
                }]
            }
        },
        "tanks": {
            "configs": {
                "title": "Tanks Game",
                "description": "This is the Tanks game",
                "path": "tanks/index.html"
            }
        },
        "ponies": {
            "configs": {
                "title": "Ponies Game",
                "description": "This is the Ponies game",
                "path": "ponies/index.html"
            }
        }
    }
};


    // Create a gmi object using getGMI. If window.getGMI is defined i.e we have
    // already got the gmi library from the server, then this will be used over
    // the local one.
    var gmi = gmi_platform.getGMI({settingsConfig: settingsConfig});
    var numberOfStatsButtonClicks = 0;

    addStylesheet();

    // ----- Set up container for the example --------

    var container = document.getElementById(gmi.gameContainerId);
    var wrapper = document.createElement("div");
    var inner = document.createElement("div");
    wrapper.className = "wrapper";
    inner.className = "inner";
    appendTitle("Pick n Mix demo");
    container.appendChild(wrapper);
    wrapper.appendChild(inner);


    appendSubtitle(testConfig.config.menu.settings.title);

    testConfig.config.menu.configs.available.forEach(function(element) {
        appendBtn(element.title, function(){
            gmi.openExperience(element.key);
        });
    });




    // ---------- Notify App That Game Has Loaded And Send Stats ----------

    gmi.gameLoaded();
    gmi.sendStatsEvent('game_loaded', true, {});


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

    function appendTitle(titleStr) {
        var bbcLogo = document.createElement("img");
        var title = document.createElement("h1");
        bbcLogo.src = gmi.gameDir + "bbc-blocks-dark.png";
        bbcLogo.className = "bbc-logo";
        bbcLogo.alt = "BBC Logo";
        wrapper.appendChild(bbcLogo);
        title.innerHTML = titleStr;
        wrapper.appendChild(title);
    }

    function appendSubtitle(titleStr) {
        var title = document.createElement("h2");
        title.innerHTML = titleStr;
        inner.appendChild(title);
    }

    function appendParagraph(text) {
        var paragraph = document.createElement("p");
        paragraph.innerHTML = text || '';
        inner.appendChild(paragraph);
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

    function appendBtn(label, onClick) {
        var btn = document.createElement("button");
        btn.innerHTML = label;
        btn.onclick = onClick;
        inner.appendChild(btn);
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

    function appendTextInput(elementID) {
        var input = document.createElement("input");
        input.type = "text";
        input.id = elementID;
        input.value = 'Enter a message here';
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
