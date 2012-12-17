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
        window.game.settings.updateCurrent(settings);
    }

    function resetOptionsToDefault() {
        window.game.settings.resetToDefault();
        settings = window.game.settings.getCurrent();
        WinJS.Binding.processAll(document.getElementById('main-content'), settings);
    }

    WinJS.UI.Pages.define("/Views/Options/OptionsSettings.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            WinJS.Binding.processAll(document.getElementById('main-content'), settings);

            document.getElementById("options-reset").addEventListener("click", function () {
                resetOptionsToDefault();
                //setTimeout(function () {
                //    nav.navigate('/Views/TitleScreen/TitleControl.html');
                //}, 250);
            }, false);
        },

        unload: function () {
            updateSettings();
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
            //WinJS.Binding.processAll(document.getElementById('main-content'), settings);
        }
    });
})();
