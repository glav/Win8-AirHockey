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

    function _newSettings() {
        var settingsData = {
            numberTimesAppStarted: 0,
            powerToApplyOnPuckCollision: 1,
            allowPlayersToCrossHalfwayLine: false
        };
        return settingsData;
    }

    return {
        getCurrent: getCurrent,
        updateCurrent: updateCurrent,
        incrementStartCounter: incrementStartCounter
    };
}();
