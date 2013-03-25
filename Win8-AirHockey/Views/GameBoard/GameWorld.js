/// <reference path="DrawingHelper.js" />
/// <reference path="positionBoundsManager.js" />
/// <reference path="../../js/Settings.js" />
/// <reference path="../../js/highScoreHandler.js" />
/// <reference path="../../js/window.game.dialog.js" />
/// <reference path="window.game.stateBag.js" />
/// <reference path="singlePlayerHandler.js" />

window.game.world = function () {
    "use strict";

    var nav = WinJS.Navigation;
    var gameMode = window.game.gameType.twoPlayer;
    var hasBoardBeenInitiallyDrawn = false;  // true once thee board has been drawn at least once
    var world = {};
    var bodiesState = null;
    var simulator = null;
    var canvasWidth, canvasHeight, canvas, ctx;
    var initTimeout = null;
    var screenHeight = window.innerHeight;
    var screenWidth = window.innerWidth;

    var settings;

    var gameProgress = {
        gameState: window.game.gameStateType.NotStarted
    };


    var gameConst = window.game.worldConstants;

    //Plugin native requestAnimFrame function if possible
    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (/* function */ callback, /* DOMElement */ element) {
                    window.setTimeout(callback, 1000 / 60);
                };
    })();

    function loop(animStart) {
        if (gameProgress.gameState === window.game.gameStateType.Quit) {
            return;
        }
        // Cancelany rotation and angular velocity as a puck typically does not
        // exhibit this behaviour

        //if (gameMode === window.game.gameType.twoPlayer) {
        //    var puck = simulator.getBody(window.game.worldConstants.PuckId);
        //    puck.SetAngularVelocity(0);
        //}
        //if (gameMode === window.game.gameType.twoPlayerMultiPuck) {
        //    var puck2 = simulator.getBody(window.game.worldConstants.PuckSecondaryId);
        //    puck2.SetAngularVelocity(0);
        //}

        if (window.game.stateBag.ballCollisionState.hasCollided) {

            window.game.stateBag.debugData.batIdCollidedWith = window.game.stateBag.ballCollisionState.batIdCollidedWith;
            // Give the puck a little extra kick
            simulator.applyImpulseVector(window.game.stateBag.ballCollisionState.puckIdThatCollided, { x: window.game.stateBag.ballCollisionState.vX, y: window.game.stateBag.ballCollisionState.vY }, settings.powerToApplyOnPuckCollision);

            //simulator.cancelAllMovement(bat);
            window.game.stateBag.ballCollisionState.clear();
        }

        if (gameProgress.gameState === window.game.gameStateType.Paused
                || gameProgress.gameState === window.game.gameStateType.Ended) {
            simulator.cancelAllMovement(simulator.getBody(gameConst.PuckId));
            if (gameMode === window.game.gameType.singlePlayerMultiPuck || gameMode === window.game.gameType.twoPlayerMultiPuck) {
                simulator.cancelAllMovement(simulator.getBody(gameConst.PuckSecondaryId));
            }
            simulator.cancelAllMovement(simulator.getBody(gameConst.Player1Id));
            if (gameMode === window.game.gameType.twoPlayer || gameMode === window.game.gameType.twoPlayerMultiPuck) {
                simulator.cancelAllMovement(simulator.getBody(gameConst.Player2Id));
            }
            simulator.clearForces();
        }
        update(animStart);
        draw();
        requestAnimFrame(loop);
    }

    function update(animStart) {
        if (gameProgress.gameState === window.game.gameStateType.Quit) {
            return;
        }

        window.game.positionBoundsManager.checkPositionLimits(simulator, screenWidth, screenHeight, gameMode);

        simulator.update();
        bodiesState = simulator.getState();

        for (var id in bodiesState) {
            var entity = world[id];

            if (entity) entity.update(bodiesState[id]);
        }
    }

    function draw() {
        if (gameProgress.gameState === window.game.gameStateType.Quit) {
            return;
        }
        // Clear the canvas
        //ctx.clearRect(canvasUpdateArea.leftPos, canvasUpdateArea.topPos, canvasUpdateArea.width, canvasUpdateArea.height);

        ctx.clearRect(window.game.stateBag.canvasUpdateArea.leftPos, window.game.stateBag.canvasUpdateArea.topPos,
            window.game.stateBag.canvasUpdateArea.width, window.game.stateBag.canvasUpdateArea.height);
        // Draw the basic board elements like halfway line and other things that dont interact
        // with the world
        window.game.board.drawBoardMarkings();

        // Run through our drawing events
        window.game.drawHelper.drawCollisionDebugData(ctx, window.game.stateBag.debugData, window.game.stateBag.playerMovementState, window.game.stateBag.ballCollisionState);

        // This now done within the entity and drawn on the player bats
        //window.game.drawHelper.drawScores(ctx, gameProgress, canvasWidth);

        window.game.drawHelper.drawInGameMessage(ctx, window.game.stateBag.inGameMessage, canvasWidth, canvasHeight);
        window.game.drawHelper.drawCountDown(ctx, window.game.stateBag.countdownState, screenWidth, screenHeight);

        //Now update the actual entities in the world
        for (var id in world) {
            var entity = world[id];
            if (entity.requiresRedrawing === true || hasBoardBeenInitiallyDrawn === false) {
                entity.draw(ctx);
            }
        }

        hasBoardBeenInitiallyDrawn = true;
    }

    function countdownTickEvent() {
        window.game.stateBag.countdownState.count -= 1;
        if (window.game.stateBag.countdownState.count <= 0) {
            //window.clearInterval(window.game.stateBag.countdownState.timer);
            window.game.stateBag.countdownState.started = false;
            window.game.stateBag.countdownState.count = 0;
            countdownCompletedEvent();
        } else {
            // haven't reached the countdown yet so let the timer do another tick
            window.setTimeout(countdownTickEvent, 1000);
        }
    }

    function countdownCompletedEvent() {
        if (gameProgress.gameState === window.game.gameStateType.Paused
                || gameProgress.gameState === window.game.gameStateType.Quit
                || gameProgress.gameState === window.game.gameStateType.Ended) {
            return;
        }
        // kick off the puck in a random direction and power
        var power = 0;
        var angle = 0;
        if (gameMode === window.game.gameType.singlePlayer || gameMode === window.game.gameType.singlePlayerMultiPuck) {
            power = Math.random() * (settings.singlePlayerDifficulty * 500) + 500;
            angle = (Math.random() * 90) + 120;
            window.game.stateBag.scores.singlePlayerStartTime = new Date();
        } else {
            power = Math.random() * 150 + 10;
            angle = Math.random() * 360;
        }
        setTimeout(function () {
            if (simulator !== null) {
                simulator.applyImpulse(gameConst.PuckId, parseInt(angle), parseInt(power));
                if (gameMode === window.game.gameType.singlePlayerMultiPuck) {
                    var angle2 = (Math.random() * 90) + 120;
                    simulator.applyImpulse(gameConst.PuckSecondaryId, parseInt(angle2), parseInt(power))
                } else if (gameMode === window.game.gameType.twoPlayerMultiPuck) {
                    var angle2 = (Math.random() * 360) + 120;
                    simulator.applyImpulse(gameConst.PuckSecondaryId, parseInt(angle2), parseInt(power))
                }
                gameProgress.gameState = window.game.gameStateType.InProgress;
            }
        }, 500);

    }

    function startCountDown() {
        window.game.stateBag.countdownState.count = 3;
        window.game.stateBag.countdownState.started = true;
        window.setTimeout(countdownTickEvent, 1000);
    }

    function scoreGoal(idA, idB) {
        if (gameProgress.gameState === window.game.gameStateType.Quit) {
            return;
        }

        if (window.game.stateBag.debugData.enabled !== true) {
            gameProgress.gameState = window.game.gameStateType.Paused;
        }

        // SO who scored?
        var message;
        if (gameMode === window.game.gameType.twoPlayer || gameMode === window.game.gameType.twoPlayerMultiPuck) {
            var goalHitId = idA.indexOf("goal") >= 0 ? idA : idB;
            if (goalHitId === gameConst.player1Goal) {
                message = "Player 2 ";
                window.game.stateBag.scores.player2 += 1;
            } else {
                message = "Player 1 ";
                window.game.stateBag.scores.player1 += 1;
            }

            if (window.game.stateBag.scores.player1 >= settings.numberOfGoalsThatSignalsEndOfMatch || window.game.stateBag.scores.player2 >= settings.numberOfGoalsThatSignalsEndOfMatch) {
                // end of the match! Someone has won
                var msg = "Player ";
                if (window.game.stateBag.scores.player1 >= settings.numberOfGoalsThatSignalsEndOfMatch) {
                    msg += "1";
                } else {
                    msg += "2";
                }
                msg += " wins! Final Score: Player 1: " + window.game.stateBag.scores.player1 + ", Player 2: " + window.game.stateBag.scores.player2;
                gameProgress.gameState = window.game.gameStateType.Ended;
                window.game.dialog.show(msg + " Want to play again?");
            } else {
                // continue playing....
                window.game.stateBag.inGameMessage.displayText = "GOAL! " + message + "scores";
            }

            world[gameConst.Player1Id].setScore(window.game.stateBag.scores.player1);
            world[gameConst.Player2Id].setScore(window.game.stateBag.scores.player2);

        } else {
            window.game.stateBag.scores.singlePlayerEndTime = new Date();
            var singlePlayerLastedDuration = window.game.singlePlayerHandler.handlePlayerDuration(window.game.stateBag.scores.singlePlayerStartTime, window.game.stateBag.scores.singlePlayerEndTime);
            message = "Computer scored! You lasted " + singlePlayerLastedDuration.durationDescription;
            if (window.game.highScoreHandler.isHighScore(singlePlayerLastedDuration.durationInMilliseconds, settings)) {
                message += " New High Score!";
                window.game.stateBag.scores.highScores = window.game.highScoreHandler.updateHighScores(singlePlayerLastedDuration.durationInMilliseconds, settings);
            }
            window.game.dialog.show(message + " Want to play again?");
        }

        if (window.game.stateBag.debugData.enabled !== true) {
            if (gameProgress.gameState !== window.game.gameStateType.Ended &&
                    (gameMode === window.game.gameType.twoPlayer
                        || gameMode === window.game.gameType.twoPlayerMultiPuck)) {
                setTimeout(function () {
                    window.game.stateBag.inGameMessage.clearMessage();
                    gameProgress.gameState = window.game.gameStateType.InProgress;
                    initStartGameSequence();
                }, 3500);
            }
        } else {
            // If debug is enabled, just clear the message and keep going
            setTimeout(function () {
                gameProgress.gameState = window.game.gameStateType.InProgress;
                window.game.stateBag.inGameMessage.clearMessage();
            }, 3500);
        }
    }

    function getMouseAndBodyDataFromMouseDownEvent(e) {
        var xPos = (e.clientX - canvas.getBoundingClientRect().left) / window.game.worldConstants.Scale;
        var yPos = (e.clientY - canvas.getBoundingClientRect().top) / window.game.worldConstants.Scale;
        var selectedBody = simulator.getBodyAt(xPos, yPos);
        return { body: selectedBody, mouseX: xPos, mouseY: yPos };
    }

    function handlePointerInitiatedOrReleased(e, isReleased) {
        if (gameProgress.gameState === window.game.gameStateType.Quit) {
            return;
        }

        var eventData = getMouseAndBodyDataFromMouseDownEvent(e);
        var selectedBody = eventData.body;
        if (typeof selectedBody !== 'undefined' && selectedBody !== null) {

            var selectedId = selectedBody.GetUserData();

            // Set player movement state if required
            if (doesIdRepresentPlayerBat(selectedId)) {
                var playerState = window.game.stateBag.playerMovementState.player1;
                var isPlayer1 = true;
                if (selectedId === gameConst.Player2Id) {
                    isPlayer1 = false;
                    playerState = window.game.stateBag.playerMovementState.player2;
                }

                var newstate = isReleased === true ? false : true;
                if (playerState.isSelected !== newstate) {

                    window.game.stateBag.playerMovementState.clearPlayerState(isPlayer1);
                }

                playerState.isSelected = newstate;

                // If the player is selected, then begin recording its x and y positions
                // while it is being held down
                if (playerState.isSelected) {
                    window.game.stateBag.playerMovementState.pushMovementStateForPlayer(isPlayer1, eventData.mouseX, eventData.mouseY);
                } else {
                    window.game.stateBag.playerMovementState.clearPlayerState(isPlayer1);
                }

            }
        }
    }

    function handleMouseMove(e) {
        if (gameProgress.gameState === window.game.gameStateType.Paused
                || gameProgress.gameState === window.game.gameStateType.Quit
            || gameProgress.gameState === window.game.gameStateType.Ended) {
            return;
        }

        var eventData = getMouseAndBodyDataFromMouseDownEvent(e);
        var selectedBody = eventData.body;

        if (typeof selectedBody !== 'undefined' && selectedBody !== null) {

            var selectedId = selectedBody.GetUserData();

            if (!doesIdRepresentAPuck(selectedId)) {

                var entity = world[selectedId];
                var radius = 0;
                if (entity.radius) {
                    radius = entity.radius;
                }

                if (eventData.mouseX <= radius || eventData.mouseY <= radius
                        || eventData.mouseY >= ((screenHeight / gameConst.Scale) - radius)
                        || eventData.mouseX >= ((screenWidth / gameConst.Scale) - radius)) {
                    return;
                }

                window.game.stateBag.debugData.message = "setting body position: x:" + eventData.mouseX + ", y:" + eventData.mouseY;

                // If the user has their touch point held down on the player bat, then we
                // need to cancel the velocity of the bat otherwise inertia comes into play
                // and the simulator tries to move the bat via inertia BUT it gets repositioned
                //as the users touch point may not change or it changes different to inertia so
                // you get a very jerky effect.In addition, we issue this cancel via a setTimeout
                // rather than directly so any collisions against the puck can still work and be 
                // scheduled approriately. Doing it directly in line has the effect of NOT
                // hitting the puck and causes weird bounce behaviour.
                if ((selectedId === window.game.worldConstants.Player1Id && window.game.stateBag.playerMovementState.player1.isSelected)
                        || (selectedId === window.game.worldConstants.Player2Id && window.game.stateBag.playerMovementState.player2.isSelected)) {
                    setTimeout(function () {
                        selectedBody.SetLinearVelocity({ x: 0, y: 0 });
                        selectedBody.SetAngularVelocity(0);
                    }, 1000 / 60);
                }
                selectedBody.SetPosition({ x: eventData.mouseX, y: eventData.mouseY });

                // Not sure if this required.
                //var entityState = simulator.getState()[selectedId];
                //entity.update(entityState);

            }
        }
    };

    function doesIdRepresentPlayerBat(bodyId) {
        if (typeof bodyId !== 'undefined' && bodyId.indexOf('bat') >= 0) {
            return true;
        }
        return false;
    }
    function doesIdRepresentGoal(bodyId) {
        if (typeof bodyId !== 'undefined' && bodyId.indexOf('goal') >= 0) {
            return true;
        }
        return false;
    }

    function handleGestureChangeForPlayerVelocity(e, gestureType) {
        if (gameProgress.gameState === window.game.gameStateType.Quit) {
            return;
        }

        var eventData = getMouseAndBodyDataFromMouseDownEvent(e);
        var selectedBody = eventData.body;

        if (typeof selectedBody !== 'undefined' && selectedBody !== null) {

            var selectedId = selectedBody.GetUserData();

            // We need to guage how fast the user is moving the bat so we can tell
            // Box2D how fast the object is going so it can calculate collission properly
            // otherwise Box2D does not know about the bat's velocity since the MSGesture and
            // MSPointerEvents happen outside its scope
            if (doesIdRepresentPlayerBat(selectedId)) {
                // Dont cancel inertia or movement on release for now
                //if (gestureType === window.game.gestureType.change) {
                //    if (selectedId === window.game.worldConstants.Player1Id && !window.game.stateBag.playerMovementState.isPlayer1Selected
                //            || selectedId === window.game.worldConstants.Player2Id && !window.game.stateBag.playerMovementState.isPlayer2Selected) {
                //        simulator.cancelAllMovement(selectedBody);
                //    }
                //} else {
                selectedBody.SetLinearVelocity({ x: e.velocityX * gameConst.Scale, y: e.velocityY * gameConst.Scale });
                //}
            }

        }
    }

    function doesIdRepresentAPuck(idToCheck) {
        if (idToCheck && (idToCheck === window.game.worldConstants.PuckId || idToCheck === window.game.worldConstants.PuckSecondaryId)) {
            return true;
        }
        return false;
    }

    function handlePostSolveCollision(idA, idB, impulse) {
        if (gameProgress.gameState === window.game.gameStateType.Quit) {
            return;
        }

        if ((doesIdRepresentGoal(idA) || doesIdRepresentGoal(idB)) && (doesIdRepresentAPuck(idA) || doesIdRepresentAPuck(idB))) {
            scoreGoal(idA, idB);
        }

        //if ((idA === gameConst.PuckId || idB === gameConst.PuckId) && (doesIdRepresentPlayerBat(idA) || doesIdRepresentPlayerBat(idB))) {
        if ((doesIdRepresentAPuck(idA) || doesIdRepresentAPuck(idB)) && (doesIdRepresentPlayerBat(idA) || doesIdRepresentPlayerBat(idB))) {

            var bat, batId;
            if (doesIdRepresentPlayerBat(idA)) {
                batId = idA;
            } else {
                batId = idB;
            }
            bat = simulator.getBody(batId);
            window.game.stateBag.ballCollisionState.batIdCollidedWith = batId;

            var playerState = window.game.stateBag.playerMovementState.player1;
            if (batId === window.game.worldConstants.Player2Id) {
                playerState = window.game.stateBag.playerMovementState.player2;
            }

            var aggregateYVelocity = 0;
            var aggregateXVelocity = 0;

            var puckIdThatCollided = gameConst.PuckId;

            if (gameMode === window.game.gameType.singlePlayerMultiPuck || gameMode === window.game.gameType.twoPlayerMultiPuck) {
                if (idA === window.game.worldConstants.PuckSecondaryId || idB === window.game.worldConstants.PuckSecondaryId) {
                    puckIdThatCollided = window.game.worldConstants.PuckSecondaryId;
                }
            }

            var puckBody = simulator.getBody(puckIdThatCollided);

            // Only do this special condition if both players are selected as we dont get
            // proper velocity when two pointer events are fired together
            // If we dont do this, when the bat hits the puck, there is not much velocity or bounce generated
            //if (window.game.stateBag.playerMovementState.player1.isSelected && window.game.stateBag.playerMovementState.player2.isSelected) {

              // do it for 2 player since we removed the gesture handling in 2 player
             if (gameMode === window.game.gameType.twoPlayer || gameMode === window.game.gameType.twoPlayerMultiPuck) {
                 var xLen = playerState.xPosWhileHeld.length;
                var yLen = playerState.yPosWhileHeld.length;
                var xVel = 0, yVel = 0, delta = 0;
                // Figure out the total velocity and difference in velocity changes for the X axis and
                // the Y axis by going through all items in the array and adding in the delta diff
                 // between each one.

                for (var xcnt = 0; xcnt < xLen; xcnt++) {
                    if (xcnt === 0) {
                        xVel = playerState.xPosWhileHeld[xcnt];
                    } else {
                        delta = playerState.xPosWhileHeld[xcnt] - playerState.xPosWhileHeld[xcnt - 1];
                        xVel += delta;
                    }
                }
                // If the initial position was less than the starting position, then ensure the 
                // velocity is reversed as we are going in the negative direction
                if (playerState.xPosWhileHeld[0] > playerState.xPosWhileHeld[xLen - 1]) {
                    xVel *= -1;
                }

                for (var ycnt = 0; ycnt < yLen; ycnt++) {
                    if (ycnt === 0) {
                        yVel = playerState.yPosWhileHeld[ycnt];
                    } else {
                        delta = playerState.yPosWhileHeld[ycnt] - playerState.yPosWhileHeld[ycnt - 1];
                        yVel += delta;
                    }
                }

                // If the initial position was less than the starting position, then ensure the 
                // velocity is reversed as we are going in the negative direction
                if (playerState.yPosWhileHeld[0] > playerState.yPosWhileHeld[yLen - 1]) {
                    yVel *= -1;
                }

                aggregateXVelocity = xVel;
                aggregateYVelocity = yVel;
                window.game.stateBag.debugData.batXVelocity = xVel;
                window.game.stateBag.debugData.batYVelocity = yVel;
            } else {

                var centreBallPosition = puckBody.GetWorldCenter();
                var ballVelocity = puckBody.GetLinearVelocityFromWorldPoint(centreBallPosition);
                var centreBatPosition = bat.GetWorldCenter();
                var batVelocity = bat.GetLinearVelocityFromWorldPoint(centreBatPosition);

                // add both X velocity for ball and bat together. They should cancel each other
                // out if going opposite dir. Same for Y dir
                aggregateYVelocity = batVelocity.y + ballVelocity.y;// / 2;
                aggregateXVelocity = batVelocity.x + ballVelocity.x;// / 2;
                window.game.stateBag.debugData.batXVelocity = batVelocity.x;
                window.game.stateBag.debugData.batYVelocity = batVelocity.y;
            }

            // put a cap on the intertia
            //var batInertia = bat.GetInertia();
            //batInertia = batInertia > 5000 ? batInertia = 5000 : batInertia;

            window.game.stateBag.ballCollisionState.hasCollided = true;
            window.game.stateBag.ballCollisionState.puckIdThatCollided = puckIdThatCollided;
            window.game.stateBag.ballCollisionState.vX = aggregateXVelocity;
            window.game.stateBag.ballCollisionState.vY = aggregateYVelocity;

            if (impulse !== 0) {
                window.game.stateBag.debugData.lastImpulse = impulse;
            }

        }
    }

    function initStartGameSequence() {
        if (gameProgress.gameState === window.game.gameStateType.Quit) {
            return;
        }

        hasBoardBeenInitiallyDrawn = false;
        window.game.stateBag.inGameMessage.clearMessage();
        gameProgress.gameState = window.game.gameStateType.NotStarted;

        if (simulator == null) {
            return;
        }
        var initialState = window.game.board.setupAllWorldBodySettings();
        var bat1 = simulator.getBody(gameConst.Player1Id);

        var b1Settings = window.game.board.createBat1InitialSettings();

        if (gameMode == window.game.gameType.singlePlayerMultiPuck || gameMode == window.game.gameType.twoPlayerMultiPuck) {
            var ballSettings = window.game.board.createPuckInitialSettings(gameMode);
            var ball = simulator.getBody(gameConst.PuckId);
            ball.SetPosition({ x: ballSettings.x, y: ctx.canvas.height / 4 / window.game.worldConstants.Scale });
            var ball2 = simulator.getBody(gameConst.PuckSecondaryId);
            ball2.SetPosition({ x: ballSettings.x, y: ctx.canvas.height / 1.25 / window.game.worldConstants.Scale });
        } else {
            var ballSettings = window.game.board.createPuckInitialSettings(gameMode);
            var ball = simulator.getBody(gameConst.PuckId);
            ball.SetPosition({ x: ballSettings.x, y: ballSettings.y });
        }
        // ball.SetPosition({ x: 25, y: ballSettings.y });
        bat1.SetPosition({ x: b1Settings.x, y: b1Settings.y });

        if (gameMode === window.game.gameType.twoPlayer || gameMode === window.game.gameType.twoPlayerMultiPuck) {
            var bat2 = simulator.getBody(gameConst.Player2Id);
            var b2Settings = window.game.board.createBat2InitialSettings();
            bat2.SetPosition({ x: b2Settings.x, y: b2Settings.y });
            // Setup timer that will check whether a player (in 2 player mode) is moving or stationary
            // even if both players have their finger down on the bat
            window.game.stateBag.playerMovementState.movementCheckTimer = setInterval(checkTwoPlayerMovementState, 1 / 15);
        } else {
            window.game.singlePlayerHandler.initialiseSinglePlayerState(gameProgress, simulator);
        }

        settings = window.game.settings.getCurrent();
        window.game.stateBag.scores.highScores = window.game.highScoreHandler.getHighScores();

        // Pre-calculate the area on the canvas that we need to clear and
        // update frequently to draw upon
        window.game.stateBag.canvasUpdateArea.leftPos = world[gameConst.groundLeftId].halfWidth * 2 * gameConst.Scale;
        window.game.stateBag.canvasUpdateArea.topPos = world[gameConst.groundTopId].halfHeight * 2 * gameConst.Scale;
        var rightBorderWidth = world[gameConst.groundRightId].halfWidth * 2 * gameConst.Scale;
        var bottomBorderHeight = world[gameConst.groundBottomId].halfHeight * 2 * gameConst.Scale;

        window.game.stateBag.canvasUpdateArea.width = canvasWidth - (window.game.stateBag.canvasUpdateArea.leftPos + rightBorderWidth);
        window.game.stateBag.canvasUpdateArea.height = canvasHeight - (window.game.stateBag.canvasUpdateArea.topPos + bottomBorderHeight);

        startCountDown();
    }

    // This function is intended to clear the player movement array if a user has selected a bat with their
    //finger but is stationary. This will prevent the values that exist in the player movement array
    // from coming into effect when calculating velocity as these values will be old from when
    // they were moving and the values being stored within the mouse move event. Since no movement is
    // occuring and the player has not released their finger from the bat, no event is fired so we
    // need to periodically check and clear our velocity and movement values if this is the case.
    // Note:This only applies in 2 player mode
    function checkTwoPlayerMovementState() {
        var player1State = window.game.stateBag.playerMovementState.player1;
        var player2State = window.game.stateBag.playerMovementState.player2;

        if (!player1State.isSelected && !player2State.isSelected) {
            // If neither player is selected, then dont bother 
            // as the events being captured will take care of this
            return;
        }

        // If the player is selected, then begin recording its x and y positions
        // while it is being held down
        if (player1State.isSelected) {
            var p1BodyPosition = simulator.getBody(window.game.worldConstants.Player1Id).GetPosition();
            window.game.stateBag.playerMovementState.pushMovementStateForPlayer(true, p1BodyPosition.x, p1BodyPosition.y);
        } else {
            window.game.stateBag.playerMovementState.clearPlayerState(true);
        }

        if (player2State.isSelected) {
            var p2BodyPosition = simulator.getBody(window.game.worldConstants.Player2Id).GetPosition();
            window.game.stateBag.playerMovementState.pushMovementStateForPlayer(false, p2BodyPosition.x, p2BodyPosition.y);
        } else {
            window.game.stateBag.playerMovementState.clearPlayerState(false);
        }

    }


    /**************** USING MS GESTURE HANDLING *******************/

    function handleMSPointerDownEvent(e) {


        window.game.stateBag.debugData.lastEvent = 'onMSPointerDown';
        if (gameMode === window.game.gameType.singlePlayerMultiPuck || gameMode === window.game.gameType.singlePlayer) {
            if (e.target === this) {
                //  Attach first contact and track device.
                if (this.gesture.pointerType === null) {
                    console.log("this.gesture.pointerType = " + this.gesture.pointerType);

                    this.gesture.addPointer(e.pointerId);
                    this.gesture.pointerType = e.pointerType;
                }
                    // Attach subsequent contacts from same device.
                else if (e.pointerType === this.gesture.pointerType) {
                    console.log("this.gesture.pointerType = e.pointerType");
                    this.gesture.addPointer(e.pointerId);
                }

                    //GLAV NOTE: The section below is included with the sample but seems to lose
                    // the gesture events sometimes when u swipe and then swipe mid way through
                    // translation

                    // New gesture recognizer for new pointer type.
                else {
                    console.log("this.gesture.pointerType = NEITHER");
                    var msGesture = new MSGesture();
                    msGesture.target = e.target;
                    e.target.gesture = msGesture;
                    e.target.gesture.pointerType = e.pointerType;
                    e.target.gesture.addPointer(e.pointerId);
                }
            }
        }

        // We dont need this routine for now. Retaining just in case we need to know when a player is selected
        // held
        handlePointerInitiatedOrReleased(e, false);

        handleMouseMove(e);
    }
    function handleMSPointerUpEvent(e) {
        window.game.stateBag.debugData.lastEvent = 'onMSPointerUp';
        // We dont need this routine for now. Retaining just in case we need to know when a player is selected
        // held
        handlePointerInitiatedOrReleased(e, true);
    }
    function handleMSPointerMoveEvent(e) {
        window.game.stateBag.debugData.lastEvent = 'onMSPointerMove';

        handlePointerInitiatedOrReleased(e);
        //Important Note: Handling a mouse move in this event is not strictly correct and causes
        // the player to move the puck when simply moving the mouse over the puck without holding
        // down the mouse button.
        // HOWEVER !!
        // Without doing this, when 2 players are touching the game board trying to move their
        // bats around, the movement is jerky and is often lost meaning 2 players cannot really
        // play very well. Having the mouse movement also handled in here means that 2 player
        // interaction is much much smoother and plays quite well.
        handleMouseMove(e);
    }
    function handleMSPointerCancelEvent(e) {
        window.game.stateBag.debugData.lastEvent = 'onMSPointerCancel';
    }
    function handleMSLostPointerCaptureEvent(e) {
        window.game.stateBag.debugData.lastEvent = 'onMSLostPointerCapture';
    }

    function handleMSGestureChangeEvent(e) {
        window.game.stateBag.debugData.lastEvent = 'onMSGestureChange';
        handleMouseMove(e);
        handleGestureChangeForPlayerVelocity(e, window.game.gestureType.change);
    }
    function handleMSGestureTapEvent(e) {
        window.game.stateBag.debugData.lastEvent = 'onMSGestureTap';
    }
    function handleMSGestureEndEvent(e) {
        window.game.stateBag.debugData.lastEvent = 'onMSGestureEnd';
        handleGestureChangeForPlayerVelocity(e, window.game.gestureType.end);
    }
    function handleMSGestureHoldEvent(e) {
        window.game.stateBag.debugData.lastEvent = 'onMSGestureHold';
        handleGestureChangeForPlayerVelocity(e, window.game.gestureType.hold);
    }
    function handleMSGestureStartEvent(e) {
        window.game.stateBag.debugData.lastEvent = 'onMSGestureStart';
        handleGestureChangeForPlayerVelocity(e, window.game.gestureType.start);
    }
    function handleMSInertiaStartEvent(e) {
        window.game.stateBag.debugData.lastEvent = 'onMSInertiaStart';
        // We dont need this routine for now. Retaining just in case we need to know when a player is selected
        // held
        handlePointerInitiatedOrReleased(e, true);
        //handleMouseMove(e);
    }

    /***** END MS GESTURE HANDLING ******/

    function initGameBodies(gameType) {
        if (typeof gameType !== 'undefined') {
            gameMode = gameType;
        }

        gameProgress.gameState = window.game.gameStateType.NotStarted;
        canvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        ctx = canvas.getContext("2d");

        canvasWidth = ctx.canvas.width;
        canvasHeight = ctx.canvas.height;

        var initialState = window.game.board.setupAllWorldBodySettings(gameMode);
        window.game.stateBag.scores.player1 = 0;
        window.game.stateBag.scoresplayer2 = 0;


        for (var i = 0; i < initialState.length; i++) {
            var entity = window.game.entities.buildEntity(initialState[i]);
            world[initialState[i].id] = entity;

            if (typeof initialState[i].requiresRedraw !== 'undefined' && initialState[i].requiresRedraw === false) {
                entity.requiresRedrawing = false;
            }
        }

        // Interval rate is set to 30 instead of the typical 60 to improve responsiveness
        simulator = new window.game.simulator.box2dWrapper(30, false, canvasWidth, canvasHeight, window.game.worldConstants.Scale, gameMode);
        simulator.setBodies(world, true);

        window.game.entities.setDebugMode(window.game.stateBag.debugData.enabled);

        window.game.dialog.initialise(function () {
            // User presses yes
            initStartGameSequence();
        }, function () {
            // user presses no
            stopGame();
            nav.navigate('/Views/TitleScreen/TitleControl.html');
        });

        gestureHandler.addMovementEventListeners({
            element: canvas,
            onMSPointerDown: handleMSPointerDownEvent,
            onMSPointerUp: handleMSPointerUpEvent,
            onMSPointerMove: handleMSPointerMoveEvent,
            onMSPointerCancel: handleMSPointerCancelEvent,
            onMSLostPointerCapture: handleMSLostPointerCaptureEvent,
            onMSGestureChange: handleMSGestureChangeEvent,
            onMSGestureTap: handleMSGestureTapEvent,
            onMSGestureEnd: handleMSGestureEndEvent,
            onMSGestureHold: handleMSGestureHoldEvent,
            onMSInertiaStart: handleMSInertiaStartEvent,
            osMSGestureStart: handleMSGestureStartEvent
        });

        /**************** END USING MS GESTURE HANDLING *******************/

        // These events handle the collision detection
        simulator.addContactListener({
            BeginContact: function (idA, idB) {
            },
            EndContact: function (idA, idB) {
            },
            PostSolve: function (idA, idB, impulse) {
                if (window.game.stateBag.ballCollisionState.hasCollided === true) {
                    return;
                }

                if (gameProgress.gameState === window.game.gameStateType.Paused) {
                    return;
                }
                handlePostSolveCollision(idA, idB, impulse);
            },
            PreSolve: function (idA, idB, oldManifold) {
            }
        });

        //initStartGameSequence();
    }

    function startAnimationLoop() {
        requestAnimFrame(loop);
    }

    function stopGame() {
        gameProgress.gameState = window.game.gameStateType.Quit;
        gestureHandler.clearMovementEventListeners({
            element: canvas,
            onMSPointerDown: handleMSPointerDownEvent,
            onMSPointerUp: handleMSPointerUpEvent,
            onMSPointerMove: handleMSPointerMoveEvent,
            onMSPointerCancel: handleMSPointerCancelEvent,
            onMSLostPointerCapture: handleMSLostPointerCaptureEvent,
            onMSGestureChange: handleMSGestureChangeEvent,
            onMSGestureTap: handleMSGestureTapEvent,
            onMSGestureEnd: handleMSGestureEndEvent,
            onMSGestureHold: handleMSGestureHoldEvent,
            onMSInertiaStart: handleMSInertiaStartEvent,
            osMSGestureStart: handleMSGestureStartEvent
        });

        world = {};
        bodiesState = null;
        simulator = null;
        canvas = null;
        ctx = null;
        initTimeout = null;
        clearInterval(window.game.stateBag.playerMovementState.movementCheckTimer);
        window.game.stateBag.playerMovementState.movementCheckTimer = null;
    }

    // returns the interface to the consumers
    return {
        initGameBodies: initGameBodies,
        startAnimationLoop: startAnimationLoop,
        initStartGameSequence: initStartGameSequence,
        stopGame: stopGame
    };
}();

