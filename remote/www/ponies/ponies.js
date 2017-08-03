define(['gmi-platform', 'brim'], function(gmi_platform, brim) {
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
                        },{
                            "key": "motion",
                            "type": "toggle",
                            "title": "Motion",
                            "description": "Reduce background animation"
                        },{
                            "key": "subtitles",
                            "type": "toggle",
                            "title": "Subtitles",
                            "description": "Show on screen subtitles"
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

    var gmi = gmi_platform.getGMI({settingsConfig: settingsConfig});
    var ami = window.getAMI();

    addStylesheet();

    // ----- Set up container for the example --------

    var container = document.getElementById(gmi.gameContainerId);
    var wrapper = document.createElement("div");
    var inner = document.createElement("div");
    wrapper.className = "wrapper";
    inner.className = "inner";

    wrapper.style.backgroundColor = ami.config.background;

    appendTitle("Ponies (Remote)");
    container.appendChild(wrapper);
    wrapper.appendChild(inner);

    // Audio
    appendSubtitle("Audio");
    var audioParagraph = appendParagraph();
    appendSpan("Game audio value: ", audioParagraph);
    audioParagraph.appendChild(createLabel(gmi.getAllSettings().audio, "audio-label"));

    appendSpacer();
    appendBtn("Toggle audio", function() {
        gmi.setAudio(!gmi.getAllSettings().audio);
        document.getElementById("audio-label").innerHTML = gmi.getAllSettings().audio;
    });

    // Motion
    appendSubtitle("Motion");
    var motionParagraph = appendParagraph();
    appendSpan("Game motion value: ", motionParagraph);
    motionParagraph.appendChild(createLabel(gmi.getAllSettings().motion, "motion-label"));

    appendSpacer();
    appendBtn("Toggle motion", function() {
        gmi.setMotion(!gmi.getAllSettings().motion);
        document.getElementById("motion-label").innerHTML = gmi.getAllSettings().motion;
    });

    // Subtitles
    appendSubtitle("Subtitles");
    var paragraph = appendParagraph();
    appendSpan("Game subtitles value: ", paragraph);
    paragraph.appendChild(createLabel(gmi.getAllSettings().subtitles, "subtitles-label"));

    appendSpacer();
    appendBtn("Toggle subtitles", function() {
        gmi.setSubtitles(!gmi.getAllSettings().subtitles);
        document.getElementById("subtitles-label").innerHTML = gmi.getAllSettings().subtitles;
    });

    appendHorizontalRule()

    // Game loaded

    gmi.gameLoaded();

    // ---------- GMI Settings Example----------

    appendSubtitle("GMI Settings Example");
    var settingsParagraph = appendParagraph();
    settingsParagraph.appendChild(createLabel("", "settings-label"));

    appendSpacer();
    appendBtn("Save", function() { 
        var dummySetting = "{\"setting_string\" : \"pony setting\", \"setting_number\": 100}";

        gmi.setGameData("test", dummySetting)
        settingsParagraph.innerHTML = "Settings saved: " + dummySetting;
     });
    appendBtn("Load", function() { 
        settingsParagraph.innerHTML = "Settings loaded: " + gmiSettings.gameData.test;
    });

    settingsParagraph.innerHTML = "Test setting: " + gmiSettings.gameData.test;
   
    appendHorizontalRule();
    
    appendBtn("back", function(){
        ami.openParentExperience();
    });

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

    function createLabel(text, id) {
        var label = document.createElement("span");
        label.innerHTML = text;
        label.id = id;
        label.className = "setting";
        return label;
    }


    // --------- Settings ---------


});
