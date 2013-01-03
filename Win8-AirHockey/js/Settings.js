window.game.settings = function() {

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
                || typeof currentSettings.numberTimesAppStarted === 'undefined')
        {
            throw new Exception("Error in settings");
        }

        myStore.values.insert("SettingsData", JSON.stringify(currentSettings));
    }

    function incrementStartCounter() {
        var currentSettings = this.getCurrent();
        currentSettings.numberTimesAppStarted++;
        this.updateCurrent(currentSettings);
    }

    function resetToDefault() {
        var defaultOptions = _newSettings();
        updateCurrent(defaultOptions);
    }

    function _newSettings() {
        var settingsData = {
            numberTimesAppStarted: 0,
            powerToApplyOnPuckCollision: 1,
            allowPlayersToCrossHalfwayLine: false,
            numberOfGoalsThatSignalsEndOfMatch: 6,
            simulatorRestitution: 60,  // Note: This value is divided by 100 when applied to simulator restitituion
            boardFriction: 2,
            singlePlayerDifficulty: 2
        };
        return settingsData;
    }

    return {
        getCurrent: getCurrent,
        updateCurrent: updateCurrent,
        incrementStartCounter: incrementStartCounter,
        resetToDefault: resetToDefault
    };
}();
