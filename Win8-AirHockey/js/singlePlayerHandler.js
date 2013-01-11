/// <reference path="../../js/worldConstants.js" />
/// <reference path="../../js/Settings.js" />

window.game.singlePlayerHandler = function () {
    "use strict";

    var pulseTimer = null;
    var gameProgress, simulator;
    var settings;
    var timerPeriod = 3000;  // 3 seconds
    var playerName = 'Player';
    
    function pulseTimerHandler() {
        if (gameProgress.gameState === window.game.gameStateType.InProgress) {
            var power = Math.random() * (settings.singlePlayerDifficulty * 500) + 500;
            var angle = (Math.random() * 90) + 120;
            simulator.applyImpulse(window.game.worldConstants.PuckId, parseInt(angle), parseInt(power));
        }

        if (gameProgress.gameState !== window.game.gameStateType.Quit
                && gameProgress.gameState !== window.game.gameStateType.Ended) {
            setTimeout(pulseTimerHandler, timerPeriod);
        }
    }

    function getDurationDescription(duration) {
        var description = '';
        var intPart;
        if (duration === 0) {
            description = "No time recorded";
        } else if (duration > 0 && duration < 1000) {
            description = "Less than a second!";
        } else if (duration < 60000) {
            intPart = parseInt(duration / 1000, 10);
            if (intPart === 1) {
                description = intPart + " second";
            } else {
                description = intPart + " seconds";
            }
        } else {
            intPart = parseInt(duration / (1000 * 60), 10);
            var fraction = (duration - intPart) / 1000;
            description = intPart + " minutes and " + fraction + " seconds";
        }
        return description;
    }
    
    // Calculates the duration that the player lasted in the game given the start and end
    // times, and will eventually store these in the high score table if applicable
    function handlePlayerDuration(startTime, endTime) {
        var duration = endTime.getTime() - startTime.getTime();

        var result = {
            durationInMilliseconds: duration,
            durationDescription: null
        };

        result.durationDescription = getDurationDescription(duration);
        return result;
    }
    
    function initialiseSinglePlayerState(gameProgressState, simulatorEngine) {
        gameProgress = gameProgressState;
        simulator = simulatorEngine;
        settings = window.game.settings.getCurrent();
        setTimeout(pulseTimerHandler, timerPeriod);
    }
    
    function getPlayerName() {
        Windows.System.UserProfile.UserInformation.getDisplayNameAsync().done(function (data) {
            playerName = data;
        });

    }

    getPlayerName();
    
    return {
        initialiseSinglePlayerState: initialiseSinglePlayerState,
        handlePlayerDuration: handlePlayerDuration,
        getDurationDescription: getDurationDescription,
        playerName: playerName
    };


}();
