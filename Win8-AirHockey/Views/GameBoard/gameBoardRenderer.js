window.game.board = function () {
    "use strict";

    // Setup our common variables
    var screenHeight = window.innerHeight;
    var screenWidth = window.innerWidth;

    function resizePlayingField(isInLandscapeMode, isNewBoard) {

        if (!isInLandscapeMode) {
            //todo: need to reposition all the controls
            // OR
            // load in a different view
            //return;
        }

        var boardCanvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        var ctx = boardCanvas.getContext("2d");
        boardCanvas.width = screenWidth;
        boardCanvas.height = screenHeight;
        drawBoardMarkings();
    }

    function drawBoardMarkings() {
        var boardCanvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        var ctx = boardCanvas.getContext("2d");
        var xPos = screenWidth / 2 / window.game.worldConstants.Scale;
        var yPos = screenHeight / 2 / window.game.worldConstants.Scale;
        var radius = 4;
        var angle = 0;

        ctx.save();

        // Halfway circle
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        var middleX = xPos * window.game.worldConstants.Scale;
        ctx.arc(middleX, yPos * window.game.worldConstants.Scale, radius * window.game.worldConstants.Scale, 0, Math.PI * 2, true);
        ctx.lineWidth = 10;
        ctx.closePath();
        ctx.stroke();


        // Halfway line        
        ctx.moveTo(middleX, 0);
        ctx.lineTo(middleX, screenHeight);
        ctx.stroke();

        ctx.restore();

    }

    function createPuckInitialSettings() {
        var boardCanvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        var ctx = boardCanvas.getContext("2d");
        return {
            id: window.game.worldConstants.PuckId,
            x: ctx.canvas.width / 2 / window.game.worldConstants.Scale,
            y: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
            radius: 1.5,
            isStatic: false,
            density: 1,
            puckcolor: window.game.worldConstants.BallPuckColour,
            fixedRotation: true
        }
    }

    function createBat1InitialSettings() {
        var boardCanvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        var ctx = boardCanvas.getContext("2d");
        return {
            id: window.game.worldConstants.Player1Id,
            x: 5,
            y: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
            halfHeight: 2, halfWidth: 0.9, isStatic: false,
            density: 3,
            radius: 1.9,
            playercolor: window.game.worldConstants.Player1Colour,
            useShadow: true,
            playerName: 'P1'
        }
    }

    function createBat2InitialSettings() {
        var boardCanvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        var ctx = boardCanvas.getContext("2d");
        return {
            id: window.game.worldConstants.Player2Id,
            x: 40,
            y: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
            halfHeight: 2,
            halfWidth: 0.9,
            isStatic: false,
            density: 3,
            radius: 1.9,
            playercolor: window.game.worldConstants.Player2Colour,
            useShadow: true,
            playerName: 'P2'
        }
    }

    function setupAllWorldBodySettings() {
        var boardCanvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        var ctx = boardCanvas.getContext("2d");

        return [
            {
                id: "ground",
                x: ctx.canvas.width / 2 / window.game.worldConstants.Scale,
                y: ctx.canvas.height / window.game.worldConstants.Scale,
                halfHeight: 0.5,
                halfWidth: ctx.canvas.width / window.game.worldConstants.Scale,
                color: window.game.worldConstants.BoardEdgeColour,
                isStatic: true
            },
            {
                id: "groundTop",
                x: ctx.canvas.width / 2 / window.game.worldConstants.Scale,
                y: 0.5, halfHeight: 0.5,
                halfWidth: ctx.canvas.width / window.game.worldConstants.Scale,
                color: window.game.worldConstants.BoardEdgeColour,
                isStatic: true
            },
            {
                id: "groundLeft",
                x: 0.5, y: (ctx.canvas.height / 2 / window.game.worldConstants.Scale),
                halfHeight: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
                halfWidth: 0.5, color: window.game.worldConstants.BoardEdgeColour,
                isStatic: true
            },
            {
                id: "groundRight",
                x: (ctx.canvas.width / window.game.worldConstants.Scale) - 0.5,
                y: (ctx.canvas.height / 2 / window.game.worldConstants.Scale),
                halfHeight: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
                halfWidth: 0.5, color: window.game.worldConstants.BoardEdgeColour,
                isStatic: true
            },
            createPuckInitialSettings(),
            createBat1InitialSettings(),
            createBat2InitialSettings(),
            {
                id: window.game.worldConstants.player1Goal,
                x: 1,
                y: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
                halfHeight: 4.5,
                halfWidth: 0.8,
                isStatic: true,
                density: 1,
                color: window.game.worldConstants.GoalColour,
                useShadow:true
            },
            {
                id: window.game.worldConstants.player2Goal,
                x: ctx.canvas.width / window.game.worldConstants.Scale - 1,
                y: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
                halfHeight: 4.5,
                halfWidth: 0.8,
                isStatic: true,
                density: 1,
                color: window.game.worldConstants.GoalColour,
                useShadow: true
            }

        ];

    }

    return {
        drawBoardMarkings: drawBoardMarkings,
        resizePlayingField: resizePlayingField,
        setupAllWorldBodySettings: setupAllWorldBodySettings,
        createBat1InitialSettings: createBat1InitialSettings,
        createBat2InitialSettings: createBat2InitialSettings,
        createPuckInitialSettings: createPuckInitialSettings
    };

}();