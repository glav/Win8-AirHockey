/// <reference path="../../js/jquery-1.7.1-vsdoc.js" />
// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var viewModel = WinJS.Binding.as({
        settings: {}
    });
    
    function updateSettings() {
        var settings = window.game.settings.getCurrent();
        settings.powerToApplyOnPuckCollision = document.getElementById('option-power-on-puckcollision').value;
        settings.numberOfGoalsThatSignalsEndOfMatch = document.getElementById('option-goals-till-endofmatch').value;
        settings.allowPlayersToCrossHalfwayLine = document.getElementById('option-player-allow-halfway').winControl.checked;
        settings.simulatorRestitution = document.getElementById('option-restitution').value;
        // DOnt bother allowing user to change friction for now.
        //settings.boardFriction = document.getElementById('option-board-friction').value;
        settings.multiPuckEnabledTwoPlayer = document.getElementById('option-twoplayer-multipuck').winControl.checked;
        window.game.settings.updateCurrent(settings);
        viewModel.settings = settings;
    }

    function resetOptionsToDefault() {
        window.game.settings.resetTwoPlayerToDefault();
        viewModel.settings = window.game.settings.getCurrent();
        //WinJS.Binding.processAll(document.getElementById('main-content'), settings);
    }

    WinJS.UI.Pages.define("/Views/Options/TwoPlayerOptions.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            viewModel.settings = window.game.settings.getCurrent();
            WinJS.Binding.processAll(document.getElementById('twoPlayerFlyout'), viewModel);

            document.getElementById('multi-flyout-panel-back').addEventListener('click', function () {
                WinJS.UI.SettingsFlyout.show();
            }, false);

            document.getElementById('reset-twoplayer-options').addEventListener('click', function () {
                resetOptionsToDefault();
                //var settings = window.game.settings.getCurrent();
                //WinJS.Binding.processAll(document.getElementById('twoPlayerFlyout'), settings);
            }, false);

            $("section fieldset > *").each(function () {
                $(this).unbind().on('change', function (el) {
                    updateSettings();
                });
            });


            window.game.ui.settings.manageInputRangeEvents(true);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
            window.game.ui.settings.manageInputRangeEvents(false);
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
            var s = element;
        }
    });
})();
