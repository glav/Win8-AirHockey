﻿/// <reference path="../../js/licenceManager.js" />
/// <reference path="../../js/jquery-1.7.1-vsdoc.js" />
/// <reference path="../../js/highScoreHandler.js" />

// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var resetScoresOptionPressedOnce = false;
    var resetScoreTimer = null;

    function updateLicenceInformation() {
        var licenceState = window.game.licenceManager.currentState;

        if (licenceState == window.game.licenceManager.licenceStateType.validLicence) {
            document.getElementById("licence-indicator").innerText = "Fully licenced (Unrestricted)";
        } else {
            document.getElementById("licence-indicator").innerText = "No licence/Unpaid (Time Limited)";
        }
    }

    function setResetScoresButtonToNormal() {
        var button = document.getElementById("reset-high-scores");
        button.innerText = "Reset High Scores";
        button.style.color = "#7a7eb2";
        button.style.opacity = 0.6;
    }

    function bindButtonsHandlers() {
        document.getElementById("start-button-twoplayer").addEventListener("click", function () {
            var host = document.getElementById("body");
            nav.navigate("/Views/GameBoard/GameBoard.html", window.game.gameType.twoPlayer);
        }, false);
        document.getElementById("start-button-singleplayer").addEventListener("click", function () {
            var host = document.getElementById("body");
            nav.navigate("/Views/GameBoard/GameBoard.html", window.game.gameType.singlePlayer);
        }, false);
        document.getElementById("settings-button").addEventListener("click", function () {
            var host = document.getElementById("body");
            nav.navigate("/Views/Options/OptionsSettings.html");
        }, false);
        document.getElementById("reset-high-scores").addEventListener("click", function () {
            var button = this;
            if (resetScoresOptionPressedOnce === true) {
                // reset high scores
                if (resetScoreTimer !== null) {
                    clearTimeout(resetScoreTimer);
                    resetScoreTimer = null;
                }
                window.game.highScoreHandler.resetHighScores();
                setResetScoresButtonToNormal();
                resetScoresOptionPressedOnce = false;
                updateHighScoreTable();
            } else {
                // present warning to use
                button.innerText = "Are you sure?";
                button.style.color = "red";
                button.style.opacity = 1;
                // Give the user 5 seconds to press the button again
                resetScoreTimer = setTimeout(function () {
                    resetScoresOptionPressedOnce = false;
                    setResetScoresButtonToNormal();
                }, 5000);
                resetScoresOptionPressedOnce = true;
            }

        }, false);

    }

    function updateHighScoreTable() {
        var highScores = window.game.highScoreHandler.getHighScores();
        var scoreLen = highScores.singlePlayerLocalDurationLasted.length;
        var table = $("#high-scores");
        for (var cnt = 0; cnt < scoreLen; cnt++) {
            var highScoreEntry = highScores.singlePlayerLocalDurationLasted[cnt];

            var trElement = $("tbody tr", table).eq(cnt);
            $("td", trElement).each(function () {
                var scoreTimeDesc = '';
                var scoreTimeVal = 0;
                var scoreWho = '';
                var td = $(this);
                if (td.hasClass('multi-puck')) {
                    scoreTimeVal = highScoreEntry.multiPuck.score;
                    scoreTimeDesc = window.game.singlePlayerHandler.getDurationDescription(highScoreEntry.multiPuck.score);
                    scoreWho = highScoreEntry.multiPuck.who;
                } else {
                    scoreTimeVal = highScoreEntry.singlePuck.score;
                    scoreTimeDesc = window.game.singlePlayerHandler.getDurationDescription(highScoreEntry.singlePuck.score);
                    scoreWho = highScoreEntry.singlePuck.who;
                }
                $("span", td).each(function () {
                    var span = $(this);
                    if (span.hasClass('time')) {
                        span.text(scoreTimeDesc);
                    } else if (span.hasClass('who')) {
                        if (scoreTimeVal === 0) {
                            span.hide();
                        } else {
                            span.text(scoreWho);
                            span.show();
                        }
                    } else if (span.hasClass('separator')) {
                        if (scoreTimeVal === 0) {
                            span.hide();
                        } else {
                            span.show();
                        }
                    }
                });
            });
        }
    }

    WinJS.UI.Pages.define("/Views/TitleScreen/TitleControl.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            var settings = window.game.settings;
            settings.incrementStartCounter();

            bindButtonsHandlers();
            updateLicenceInformation();
            window.game.licenceManager.setLicenceChangedHandler(updateLicenceInformation);

            updateHighScoreTable();
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
            window.game.licenceManager.dispose();
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });
})();