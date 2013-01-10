window.game.licenceManager = function () {
    "option strict";

    var isRelease = false;
    var currentApp;

    var licencingState = {
        trial: 0,
        validLicence: 1
    }

    var currentState = licencingState.trial;
    var licenceChangeHandler = null;

    function setLicenceChangeEvent(eventHandler) {
        if (typeof eventHandler !== 'undefined') {
            licenceChangeHandler = eventHandler;
        }
    }

    function fireLicenceChangedEventHandler() {
        if (licenceChangeHandler !== null && typeof licenceChangeHandler !== 'undefined') {
            loadLicenceInfo();
            licenceChangeHandler(currentState);
        }
    }

    function loadLicenceInfo() {

        try {
            if (isRelease === true) {
                currentApp = Windows.ApplicationModel.Store.CurrentApp;
            } else {
                currentApp = Windows.ApplicationModel.Store.CurrentAppSimulator;
            }

            if (currentApp.licenseInformation.isActive) {
                if (!currentApp.licenseInformation.isTrial) {
                    currentState = licencingState.validLicence;
                }
            }

        } catch (e) {
            currentState = licencingState.trial;
        }

        currentApp.licenseInformation.removeEventListener("licensechanged", fireLicenceChangedEventHandler);

        if (currentState === licencingState.trial) {
            currentApp.licenseInformation.addEventListener("licensechanged", fireLicenceChangedEventHandler);
        }

        return currentState;
    }

    function releaseResources() {
        currentApp.licenseInformation.removeEventListener("licensechanged", fireLicenceChangedEventHandler);
        licenceChangeHandler = null;
    }

    loadLicenceInfo();

    return {
        licenceStateType: licencingState,
        currentState: currentState,
        setLicenceChangedHandler: setLicenceChangeEvent,
        dispose: releaseResources
    };
}();