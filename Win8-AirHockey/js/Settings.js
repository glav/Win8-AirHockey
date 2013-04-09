window.game.settings = function () {

    function getCurrent() {
        var myStore = Windows.Storage.ApplicationData.current.localSettings.createContainer("AppSettings", Windows.Storage.ApplicationDataCreateDisposition.always);

        var currentSettings = JSON.parse(myStore.values.lookup("SettingsData"));
        if (!currentSettings) {
            currentSettings = _newSettings();
            myStore.values.insert("SettingsData", JSON.stringify(currentSettings));
        }
        return currentSettings;
    }

    function updateCurrent(currentSettings) {
        var myStore = Windows.Storage.ApplicationData.current.localSettings.createContainer("AppSettings", Windows.Storage.ApplicationDataCreateDisposition.always);

        // validate that it is a proper settings object
        if (!currentSettings
                || typeof currentSettings === 'undefined'
                || typeof currentSettings.numberTimesAppStarted === 'undefined') {
            throw new Exception("Error in settings");
        }

        myStore.values.insert("SettingsData", JSON.stringify(currentSettings));
    }

    function incrementStartCounter() {
        var currentSettings = this.getCurrent();
        currentSettings.numberTimesAppStarted++;
        this.updateCurrent(currentSettings);
    }

    function resetAllToDefault() {
        var defaultOptions = _newSettings();
        updateCurrent(defaultOptions);
    }

    function resetSinglePlayerToDefault() {
        var current = getCurrent();
        var defaultOptions = _newSettings();
        current.singlePlayerDifficulty = defaultOptions.singlePlayerDifficulty;
        current.multiPuckEnabledSinglePlayer = defaultOptions.multiPuckEnabledSinglePlayer;
        updateCurrent(current);
    }
    function resetTwoPlayerToDefault() {
        var current = getCurrent();
        var defaultOptions = _newSettings();
        current.powerToApplyOnPuckCollision = defaultOptions.powerToApplyOnPuckCollision;
        current.allowPlayersToCrossHalfwayLine = defaultOptions.allowPlayersToCrossHalfwayLine;
        current.numberOfGoalsThatSignalsEndOfMatch = defaultOptions.numberOfGoalsThatSignalsEndOfMatch;
        current.simulatorRestitution = defaultOptions.simulatorRestitution;
        current.multiPuckEnabledTwoPlayer = defaultOptions.multiPuckEnabledTwoPlayer;
        current.boardFriction = defaultOptions.boardFriction;
        updateCurrent(current);
    }

    function _newSettings() {
        var settingsData = {
            numberTimesAppStarted: 0,
            powerToApplyOnPuckCollision: 1,
            allowPlayersToCrossHalfwayLine: false,
            numberOfGoalsThatSignalsEndOfMatch: 6,
            simulatorRestitution: 60,  // Note: This value is divided by 100 when applied to simulator restitituion
            boardFriction: 2,
            singlePlayerDifficulty: 2,
            multiPuckEnabledSinglePlayer: false,
            multiPuckEnabledTwoPlayer: false
        };
        return settingsData;
    }

    function getDifficultyLevelDescription(level) {
        var description = "Medium";
        var intLevel = parseInt(level, 10);
        if (isNaN(intLevel)) {
            intLevel = 2;
        }
        if (typeof level !== 'undefined') {
            switch (intLevel) {
                case 1:
                    description = "Easy";
                    break;
                case 2:
                    description = "Medium";
                    break;
                case 3:
                    description = "Hard";
                    break;
            }
        }

        return description;
    }

    return {
        getCurrent: getCurrent,
        updateCurrent: updateCurrent,
        incrementStartCounter: incrementStartCounter,
        resetAllToDefault: resetAllToDefault,
        getDifficultyLevelDescription: getDifficultyLevelDescription,
        resetSinglePlayerToDefault: resetSinglePlayerToDefault,
        resetTwoPlayerToDefault: resetTwoPlayerToDefault
    };
}();
