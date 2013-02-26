/// <reference path="../../js/worldConstants.js" />

window.game.stateBag = function () {
    "use strict";

    var canvasUpdateArea = {
        topPos: 0,
        leftPos: 0,
        width: 0,
        height: 0
    };

    var ballCollisionState = {
        hasCollided: false,
        power: 0,
        vX: 0,
        vY: 0,
        puckIdThatCollided: window.game.worldConstants.PuckId,
        batIdCollidedWith: null,
        clear: function () {
            this.hasCollided = false;
            this.power = 0;
            this.vX = 0;
            this.batIdCollidedWith = null;
        }
    };

    var debugData = {
        enabled: true,
        batXVelocity: 0,
        batYVelocity: 0,
        lastCalculatedPower: 0,
        lastPowerApplied: 0,
        lastImpulse: 0,
        lastEvent: '',
        message: '',
        batIdCollidedWith: null
    };
    
    var scores = {
        player1: 0,
        player2: 0,
        singlePlayerStartTime: null,
        singlePlayerEndTime: null,
        highScores: null
    };
    var countdownState = {
        started: false,
        count: 0,
        timer: null
    };

    var inGameMessage = {
        displayText: null,
        xPos: 0,
        yPos: 0,
        incrementValue: 1,
        clearMessage: function () {
            this.displayText = null;
            this.xPos = 0;
            this.yPos = 0;
            this.incrementValue = 1;
        }
    };

    var playerMovementState = {
        player1: {
            isSelected: false,
            whenSelected: null,
            xPosWhileHeld: [],
            yPosWhileHeld: []
        },
        player2: {
            isSelected: false,
            whenSelected: null,
            xPosWhileHeld: [],
            yPosWhileHeld: []
        },
        movementCheckTimer: null,

        // Items to manage player movement state
        _maxPositionItems: 5,
        clearPlayerState: function (isPlayer1) {
            var playerState = isPlayer1 && isPlayer1 === true ? this.player1 : this.player2;
            playerState.whenSelected = null;
            playerState.xPosWhileHeld = [];
            playerState.yPosWhileHeld = [];
        },
        pushMovementStateForPlayer: function (isPlayer1, xPos, yPos) {
            var playerState = isPlayer1 && isPlayer1 === true ? this.player1 :this.player2;
            if (playerState.xPosWhileHeld.length === 0) {
                playerState.whenSelected = new Date().getTime();
            }
            var newXPosInArray = playerState.xPosWhileHeld.length;
            if (newXPosInArray > (this._maxPositionItems - 1)) {
                playerState.xPosWhileHeld.shift();
                newXPosInArray = (this._maxPositionItems - 1);
            }
            var newYPosInArray = playerState.yPosWhileHeld.length;
            if (newYPosInArray > (this._maxPositionItems - 1)) {
                playerState.yPosWhileHeld.shift();
                newYPosInArray = (this._maxPositionItems - 1);
            }
            playerState.xPosWhileHeld.push(xPos);
            playerState.yPosWhileHeld.push(yPos);
        }

    };


    return {
        ballCollisionState: ballCollisionState,
        canvasUpdateArea: canvasUpdateArea,
        debugData: debugData,
        scores: scores,
        countdownState: countdownState,
        inGameMessage: inGameMessage,
        playerMovementState: playerMovementState
    };

}();