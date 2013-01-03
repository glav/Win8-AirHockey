/// <reference path="../../js/Settings.js" />
// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var settings = window.game.settings.getCurrent();
    var nav = WinJS.Navigation;

    function updateSettings() {
        settings.powerToApplyOnPuckCollision = document.getElementById('option-power-on-puckcollision').value;
        settings.numberOfGoalsThatSignalsEndOfMatch = document.getElementById('option-goals-till-endofmatch').value;
        settings.allowPlayersToCrossHalfwayLine = document.getElementById('option-player-allow-halfway').winControl.checked;
        settings.simulatorRestitution = document.getElementById('option-restitution').value;
        settings.boardFriction = document.getElementById('option-board-friction').value;
        settings.singlePlayerDifficulty = document.getElementById('option-singlepower-difficulty').value
        settings.multiPuckEnabled = document.getElementById('option-singleplayer-multipuck').winControl.checked;
        window.game.settings.updateCurrent(settings);
    }

    function resetOptionsToDefault() {
        window.game.settings.resetToDefault();
        settings = window.game.settings.getCurrent();
        WinJS.Binding.processAll(document.getElementById('main-content'), settings);
    }

    function onChangeRange(e) {
        var labelId = e.target.getAttribute('data-update-label');
        if (labelId && labelId !== null && labelId !== '') {
            var label = document.getElementById(labelId);
            label.innerText = e.target.value;
        }
    }

    function manageInputRangeEvents(subscribeToEvents) {
        var allRangeControls = document.getElementsByClassName('slider');
        var numControls = allRangeControls.length;
        for (var cnt = 0; cnt < numControls; cnt++) {
            var el = allRangeControls[cnt];
            if (subscribeToEvents === true) {
                el.addEventListener("change", onChangeRange);
            } else {
                el.removeEventListener("change", onChangeRange);
            }
        }

    }

    WinJS.UI.Pages.define("/Views/Options/OptionsSettings.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            WinJS.Binding.processAll(document.getElementById('main-content'), settings);

            document.getElementById("options-reset").addEventListener("click", function () {
                resetOptionsToDefault();
            }, false);

            manageInputRangeEvents(true);
        },

        unload: function () {
            updateSettings();
            manageInputRangeEvents(false);
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
            //WinJS.Binding.processAll(document.getElementById('main-content'), settings);
        }
    });
})();

