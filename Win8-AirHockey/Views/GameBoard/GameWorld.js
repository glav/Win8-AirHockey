/// <reference path="DrawingHelper.js" />
/// <reference path="../../js/Settings.js" />
window.game.world = function () {
    "use strict";

    var world = {};
    var bodiesState = null;
    var simulator = null;
    var canvasWidth;
    var canvasHeight;
    var canvas;
    var ctx;
    var initTimeout = null;
    var isMouseDown = false;
    var screenHeight = window.innerHeight;
    var screenWidth = window.innerWidth;
    var mouseX, mouseY;
    var ballCollisionState = {
        hasCollided: false,
        power: 0,
        vX: 0,
        vY: 0,
        batIdCollidedWith: null
    };

    var debugData = {
        enabled: false,
        batXVelocity: 0,
        batYVelocity: 0,
        lastCalculatedPower: 0,
        lastPowerApplied: 0,
        lastImpulse: 0,
        lastEvent: '',
        message: '',
        batIdCollidedWith: null
    };
    var settings;

    var gameProgress = {
        scores: {
            player1: 0,
            player2: 0
        },
        gameState: window.game.gameStateType.NotStarted
    };
    
    var scores = {
        player1: 0,
        player2: 0
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
        }
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

        if (ballCollisionState.hasCollided) {

            debugData.batIdCollidedWith = ballCollisionState.batIdCollidedWith;
            // Give the puck a little extra kick
            simulator.applyImpulseVector(gameConst.PuckId, { x: ballCollisionState.vX, y: ballCollisionState.vY }, settings.powerToApplyOnPuckCollision);

            var puck = simulator.getBody(gameConst.PuckId);
            puck.SetAngle(0);
            puck.SetAngularVelocity(0);

            //simulator.cancelAllMovement(bat);
            ballCollisionState.hasCollided = false;
            ballCollisionState.power = 0;
            ballCollisionState.batIdCollidedWith = null;
            ballCollisionState.vX = 0;
            ballCollisionState.vY = 0;
        }
        if (gameProgress.gameState === window.game.gameStateType.Paused
                || gameProgress.gameState === window.game.gameStateType.Ended) {
            simulator.cancelAllMovement(simulator.getBody(gameConst.PuckId));
            simulator.cancelAllMovement(simulator.getBody(gameConst.Player1Id));
            simulator.cancelAllMovement(simulator.getBody(gameConst.Player2Id));
            simulator.clearForces();
        }
        update(animStart);
        draw();
        requestAnimFrame(loop);
    }

    function ensureEntityIsWithinBoundsOfPlayingField(entity) {
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

    function checkPositionLimits() {

        var p1 = simulator.getBody(gameConst.Player1Id);
        var p2 = simulator.getBody(gameConst.Player2Id);
        ensureEntityIsWithinBoundsOfPlayingField(p1);
        ensureEntityIsWithinBoundsOfPlayingField(p2);

        // If user has elected to allow players past halfway line then return
        // so we dont test for it
        if (settings.allowPlayersToCrossHalfwayLine === true) {
            return;
        }

        var p1Pos = p1.GetPosition();
        var p2Pos = p2.GetPosition();

        // check that each player cannot go past their halfway line limit
        var halfwayLimit = screenWidth / 2 / gameConst.Scale;


        if (p1Pos.x >= halfwayLimit) {
            p1.SetPosition({ x: halfwayLimit, y: p1Pos.y });
        }
        if (p2Pos.x <= halfwayLimit) {
            p2.SetPosition({ x: halfwayLimit, y: p2Pos.y });
        }
    }

    function update(animStart) {
        if (gameProgress.gameState === window.game.gameStateType.Quit) {
            return;
        }
        checkPositionLimits();
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
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        // Draw the basic boardelements like halfway line and other things that dont interact
        // with the world
        window.game.board.drawBoardMarkings();

        // Run through our drawing events
        window.game.drawHelper.drawCollisionDebugData(ctx, debugData, playerMovementState);
        window.game.drawHelper.drawScores(ctx, gameProgress, canvasWidth);
        window.game.drawHelper.drawInGameMessage(ctx, inGameMessage, canvasWidth, canvasHeight);
        window.game.drawHelper.drawCountDown(ctx, countdownState, screenWidth, screenHeight);

        //Now update the actual entities in the world
        for (var id in world) {
            var entity = world[id];
            entity.draw(ctx);
        }
    }

    function countdownTickEvent() {
        countdownState.count -= 1;
        if (countdownState.count <= 0) {
            //window.clearInterval(countdownState.timer);
            countdownState.started = false;
            countdownState.count = 0;
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
        var power = Math.random() * 150 + 10;
        var angle = Math.random() * 360;
        setTimeout(function () {
            //simulator.applyImpulse("ball", parseInt(angleElem.value), parseInt(powerElem.value));
            if (simulator !== null) {
                simulator.applyImpulse(gameConst.PuckId, parseInt(angle), parseInt(power));
                gameProgress.gameState = window.game.gameStateType.InProgress;
            }
        }, 500);

    }

    function startCountDown() {
        countdownState.count = 3;
        countdownState.started = true;
        window.setTimeout(countdownTickEvent, 1000);
    }

    function scoreGoal(idA, idB) {
        if (gameProgress.gameState === window.game.gameStateType.Quit) {
            return;
        }

        if (debugData.enabled !== true) {
            gameProgress.gameState = window.game.gameStateType.Paused;
        }

        // SO who scored?
        var message;
        var goalHitId = idA.indexOf("goal") >= 0 ? idA : idB;
        if (goalHitId === gameConst.player1Goal) {
            message = "Player 2 ";
            gameProgress.scores.player2 += 1;
        } else {
            message = "Player 1 ";
            gameProgress.scores.player1 += 1;
        }

        if (gameProgress.scores.player1 >= settings.numberOfGoalsThatSignalsEndOfMatch || gameProgress.scores.player2 >= settings.numberOfGoalsThatSignalsEndOfMatch) {
            // end of the match! Someone has won
            var msg = "Player ";
            if (gameProgress.scores.player1 >= settings.numberOfGoalsThatSignalsEndOfMatch) {
                msg += "1";
            } else {
                msg += "2";
            }
            msg += " wins! Final Score: Player 1: " + gameProgress.scores.player1 + ", Player 2: " + gameProgress.scores.player2;
            inGameMessage.displayText = msg;
            gameProgress.gameState = window.game.gameStateType.Ended;
        } else {
            // continue playing....
            inGameMessage.displayText = "GOAL! " + message + "scores";

            // Do something spectacular to show a goal has been scored
            if (debugData.enabled !== true) {
                setTimeout(function () {
                    inGameMessage.clearMessage();
                    gameProgress.gameState = window.game.gameStateType.InProgress;
                    initStartGameSequence();
                }, 3500);
            } else {
                // If debug is enabled, just clear the message and keep going
                setTimeout(function () {
                    gameProgress.gameState = window.game.gameStateType.InProgress;
                    inGameMessage.clearMessage();
                }, 3500);
            }
        }
    }

    function handlePointerInitiatedOrReleased(e, isReleased) {
        if (gameProgress.gameState === window.game.gameStateType.Quit) {
            return;
        }

        mouseX = (e.clientX - canvas.getBoundingClientRect().left) / window.game.worldConstants.Scale;
        mouseY = (e.clientY - canvas.getBoundingClientRect().top) / window.game.worldConstants.Scale;

        var selectedBody = simulator.getBodyAt(mouseX, mouseY);
        if (typeof selectedBody !== 'undefined' && selectedBody !== null) {

            var selectedId = selectedBody.GetUserData();

            // Set player movement state if required
            if (doesIdRepresentPlayerBat(selectedId)) {
                var playerState = playerMovementState.player1;
                if (selectedId === gameConst.Player2Id) {
                    playerState = playerMovementState.player2;
                }

                var newstate = isReleased === true ? false : true;
                if (playerState.isSelected !== newstate) {
                    playerState.whenSelected = null;
                    playerState.xPosWhileHeld = [];
                    playerState.yPosWhileHeld = [];

                    //?? Should we cancel all body movement here if both players are
                    // selected and the player has just been selected to prevent weirdness?
                    if (playerMovementState.player1.isSelected && playerMovementState.player2.isSelected) {
                        var p = simulator.getBody(selectedId);
                        simulator.cancelAllMovement(p);
                    }
                }

                playerState.isSelected = newstate;

                // If the player is selected, then begin recording its x and y positions
                // while it is being held down
                if (playerState.isSelected) {
                    var maxPositionItems = 5;

                    if (playerState.xPosWhileHeld.length === 0) {
                        playerState.whenSelected = new Date().getTime();
                    }
                    var newXPosInArray = playerState.xPosWhileHeld.length;
                    if (newXPosInArray > (maxPositionItems - 1)) {
                        playerState.xPosWhileHeld.shift();
                        newXPosInArray = (maxPositionItems - 1);
                    }
                    var newYPosInArray = playerState.yPosWhileHeld.length;
                    if (newYPosInArray > (maxPositionItems - 1)) {
                        playerState.yPosWhileHeld.shift();
                        newYPosInArray = (maxPositionItems - 1);
                    }
                    playerState.xPosWhileHeld.push(mouseX);
                    playerState.yPosWhileHeld.push(mouseY);
                } else {
                    playerState.whenSelected = null;
                    playerState.xPosWhileHeld = [];
                    playerState.yPosWhileHeld = [];
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

        var boundingClientRect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - boundingClientRect.left) / window.game.worldConstants.Scale;
        mouseY = (e.clientY - boundingClientRect.top) / window.game.worldConstants.Scale;

        var selectedBody = simulator.getBodyAt(mouseX, mouseY);
        if (typeof selectedBody !== 'undefined' && selectedBody !== null) {

            var selectedId = selectedBody.GetUserData();

            if (selectedId !== gameConst.PuckId) {

                var entity = world[selectedId];
                var radius = 0;
                if (entity.radius) {
                    radius = entity.radius;
                }

                if (mouseX <= radius || mouseY <= radius
                        || mouseY >= ((screenHeight / gameConst.Scale) - radius)
                        || mouseX >= ((screenWidth / gameConst.Scale) - radius)) {
                    return;
                }

                debugData.message = "setting body position: x:" + mouseX + ", y:" + mouseY;

                // If the user has their touch point held down on the player bat, then we
                // need to cancel the velocity of the bat otherwise inertia comes into play
                // and the simulator tries to move the bat via inertia BUT it gets repositioned
                //as the users touch point may not change or it changes different to inertia so
                // you get a very jerky effect.In addition, we issue this cancel via a setTimeout
                // rather than directly so any collisions against the puck can still work and be 
                // scheduled approriately. Doing it directly in line has the effect of NOT
                // hitting the puck and causes weird bounce behaviour.
                if ((selectedId === window.game.worldConstants.Player1Id && playerMovementState.player1.isSelected)
                        || (selectedId === window.game.worldConstants.Player2Id && playerMovementState.player2.isSelected)) {
                    setTimeout(function () {
                        selectedBody.SetLinearVelocity({ x: 0, y: 0 });
                        selectedBody.SetAngularVelocity(0);
                    }, 1000 / 60);
                }
                selectedBody.SetPosition({ x: mouseX, y: mouseY });





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

        mouseX = (e.clientX - canvas.getBoundingClientRect().left) / window.game.worldConstants.Scale;
        mouseY = (e.clientY - canvas.getBoundingClientRect().top) / window.game.worldConstants.Scale;

        var selectedBody = simulator.getBodyAt(mouseX, mouseY);
        if (typeof selectedBody !== 'undefined' && selectedBody !== null) {

            var selectedId = selectedBody.GetUserData();

            // We need to guage how fast the user is moving the bat so we can tell
            // Box2D how fast the object is going so it can calculate collission properly
            // otherwise Box2D does not know about the bat's velocity since the MSGesture and
            // MSPointerEvents happen outside its scope
            if (doesIdRepresentPlayerBat(selectedId)) {
                // Dont cancel inertia or movement on release for now
                //if (gestureType === window.game.gestureType.change) {
                //    if (selectedId === window.game.worldConstants.Player1Id && !playerMovementState.isPlayer1Selected
                //            || selectedId === window.game.worldConstants.Player2Id && !playerMovementState.isPlayer2Selected) {
                //        simulator.cancelAllMovement(selectedBody);
                //    }
                //} else {
                selectedBody.SetLinearVelocity({ x: e.velocityX * gameConst.Scale, y: e.velocityY * gameConst.Scale });
                //}
            }

        }
    }

    function handlePostSolveCollision(idA, idB, impulse) {
        if (gameProgress.gameState === window.game.gameStateType.Quit) {
            return;
        }
        var ballBody = simulator.getBody(gameConst.PuckId);

        if ((doesIdRepresentGoal(idA) || doesIdRepresentGoal(idB)) &&
               (idA.indexOf(gameConst.PuckId) >= 0 || idB.indexOf(gameConst.PuckId) >= 0)) {
            scoreGoal(idA, idB);
        }

        if ((idA === gameConst.PuckId || idB === gameConst.PuckId) && (doesIdRepresentPlayerBat(idA) || doesIdRepresentPlayerBat(idB))) {

            var bat, batId;
            if (doesIdRepresentPlayerBat(idA)) {
                batId = idA;
            } else {
                batId = idB;
            }
            bat = simulator.getBody(batId);
            ballCollisionState.batIdCollidedWith = batId;

            var playerState = playerMovementState.player1;
            if (batId === window.game.worldConstants.Player2Id) {
                playerState = playerMovementState.player2;
            }

            var aggregateYVelocity = 0;
            var aggregateXVelocity = 0;

            // Only do this special condition if both players are selected as we dont get
            // proper velocity when two pointer events are fired together
            if (playerMovementState.player1.isSelected && playerMovementState.player2.isSelected) {

                var xLen = playerState.xPosWhileHeld.length;
                var yLen = playerState.yPosWhileHeld.length;
                var xVel = 0, yVel = 0;
                for (var xcnt = 0; xcnt < xLen; xcnt++) {
                    if (xcnt === 0) {
                        xVel = playerState.xPosWhileHeld[xcnt];
                    } else {
                        var delta = playerState.xPosWhileHeld[xcnt] - playerState.xPosWhileHeld[xcnt - 1];
                        xVel += delta;
                    }
                }
                for (var ycnt = 0; ycnt < yLen; ycnt++) {
                    if (ycnt === 0) {
                        yVel = playerState.yPosWhileHeld[ycnt];
                    } else {
                        var delta = playerState.yPosWhileHeld[ycnt] - playerState.xPosWhileHeld[ycnt - 1];
                        yVel += delta;
                    }
                }
                aggregateXVelocity = yVel;
                aggregateYVelocity = xVel;
            } else {

                //document.removeEventListener("mousemove", handleMouseMove, true);

                var centreBallPosition = ballBody.GetWorldCenter();
                var ballVelocity = ballBody.GetLinearVelocityFromWorldPoint(centreBallPosition);
                var centreBatPosition = bat.GetWorldCenter();
                var batVelocity = bat.GetLinearVelocityFromWorldPoint(centreBatPosition);

                // add both X velocity for ball and bat together. They should cancel each other
                // out if going opposite dir. Same for Y dir
                aggregateYVelocity = batVelocity.y + ballVelocity.y;// / 2;
                aggregateXVelocity = batVelocity.x + ballVelocity.x;// / 2;

                debugData.batXVelocity = batVelocity.x;
                debugData.batYVelocity = batVelocity.y;
            }

            // put a cap on the intertia
            //var batInertia = bat.GetInertia();
            //batInertia = batInertia > 5000 ? batInertia = 5000 : batInertia;

            ballCollisionState.hasCollided = true;
            ballCollisionState.vX = aggregateXVelocity;
            ballCollisionState.vY = aggregateYVelocity;

            //Since we are not using inertia and power for calculations now, commenting out to improve perf
            // set debug data
            //ballCollisionState.power = batInertia;
            //debugData.lastCalculatedPower = batInertia;
            //if (batInertia !== 0) {
            //    debugData.lastPowerApplied = batInertia;
            //}
            if (impulse !== 0) {
                debugData.lastImpulse = impulse;
            }

        }
    }

    function initStartGameSequence() {
        if (gameProgress.gameState === window.game.gameStateType.Quit) {
            return;
        }

        inGameMessage.clearMessage();
        gameProgress.gameState = window.game.gameStateType.NotStarted;

        if (simulator == null) {
            return;
        }
        var initialState = window.game.board.setupAllWorldBodySettings();
        var ball = simulator.getBody(gameConst.PuckId);
        var bat1 = simulator.getBody(gameConst.Player1Id);
        var bat2 = simulator.getBody(gameConst.Player2Id);

        var ballSettings = window.game.board.createPuckInitialSettings();
        var b1Settings = window.game.board.createBat1InitialSettings();
        var b2Settings = window.game.board.createBat2InitialSettings();

        ball.SetPosition({ x: ballSettings.x, y: ballSettings.y });
        bat1.SetPosition({ x: b1Settings.x, y: b1Settings.y });
        bat2.SetPosition({ x: b2Settings.x, y: b2Settings.y });

        settings = window.game.settings.getCurrent();

        startCountDown();
    }


    /**************** USING MS GESTURE HANDLING *******************/

    function handleMSPointerDownEvent(e) {
        debugData.lastEvent = 'onMSPointerDown';
        if (e.target === this) {
            //  Attach first contact and track device.
            if (this.gesture.pointerType === null) {
                this.gesture.addPointer(e.pointerId);
                this.gesture.pointerType = e.pointerType;
            }
                // Attach subsequent contacts from same device.
            else if (e.pointerType === this.gesture.pointerType) {
                this.gesture.addPointer(e.pointerId);
            }

                //GLAV NOTE: The section below is included with the sample but seems to lose
                // the gesture events sometimes when u swipe and then swipe mid way through
                // translation

                // New gesture recognizer for new pointer type.
            else {
                var msGesture = new MSGesture();
                msGesture.target = e.target;
                e.target.gesture = msGesture;
                e.target.gesture.pointerType = e.pointerType;
                e.target.gesture.addPointer(e.pointerId);
            }
        }

        // We dont need this routine for now. Retaining just in case we need to know when a player is selected
        // held
        handlePointerInitiatedOrReleased(e, false);

        handleMouseMove(e);
    }
    function handleMSPointerUpEvent(e) {
        debugData.lastEvent = 'onMSPointerUp';
        // We dont need this routine for now. Retaining just in case we need to know when a player is selected
        // held
        handlePointerInitiatedOrReleased(e, true);
    }
    function handleMSPointerMoveEvent(e) {
        debugData.lastEvent = 'onMSPointerMove';

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
        debugData.lastEvent = 'onMSPointerCancel';
    }
    function handleMSLostPointerCaptureEvent(e) {
        debugData.lastEvent = 'onMSLostPointerCapture';
    }

    function handleMSGestureChangeEvent(e) {
        debugData.lastEvent = 'onMSGestureChange';
        handleMouseMove(e);
        handleGestureChangeForPlayerVelocity(e, window.game.gestureType.change);
    }
    function handleMSGestureTapEvent(e) {
        debugData.lastEvent = 'onMSGestureTap';
    }
    function handleMSGestureEndEvent(e) {
        debugData.lastEvent = 'onMSGestureEnd';
        handleGestureChangeForPlayerVelocity(e, window.game.gestureType.end);
    }
    function handleMSGestureHoldEvent(e) {
        debugData.lastEvent = 'onMSGestureHold';
        handleGestureChangeForPlayerVelocity(e, window.game.gestureType.hold);
    }
    function handleMSGestureStartEvent(e) {
        debugData.lastEvent = 'onMSGestureStart';
        handleGestureChangeForPlayerVelocity(e, window.game.gestureType.start);
    }
    function handleMSInertiaStartEvent(e) {
        debugData.lastEvent = 'onMSInertiaStart';
        // We dont need this routine for now. Retaining just in case we need to know when a player is selected
        // held
        handlePointerInitiatedOrReleased(e, true);
        //handleMouseMove(e);
    }
    /***** END MS GESTURE HANDLING ******/

    function initGameBodies() {
        gameProgress.gameState === window.game.gameStateType.NotStarted;
        canvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        ctx = canvas.getContext("2d");
        canvasWidth = ctx.canvas.width;
        canvasHeight = ctx.canvas.height;

        var initialState = window.game.board.setupAllWorldBodySettings();
        gameProgress.scores.player1 = 0;
        gameProgress.scores.player2 = 0;


        for (var i = 0; i < initialState.length; i++) {
            var entity = window.game.entities.buildEntity(initialState[i]);
            world[initialState[i].id] = entity;
        }

        simulator = new window.game.simulator.box2dWrapper(60, false, canvasWidth, canvasHeight, window.game.worldConstants.Scale);
        simulator.setBodies(world, true);

        window.game.entities.setDebugMode(debugData.enabled);


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
                if (ballCollisionState.hasCollided === true) {
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

        initStartGameSequence();
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
    }

    // returns the interface to the consumers
    return {
        initGameBodies: initGameBodies,
        startAnimationLoop: startAnimationLoop,
        initStartGameSequence: initStartGameSequence,
        stopGame: stopGame
    };
}();

