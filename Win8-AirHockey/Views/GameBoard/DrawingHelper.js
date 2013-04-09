/// <reference path="../../js/jquery-1.7.1-vsdoc.js" />

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

    function clearCountdownDisplay() {
        var msgContainer = $("#game-message-content");
        var msgTextEl = $("div.countdown-message", msgContainer);
        msgTextEl.empty();
    }

    // Draws the 3,2,1 countdown series of elements in the centreof the screen based on the current
    // countdown state
    function drawCountDown(countdownState, screenWidth, screenHeight) {
        if (countdownState.started) {

            var msgContainer = $("#game-message-content");
            var msgTextEl = $("div.countdown-message", msgContainer);

            var mainMessage = $('span.main-message', msgContainer);
            mainMessage.text("").show();

            var countdownElement = "<span class='count-90'>" + countdownState.count + "</span>"
                        + "<span class='count-0'>" + countdownState.count + "</span>"
                        + "<span class='count-270'>" + countdownState.count + "</span>";
            msgTextEl.empty().html(countdownElement);
            msgTextEl.show();
            var msgWidth = msgContainer.width();
            var msgHeight = msgContainer.height();

            var xPos = (screenWidth / 2) - (msgWidth / 2);
            var yPos = (screenHeight / 2) - (msgHeight / 2);

            msgContainer.css('top', yPos + 'px').css('left', xPos + 'px');
            msgContainer.show();
        }

    }

    return {
        drawCollisionDebugData: drawCollisionDebugData,
        drawScores: drawScores,
        drawCountDown: drawCountDown,
        clearCountdownDisplay: clearCountdownDisplay
    }


}();
