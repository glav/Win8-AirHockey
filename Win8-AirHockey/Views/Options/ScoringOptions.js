// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/Views/Options/ScoringOptions.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            document.getElementById('scoring-flyout-panel-back').addEventListener('click', function () {
                WinJS.UI.SettingsFlyout.show();
            }, false);

            document.getElementById('reset-high-scores-options').addEventListener('click', function () {
                window.game.dialog.show("Are you sure you want to reset your high scores?", function () {
                    window.game.highScoreHandler.resetHighScores();
                    window.postMessage({ resetHighScores: true },"*");
                }, function () {
                    //No, do nothing
                });
            }, false);

          

        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });
})();
