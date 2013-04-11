/// <reference path="../../js/worldConstants.js" />

window.game.board = function () {
    "use strict";

    // Setup our common variables
    var screenHeight, screenWidth;
    var boardCentreCircleData = {
        middleX: 0,
        middleY: 0,
        scaledRadius: 0,
        endAngle: 0
    };
    var halfWayLineData = {
        xPos: 0,
        yPos: 0
    };
    


    var boardEdgeHalfWidth = 0.5;
    var boardEdgeWidthInPixels = (boardEdgeHalfWidth * 2) * window.game.worldConstants.Scale;

    // The following two ratio settings dictate the size of the bats and the puck
    // Note: Setting this to window.game.worldConstants.Scale means the puck will have a radius
    // of 1 (1 metre).
    var puckRadiusSizeRatio = window.game.worldConstants.Scale * 1.1;
    var batRadiusSizeRatio = window.game.worldConstants.Scale * 0.85;

    var entityType = {
        Generic: 0,
        Player: 1,
        PlayerAlternateImage: 2,
        Puck: 3,
        Goal: 4,
        Rectangle:54,
        Circle: 6,
        Polygon: 7
    }

    function resizePlayingField(isInLandscapeMode, isNewBoard) {

        if (!isInLandscapeMode) {
            //todo: need to reposition all the controls
            // OR
            // load in a different view
            //return;
        }

        var boardCanvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        var ctx = boardCanvas.getContext("2d");

        screenHeight = window.innerHeight;
        screenWidth = window.innerWidth;

        boardCanvas.width = screenWidth;
        boardCanvas.height = screenHeight;
        drawBoardMarkings();
        initBoardMarkingCalculations();
    }

    function initBoardMarkingCalculations() {
        var xPos = screenWidth / 2 / window.game.worldConstants.Scale;
        var yPos = screenHeight / 2 / window.game.worldConstants.Scale;
        var radius = 4;

        boardCentreCircleData.middleX = xPos * window.game.worldConstants.Scale;
        boardCentreCircleData.middleY = yPos * window.game.worldConstants.Scale;
        boardCentreCircleData.scaledRadius = radius * window.game.worldConstants.Scale;
        boardCentreCircleData.endAngle = Math.PI * 2;

        halfWayLineData.xPos = boardCentreCircleData.middleX;
        halfWayLineData.yPos = screenHeight - boardEdgeWidthInPixels;

    }

    function drawBoardMarkings() {
        var boardCanvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        var ctx = boardCanvas.getContext("2d");

        // Halfway circle
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        ctx.arc(boardCentreCircleData.middleX, boardCentreCircleData.middleY, boardCentreCircleData.scaledRadius, 0, boardCentreCircleData.endAngle, true);
        ctx.lineWidth = 10;
        ctx.closePath();
        ctx.stroke();


        // Halfway line        
        ctx.moveTo(halfWayLineData.xPos, boardEdgeWidthInPixels);
        ctx.lineTo(halfWayLineData.xPos, halfWayLineData.yPos);
        ctx.stroke();
    }

    function createPuckInitialSettings(gameMode) {
        var boardCanvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        var ctx = boardCanvas.getContext("2d");
        if (gameMode === window.game.gameType.singlePlayer || gameMode === window.game.gameType.singlePlayerMultiPuck) {
            return {
                id: window.game.worldConstants.PuckId,
                x: ctx.canvas.width * 0.8 / window.game.worldConstants.Scale,
                y: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
                radius: ctx.canvas.width / window.game.worldConstants.Scale / puckRadiusSizeRatio,
                isStatic: false,
                density: 1,
                puckcolor: window.game.worldConstants.BallPuckColour,
                fixedRotation: true,
                type: entityType.Puck
            };

        }

        // std two player setup
        return {
            id: window.game.worldConstants.PuckId,
            x: ctx.canvas.width / 2 / window.game.worldConstants.Scale,
            y: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
            radius: ctx.canvas.width / window.game.worldConstants.Scale / puckRadiusSizeRatio,
            isStatic: false,
            density: 1,
            puckcolor: window.game.worldConstants.BallPuckColour,
            fixedRotation: true,
            type: entityType.Puck
        };
    }

    function createBat1InitialSettings() {
        var boardCanvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        var ctx = boardCanvas.getContext("2d");
        return {
            id: window.game.worldConstants.Player1Id,
            x: 0.9 * 2,
            y: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
            halfHeight: 2,
            halfWidth: 0.9,
            isStatic: false,
            density: 10,
            radius: ctx.canvas.width / window.game.worldConstants.Scale / batRadiusSizeRatio,
            playercolor: window.game.worldConstants.Player1Colour,
            useShadow: false,
            playerName: null,
            type: entityType.Player
        }
    }

    function createBat2InitialSettings() {
        var boardCanvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        var ctx = boardCanvas.getContext("2d");
        return {
            id: window.game.worldConstants.Player2Id,
            x: ctx.canvas.width / window.game.worldConstants.Scale - (0.9 * 2),
            y: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
            halfHeight: 2,
            halfWidth: 0.9,
            isStatic: false,
            density: 10,
            radius: ctx.canvas.width / window.game.worldConstants.Scale / batRadiusSizeRatio,
            playercolor: window.game.worldConstants.Player2Colour,
            useShadow: false,
            playerName: null,
            type: entityType.PlayerAlternateImage
        };
    }

    function setupAllWorldBodySettings(gameMode) {
        var boardCanvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        var ctx = boardCanvas.getContext("2d");

        if (gameMode === window.game.gameType.singlePlayer || gameMode === window.game.gameType.singlePlayerMultiPuck) {
            var entities = [
                {
                    id: window.game.worldConstants.groundBottomId,
                    x: ctx.canvas.width / 2 / window.game.worldConstants.Scale,
                    y: ctx.canvas.height / window.game.worldConstants.Scale - 0.5,
                    halfHeight: boardEdgeHalfWidth,
                    halfWidth: ctx.canvas.width / window.game.worldConstants.Scale,
                    color: window.game.worldConstants.BoardEdgeColour,
                    isStatic: true,
                    type: entityType.Rectangle,
                    requiresRedraw: false
                },
                {
                    id: window.game.worldConstants.groundTopId,
                    x: ctx.canvas.width / 2 / window.game.worldConstants.Scale,
                    y: 0.5, halfHeight: boardEdgeHalfWidth,
                    halfWidth: ctx.canvas.width / window.game.worldConstants.Scale,
                    color: window.game.worldConstants.BoardEdgeColour,
                    isStatic: true,
                    type: entityType.Rectangle,
                    requiresRedraw: false
                },
                {
                    id: window.game.worldConstants.groundLeftId,
                    x: 0.5, y: (ctx.canvas.height / 2 / window.game.worldConstants.Scale),
                    halfHeight: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
                    halfWidth: boardEdgeHalfWidth, color: window.game.worldConstants.BoardEdgeColour,
                    isStatic: true,
                    type: entityType.Rectangle,
                    requiresRedraw: false
                },
                {
                    id: window.game.worldConstants.groundRightId,
                    x: (ctx.canvas.width / window.game.worldConstants.Scale) - 0.5,
                    y: (ctx.canvas.height / 2 / window.game.worldConstants.Scale),
                    halfHeight: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
                    halfWidth: boardEdgeHalfWidth, color: window.game.worldConstants.BoardEdgeColour,
                    isStatic: true,
                    type: entityType.Rectangle,
                    requiresRedraw: false
                },
                createBat1InitialSettings()];
            if (gameMode === window.game.gameType.singlePlayerMultiPuck) {
                var puck1 = createPuckInitialSettings(gameMode);
                puck1.y = ctx.canvas.height / 4 / window.game.worldConstants.Scale;
                var puck2 = createPuckInitialSettings(gameMode);

                puck2.y = ctx.canvas.height / 1.25 / window.game.worldConstants.Scale;
                puck2.id = window.game.worldConstants.PuckSecondaryId;
                entities.push(puck1);
                entities.push(puck2);

            } else {
                entities.push(createPuckInitialSettings(gameMode));
            }

            // We ensure we put the goal as the last entity so that it is drawn last and is therefore drawn
            // over the top of the puck. Sort of a cheapo z-index
            entities.push({
                id: window.game.worldConstants.player1Goal,
                x: 1,
                y: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
                halfHeight: 4.0,
                halfWidth: 0.1,
                isStatic: true,
                density: 1,
                color: window.game.worldConstants.GoalColourPlayer1,
                useLeftShadow: false,
                useRightShadow: true,
                type: entityType.Goal,
                visibleHalfHeight: 4.5,
                visibleHalfWidth: 0.8
            });

            return entities;

        } else {
            var entities = [
                {
                    id: window.game.worldConstants.groundBottomId,
                    x: ctx.canvas.width / 2 / window.game.worldConstants.Scale,
                    y: ctx.canvas.height / window.game.worldConstants.Scale - 0.5,
                    halfHeight: boardEdgeHalfWidth,
                    halfWidth: ctx.canvas.width / window.game.worldConstants.Scale,
                    color: window.game.worldConstants.BoardEdgeColour,
                    isStatic: true,
                    type: entityType.Rectangle,
                    requiresRedraw: false
                },
                {
                    id: window.game.worldConstants.groundTopId,
                    x: ctx.canvas.width / 2 / window.game.worldConstants.Scale,
                    y: 0.5,
                    halfHeight: boardEdgeHalfWidth,
                    halfWidth: ctx.canvas.width / window.game.worldConstants.Scale,
                    color: window.game.worldConstants.BoardEdgeColour,
                    isStatic: true,
                    type: entityType.Rectangle,
                    requiresRedraw: false
                },
                {
                    id: window.game.worldConstants.groundLeftId,
                    x: 0.5,
                    y: (ctx.canvas.height / 2 / window.game.worldConstants.Scale),
                    halfHeight: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
                    halfWidth: boardEdgeHalfWidth,
                    color: window.game.worldConstants.BoardEdgeColour,
                    isStatic: true,
                    type: entityType.Rectangle,
                    requiresRedraw: false
                },
                {
                    id: window.game.worldConstants.groundRightId,
                    x: (ctx.canvas.width / window.game.worldConstants.Scale) - 0.5,
                    y: (ctx.canvas.height / 2 / window.game.worldConstants.Scale),
                    halfHeight: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
                    halfWidth: boardEdgeHalfWidth,
                    color: window.game.worldConstants.BoardEdgeColour,
                    isStatic: true,
                    type: entityType.Rectangle,
                    requiresRedraw: false
                },
                createBat1InitialSettings(),
                createBat2InitialSettings()];
            if (gameMode === window.game.gameType.twoPlayerMultiPuck) {
                var puck1 = createPuckInitialSettings(gameMode);
                puck1.y = ctx.canvas.height / 4 / window.game.worldConstants.Scale;
                var puck2 = createPuckInitialSettings(gameMode);

                puck2.y = ctx.canvas.height / 1.25 / window.game.worldConstants.Scale;
                puck2.id = window.game.worldConstants.PuckSecondaryId;
                entities.push(puck1);
                entities.push(puck2);

            } else {
                entities.push(createPuckInitialSettings(gameMode));
            }

            // We ensure we put the goal as the last entity so that it is drawn last and is therefore drawn
            // over the top of the puck. Sort of a cheapo z-index
            entities.push({
                id: window.game.worldConstants.player1Goal,
                x: 1,
                y: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
                halfHeight: 4.0,
                halfWidth: 0.1,
                isStatic: true,
                density: 1,
                color: window.game.worldConstants.GoalColourPlayer1,
                useLeftShadow: false,
                useRightShadow: true,
                type: entityType.Goal,
                visibleHalfHeight: 4.5,
                visibleHalfWidth: 0.8
            });
            entities.push({
                id: window.game.worldConstants.player2Goal,
                x: ctx.canvas.width / window.game.worldConstants.Scale - 1,
                y: ctx.canvas.height / 2 / window.game.worldConstants.Scale,
                halfHeight: 4.0,
                halfWidth: 0.1,
                isStatic: true,
                density: 1,
                color: window.game.worldConstants.GoalColourPlayer2,
                useLeftShadow: true,
                useRightShadow: false,
                type: entityType.Goal,
                visibleHalfHeight: 4.5,
                visibleHalfWidth: 0.8
            });
        }

        return entities;
    }


    return {
        entityType: entityType,
        drawBoardMarkings: drawBoardMarkings,
        resizePlayingField: resizePlayingField,
        setupAllWorldBodySettings: setupAllWorldBodySettings,
        createBat1InitialSettings: createBat1InitialSettings,
        createBat2InitialSettings: createBat2InitialSettings,
        createPuckInitialSettings: createPuckInitialSettings
    };

}();