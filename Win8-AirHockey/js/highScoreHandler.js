window.game.highScoreHandler = function () {

    var highScores = {
        singlePlayerLocalDurationLasted: 0,
        singlePlayerGlobalDurationLasted: []  // for when the scores are stored in the cloud for all players
    };

    var myStore = Windows.Storage.ApplicationData.current.localSettings.createContainer("HighScores", Windows.Storage.ApplicationDataCreateDisposition.always);


    function getHighScores() {
        var currentScores = JSON.parse(myStore.values.lookup("localScores"));
        //Update the local cache with the global scores from the cloud - but dont do it in a blocking manner
        //TODO: Invoke worker thread here

        if (!currentScores) {
            myStore.values.insert("localScores", JSON.stringify(highScores));
            return highScores;
        }

        //TODO: Here we can retrieve global scores from the cloud as well
        return currentScores;
    }

    function updateHighScores(singlePlayerLocalDurationLasted) {
        if (!singlePlayerLocalDurationLasted
                || typeof singlePlayerLocalDurationLasted === 'undefined') {
            throw new Exception("Error in scores data");
        }

        var currentScores = getHighScores();
        // only update if required
        if (singlePlayerLocalDurationLasted > currentScores.singlePlayerLocalDurationLasted || typeof currentScores.singlePlayerLocalDurationLasted === 'undefined') {
            currentScores.singlePlayerLocalDurationLasted = singlePlayerLocalDurationLasted;
            myStore.values.insert("localScores", JSON.stringify(currentScores));
            //TODO: Here we can update the high scores in the cloud too
        }

        return currentScores;
    }

    return {
        getHighScores: getHighScores,
        updateHighScores: updateHighScores
    };
}();