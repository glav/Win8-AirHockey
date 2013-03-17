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
        settings.singlePlayerDifficulty = document.getElementById('option-singlepower-difficulty').value
        settings.multiPuckEnabledSinglePlayer = document.getElementById('option-singleplayer-multipuck').winControl.checked;
        window.game.settings.updateCurrent(settings);
        viewModel.settings = settings;
    }

    function resetOptionsToDefault() {
        window.game.settings.resetSinglePlayerToDefault();
        viewModel.settings = window.game.settings.getCurrent();
        //WinJS.Binding.processAll(document.getElementById('main-content'), viewModel);
    }


    WinJS.UI.Pages.define("/Views/Options/SinglePlayerOptions.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            viewModel.settings = window.game.settings.getCurrent();
            WinJS.Binding.processAll(document.getElementById('singlePlayerFlyout'), viewModel);

            document.getElementById('single-flyout-panel-back').addEventListener('click', function () {
                WinJS.UI.SettingsFlyout.show();
            }, false);

            document.getElementById('reset-single-options').addEventListener('click', function () {
                resetOptionsToDefault();
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
        }
    });
})();
