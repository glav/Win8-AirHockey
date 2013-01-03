window.game.drawHelper = function () {
    "use strict";

    function drawCollisionDebugData(ctx, debugData, playerMovementState, ballCollisionState) {
        if (debugData.enabled !== true) {
            return;
        }

        var startYPos = 50;
        var startXPos = 110;

        ctx.save();
        ctx.font = "20px Arial";
        ctx.clearRect(10, 10, 200, 80);
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = '#828282';
        ctx.fillText("BatVX: " + debugData.batXVelocity, startXPos, startYPos);
        ctx.fillText("BatVY: " + debugData.batYVelocity, startXPos, (startYPos += 30));
        ctx.fillText("BallCollision.vX: " + ballCollisionState.vX, startXPos, (startYPos += 30));
        ctx.fillText("BallCollision.vY: " + ballCollisionState.vY, startXPos, (startYPos += 30));
        // not really using these values now so dont bother showing them
        //ctx.fillText("PowerApplied: " + debugData.lastPowerApplied, startXPos, (startYPos += 30));
        //ctx.fillText("ActualPowerCalced: " + debugData.lastCalculatedPower, startXPos, (startYPos += 30));
        //ctx.fillText("Impulse: " + debugData.lastImpulse, startXPos, (startYPos += 30));
        ctx.fillText("Player1Selected: " + playerMovementState.player1.isSelected, startXPos, (startYPos += 30));
        ctx.fillText("Player2Selected: " + playerMovementState.player2.isSelected, startXPos, (startYPos += 30));
        ctx.fillText("Player1WhenSelected: " + playerMovementState.player1.whenSelected, startXPos, (startYPos += 30));
        ctx.fillText("Player1XPosSelectedArray: " + playerMovementState.player1.xPosWhileHeld.length, startXPos, (startYPos += 30));


        ctx.fillText("LastEvent: " + debugData.lastEvent, startXPos, (startYPos += 30));
        ctx.fillText("HasBallCollided: " + ballCollisionState.hasCollided, startXPos, (startYPos += 30));
        ctx.fillText("BallCollidedWith: " + debugData.batIdCollidedWith, startXPos, (startYPos += 30));
        ctx.fillText("Message: " + debugData.message, startXPos, (startYPos += 30));
        ctx.stroke();
        ctx.restore();
    }

    function drawScores(ctx, gameProgress, canvasWidth) {
        ctx.save();
        ctx.font = "20px Arial";
        ctx.strokeStyle = "#000000";4
        ctx.fillStyle = '#000000';
        ctx.fillText("P1: " + gameProgress.scores.player1, 30, 55);
        ctx.fillText("P2: " + gameProgress.scores.player2, canvasWidth - 80, 55);

        ctx.stroke();

        ctx.save();
        ctx.moveTo(0, 0);
        ctx.rotate(180);
        ctx.lineTo(200, 300);
        ctx.font = "40px Arial";

        ctx.fillText("P1: " + gameProgress.scores.player1, 100, 100);
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    function drawInGameMessage(ctx, inGameMessage, canvasWidth, canvasHeight) {
        if (inGameMessage.displayText !== null) {
            ctx.save();
            ctx.font = "30px Arial";
            ctx.strokeStyle = "#000000";
            ctx.fillStyle = '#000000';

            ctx.shadowOffsetX = 7;
            ctx.shadowOffsetY = 7;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(10, 10, 10, 0.5)';

            var msgLen = inGameMessage.displayText.length;
            var xPos = (canvasWidth / 2) - (msgLen/4 * 30);

            inGameMessage.xPos = xPos;
            inGameMessage.yPos = canvasHeight / 4;

            ctx.fillText(inGameMessage.displayText, inGameMessage.xPos, inGameMessage.yPos);
            ctx.stroke();
            ctx.restore();

        }
    }

    function drawCountDown(ctx, countdownState, screenWidth, screenHeight) {
        if (countdownState.started) {
            var centreX = screenWidth / 2 - 15;
            var centreY = screenHeight / 2 - 15;
            ctx.save();
            ctx.font = "80px Arial";
            ctx.strokeStyle = "red";
            ctx.fillStyle = "red";
            ctx.shadowOffsetX = 7;
            ctx.shadowOffsetY = 7;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(10, 10, 10, 0.5)';

            ctx.fillText(countdownState.count, centreX - (centreX / 4), centreY - (centreY / 4));
            ctx.fillText(countdownState.count, centreX + (centreX / 4), centreY - (centreY / 4));
            ctx.restore();
        }

    }

    return {
        drawCollisionDebugData: drawCollisionDebugData,
        drawScores: drawScores,
        drawInGameMessage: drawInGameMessage,
        drawCountDown: drawCountDown
    }


}();
