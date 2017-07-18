define(function(){

    // ---------- Application ----------
    function onSaveButton(gmi, outputTextDiv) {
        var data = {
            title: "local storage example",
            time: new Date().toISOString()
        };
        saveData(gmi, data);
        outputTextDiv.innerHTML = "saving:\n" + JSON.stringify(data, null, 4);
        outputTextDiv.style.display = "inline-block";
    }

    function onLoadButton(gmi, outputTextDiv) {
        var data = loadData(gmi);
        outputTextDiv.innerHTML = "loaded:\n" + JSON.stringify(data, null, 4);
        outputTextDiv.style.display = "inline-block";
    }

    // ---------- Implementation ----------
    function saveData(gmi, data) {
        gmi.setGameData("data-key", data);
    } 

    function loadData(gmi) {
        var savedData = gmi.getAllSettings().gameData["data-key"];
        if (savedData) {
            return savedData
        }
        return {};
    }

    return {
        onSaveButton: onSaveButton,
        onLoadButton: onLoadButton
    };

});
