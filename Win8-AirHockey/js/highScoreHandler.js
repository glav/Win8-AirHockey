﻿window.game.highScoreHandler = function () {
    "option strict";

    /*******************************************************/
    /***  Note:High score object format ********************/
    /*******************************************************/
    /** highScores {
	    singlePlayerScores:    <-- this is for local play. An array with each element representing a difficulty
                                   levels scores. Currently, each array item is an object that holds the 
                                   difficulty level scores in singlepuck and also multi puck mode
            [ {level1SinglePuck, Level1 MultiPuck},
              {level2SinglePuck, Level2 MultiPuck},
              {level3SinglePuck, Level3 MultiPuck}
            ],
        singlePlayerGlobalDurationLasted:[]        <-- This is for cloud stored high scores
    }
    ***/
    /*******************************************************/
    var highScores = {
        singlePlayerLocalDurationLasted: [
            { 'singlePuck': 0, 'multiPuck': 0 },  // level 1
            { 'singlePuck': 0, 'multiPuck': 0 },  // level 2
            { 'singlePuck': 0, 'multiPuck': 0 }  // level 3
        ],
        singlePlayerGlobalDurationLasted: []  // for when the scores are stored in the cloud for all players
    };

    var myStore = Windows.Storage.ApplicationData.current.localSettings.createContainer("HighScores", Windows.Storage.ApplicationDataCreateDisposition.always);

    function getHighScoreTableIndexForGameSetting(currentSettings) {
        if (typeof currentSettings === 'undefined' || typeof currentSettings.singlePlayerDifficulty === 'undefined') {
            return 0;
        }

        return currentSettings.singlePlayerDifficulty - 1;
    }

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

    function isHighScore(singlePlayerDuration, currentSettings) {
        var currentScores = getHighScores();
        // Get the index of the array entry from the single player high score table based o nthe current setting
        var highScoreTableIndex = getHighScoreTableIndexForGameSetting(currentSettings);
        // Grab the score object from the array
        var highScoreEntry = currentScores.singlePlayerLocalDurationLasted[highScoreTableIndex];
        // Now get the score from the score object dependencing on whether multi puck is enabled or not
        var scoreToCompare = currentSettings.multiPuckEnabled === true ? highScoreEntry.multiPuck : highScoreEntry.singlePuck;

        if (singlePlayerLocalDurationLasted > scoreToCompare) {
            return true;
        }
        return false;
    }
    
    function resetHighScores() {
        myStore.values.remove("localScores");
    }

    function updateHighScores(singlePlayerLocalDurationLasted, currentSettings) {
        if (!singlePlayerLocalDurationLasted
                || typeof singlePlayerLocalDurationLasted === 'undefined') {
            throw new Exception("Error in scores data");
        }

        var currentScores = getHighScores();
        // only update if required
        if (isHighScore(singlePlayerLocalDurationLasted, currentSettings) === true) {
            // Get the index of the array entry from the single player high score table based o nthe current setting
            var highScoreTableIndex = getHighScoreTableIndexForGameSetting(currentSettings);
            // Grab the score object from the array
            var highScoreEntry = currentScores.singlePlayerLocalDurationLasted[highScoreTableIndex];
            // Now get the score from the score object dependencing on whether multi puck is enabled or not
            var scoreToCompare = currentSettings.multiPuckEnabled === true ? highScoreEntry.multiPuck : highScoreEntry.singlePuck;

            if (currentSettings.multiPuckEnabled) {
                highScoreEntry.multiPuck = scoreToCompare;
            } else {
                highScoreEntry.singlePuck = scoreToCompare;
            }
            currentScores.singlePlayerLocalDurationLasted[highScoreTableIndex] = highScoreEntry;
            myStore.values.insert("localScores", JSON.stringify(currentScores));
            //TODO: Here we can update the high scores in the cloud too
        }

        return currentScores;
    }

    return {
        getHighScores: getHighScores,
        updateHighScores: updateHighScores,
        isHighScore: isHighScore,
        resetHighScores: resetHighScores
    };
}();