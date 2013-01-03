/// <reference path="../../js/Settings.js" />
/// <reference path="../../js/worldConstants.js" />

window.game.positionBoundsManager = function () {

    var settings = window.game.settings;
    var gameConst = window.game.worldConstants;

    function ensureEntityIsWithinBoundsOfPlayingField(entity, screenWidth, screenHeight) {
        if (!entity.radius) {
            return;
        }
        var pos = entity.GetPosition();

        if (pos.x <= entity.radius) {
            entity.SetPosition({ x: entity.radius, y: pos.y });
            return;
        }
        if (pos.y <= entity.radius) {
            entity.SetPosition({ x: pos.x, y: entity.radius });
            return;
        }
        var yMax = (screenHeight / gameConst.Scale) - entity.radius;
        if (pos.y >= yMax) {
            entity.SetPosition({ x: pos.x, y: yMax });
            return;
        }

        var xMax = (screenWidth / gameConst.Scale) - radius;
        if (pos.x >= xMax) {
            entity.SetPosition({ x: xMax, y: pos.y });
            return;
        }
    }

    function checkPositionLimits(simulator, screenWidth, screenHeight, gameMode) {
        var p1 = simulator.getBody(gameConst.Player1Id);
        ensureEntityIsWithinBoundsOfPlayingField(p1, screenWidth, screenHeight);

        if (gameMode === window.game.gameType.twoPlayer) {
            var p2 = simulator.getBody(gameConst.Player2Id);
            ensureEntityIsWithinBoundsOfPlayingField(p2, screenWidth, screenHeight);
        }

        // If user has elected to allow players past halfway line then return
        // so we dont test for it
        if (settings.allowPlayersToCrossHalfwayLine === true || gameMode === window.game.gameType.singlePlayer || gameMode === window.game.gameType.singlePlayerMultiPuck) {
            return;
        }


        // check that each player cannot go past their halfway line limit
        var halfwayLimit = screenWidth / 2 / gameConst.Scale;

        var p1Pos = p1.GetPosition();
        if (p1Pos.x >= halfwayLimit) {
            p1.SetPosition({ x: halfwayLimit, y: p1Pos.y });
        }

        if (gameMode === window.game.gameType.twoPlayer) {
            var p2Pos = p2.GetPosition();
            if (p2Pos.x <= halfwayLimit) {
                p2.SetPosition({ x: halfwayLimit, y: p2Pos.y });
            }
        }
    }

    return {
        checkPositionLimits: checkPositionLimits
    }

}();