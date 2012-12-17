/// <reference path="../../js/jquery-1.7.1.min.js" />
/// <reference path="../../js/jquery-collision-1.0.1.js" />


// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var nav = WinJS.Navigation;

    function startGame() {
        /** Requires GameWorld.js to be included *****/
        window.game.world.initGameBodies();  // for Box 2d impulse/gameworld
        window.game.world.initStartGameSequence();
        window.game.world.startAnimationLoop();
        //window.game.world.startAnimationLoop();  // for Box 2d impulse/gameworld
    }

    WinJS.UI.Pages.define("/Views/GameBoard/GameBoard.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            Windows.Graphics.Display.DisplayProperties.autoRotationPreferences = Windows.Graphics.Display.DisplayOrientations.landscape;
            document.getElementById('homeAppButton').addEventListener('click', function () {
                window.game.world.stopGame();
                nav.navigate('/Views/TitleScreen/TitleControl.html');
            });

            document.getElementById('restartAppButton').addEventListener('click', function () {
                startGame();
            });

            window.game.board.resizePlayingField(true, true);
            startGame();
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
            window.game.board.resizePlayingField((viewState === Windows.UI.ViewManagement.ApplicationViewState.fullScreenLandscape), false);
        }

    });
})();
