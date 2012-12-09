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
    var haltGame = false;
    var quitGame = false;
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
        message: ''
    };
    var settings;

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
        clearMessage: function () {
            this.displayText = null;
            this.xPos = 0;
            this.yPos = 0;
        }
    };
    var playerMovementState = {
        isPlayer1Selected: false,
        isPlayer2Selected: false
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
        if (quitGame === true) {
            return;
        }

        //var ball = simulator.getBody('ball'); 
        //ball.SetAngle(0);
        //ball.SetAngularVelocity(0);
        //ball.clearForces();

        if (ballCollisionState.hasCollided) {
            if (ballCollisionState.batIdCollidedWith !== null) {
                var body = simulator.getBody(ballCollisionState.batIdCollidedWith);
                simulator.cancelAllMovement(body);
            }

            // Give the puck a little extra kick
            simulator.applyImpulseVector(gameConst.PuckId, { x: ballCollisionState.vX, y: ballCollisionState.vY }, settings.powerToApplyOnPuckCollision);

            //simulator.cancelAllMovement(bat);
            ballCollisionState.hasCollided = false;
            ballCollisionState.power = 0;
            ballCollisionState.batIdCollidedWith = null;
            ballCollisionState.vX = 0;
            ballCollisionState.vY = 0;
        }
        if (haltGame) {
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
        if (quitGame === true) {
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

    function drawCollisionDebugData() {
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
        // not really using these values now so dont bother showing them
        //ctx.fillText("PowerApplied: " + debugData.lastPowerApplied, startXPos, (startYPos += 30));
        //ctx.fillText("ActualPowerCalced: " + debugData.lastCalculatedPower, startXPos, (startYPos += 30));
        //ctx.fillText("Impulse: " + debugData.lastImpulse, startXPos, (startYPos += 30));
        ctx.fillText("Player1Selected: " + playerMovementState.isPlayer1Selected, startXPos, (startYPos += 30));
        ctx.fillText("Player2Selected: " + playerMovementState.isPlayer2Selected, startXPos, (startYPos += 30));
        ctx.fillText("LastEvent: " + debugData.lastEvent, startXPos, (startYPos += 30));
        ctx.fillText("HasBallCollided: " + ballCollisionState.hasCollided, startXPos, (startYPos += 30));
        ctx.fillText("BallCollidedWith: " + ballCollisionState.batIdCollidedWith, startXPos, (startYPos += 30));
        ctx.fillText("Message: " + debugData.message, startXPos, (startYPos += 30));
        ctx.stroke();
        ctx.restore();
    }

    function drawScores() {
        ctx.save();
        ctx.font = "20px Arial";
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = '#000000';
        ctx.fillText("P1: " + scores.player1, 30, 55);
        ctx.fillText("P2: " + scores.player2, canvasWidth - 80, 55);

        ctx.stroke();
        ctx.restore();
    }

    function drawInGameMessage() {
        if (inGameMessage.displayText !== null) {
            ctx.save();
            ctx.font = "30px Arial";
            ctx.strokeStyle = "#000000";
            ctx.fillStyle = '#000000';

            ctx.shadowOffsetX = 7;
            ctx.shadowOffsetY = 7;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(10, 10, 10, 0.5)';

            if (inGameMessage.xPos === 0) {
                inGameMessage.xPos = canvasWidth * 0.25;
                inGameMessage.yPos = canvasHeight / 4;
            } else {
                inGameMessage.xPos += 1;
            }
            ctx.fillText(inGameMessage.displayText, inGameMessage.xPos, inGameMessage.yPos);
            ctx.stroke();
            ctx.restore();

        }
    }

    function drawCountDown() {
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


    function draw() {
        if (quitGame === true) {
            return;
        }
        // Clear the canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        // Draw the basic boardelements like halfway line and other things that dont interact
        // with the world
        window.game.board.drawBoardMarkings();

        // Run through our drawing events

        drawCollisionDebugData();
        drawScores();
        drawInGameMessage();
        drawCountDown();

        //Now update the actual entities in the world
        for (var id in world) {
            var entity = world[id];
            entity.draw(ctx);
        }
    }

    function startCountDown(completedCallback) {
        countdownState.count = 3;
        countdownState.started = true;
        countdownState.timer = window.setInterval(function () {
            countdownState.count -= 1;
            if (countdownState.count <= 0) {
                window.clearInterval(countdownState.timer);
                countdownState.started = false;
                countdownState.count = 0;
                if (typeof completedCallback !== 'undefined') {
                    completedCallback();
                }
            }
        }, 1000);
    }

    function scoreGoal(idA, idB) {
        if (quitGame === true) {
            return;
        }

        if (debugData.enabled !== true) {
            haltGame = true;
        }


        // SO who scored?
        var message;
        var goalHitId = idA.indexOf("goal") >= 0 ? idA : idB;
        if (goalHitId === gameConst.player1Goal) {
            message = "Player 2 ";
            scores.player2 += 1;
        } else {
            message = "Player 1 ";
            scores.player1 += 1;
        }


        inGameMessage.displayText = "GOAL! " + message + "scores";

        // Do something spectacular to show a goal has been scored
        if (debugData.enabled !== true) {
            setTimeout(function () {
                inGameMessage.clearMessage();
                startGameSequence();
            }, 3500);
        } else {
            // If debug is enabled, just clear the message and keep going
            setTimeout(function () {
                inGameMessage.clearMessage();
            }, 3500);
        }
    }

    function handlePointerInitiatedOrReleased(e, isReleased) {
        if (quitGame === true) {
            return;
        }

        mouseX = (e.clientX - canvas.getBoundingClientRect().left) / window.game.worldConstants.Scale;
        mouseY = (e.clientY - canvas.getBoundingClientRect().top) / window.game.worldConstants.Scale;

        var selectedBody = simulator.getBodyAt(mouseX, mouseY);
        if (typeof selectedBody !== 'undefined' && selectedBody !== null) {

            var selectedId = selectedBody.GetUserData();

            // Set player movement state if required
            if (doesIdRepresentPlayerBat(selectedId)) {

                var newstate = isReleased === true ? false : true;

                if (selectedId === gameConst.Player1Id) {
                    playerMovementState.isPlayer1Selected = newstate;
                } else {
                    playerMovementState.isPlayer2Selected = newstate;
                }
            }
        }
    }

    function handleMouseMove(e) {
        if (haltGame === true || quitGame === true) {
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
        if (quitGame === true) {
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
        if (quitGame === true) {
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

            //document.removeEventListener("mousemove", handleMouseMove, true);

            var centreBallPosition = ballBody.GetWorldCenter();
            var ballVelocity = ballBody.GetLinearVelocityFromWorldPoint(centreBallPosition);
            var centreBatPosition = bat.GetWorldCenter();
            var batVelocity = bat.GetLinearVelocityFromWorldPoint(centreBatPosition);

            // add both X velocity for ball and bat together. They should cancel each other
            // out if going opposite dir. Same for Y dir
            var aggregateYVelocity = batVelocity.y + ballVelocity.y;// / 2;
            var aggregateXVelocity = batVelocity.x + ballVelocity.x;// / 2;

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
            debugData.batXVelocity = batVelocity.x;
            debugData.batYVelocity = batVelocity.y;
            if (impulse !== 0) {
                debugData.lastImpulse = impulse;
            }

        }
    }

    function startGameSequence() {
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


        update();
        draw();

        startCountDown(function () {
            // kick off the puck in a random direction and power
            var power = Math.random() * 100 + 10;
            var angle = Math.random() * 360;
            setTimeout(function () {
                //simulator.applyImpulse("ball", parseInt(angleElem.value), parseInt(powerElem.value));
                simulator.applyImpulse(gameConst.PuckId, parseInt(angle), parseInt(power));
                haltGame = false;
            }, 500);
        });
        if (!haltGame) {
            startAnimationLoop();
        }
    }

    /**************** USING MS GESTURE HANDLING *******************/

    function handleMSPointerDownEvent(e) {
        debugData.lastEvent = 'onMSPointerDown';
        //console.log('pointer down');
        if (e.target === this) {
            //  Attach first contact and track device.
            if (this.gesture.pointerType === null) {
                this.gesture.addPointer(e.pointerId);
                this.gesture.pointerType = e.pointerType;
                //console.log("pointer type: " + e.pointerType);
            }
                // Attach subsequent contacts from same device.
            else if (e.pointerType === this.gesture.pointerType) {
                this.gesture.addPointer(e.pointerId);
                //console.log("pointer type attach : " + e.pointerType);
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
                //console.log("new gesture pointer type: " + e.pointerType);
            }
        }

        // We dont need this routine for now. Retaining just in case we need to know when a player is selected
        // held
        //handlePointerInitiatedOrReleased(e, false);

        handleMouseMove(e);
    }
    function handleMSPointerUpEvent(e) {
        debugData.lastEvent = 'onMSPointerUp';
        // We dont need this routine for now. Retaining just in case we need to know when a player is selected
        // held
        //handlePointerInitiatedOrReleased(e, true);
    }
    function handleMSPointerMoveEvent(e) {
        debugData.lastEvent = 'onMSPointerMove';
        //handleMouseMove(e);
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
        //handlePointerInitiatedOrReleased(e, true);
    }
    /***** END MS GESTURE HANDLING ******/

    function initGameBodies() {
        haltGame = false;
        quitGame = false;
        canvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        ctx = canvas.getContext("2d");
        canvasWidth = ctx.canvas.width;
        canvasHeight = ctx.canvas.height;

        var initialState = window.game.board.setupAllWorldBodySettings();

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

                if (haltGame) {
                    return;
                }
                handlePostSolveCollision(idA, idB, impulse);
            },
            PreSolve: function (idA, idB, oldManifold) {
                //console.log("pre solve");
            }
        });

        startGameSequence();
    }

    function startAnimationLoop() {
        requestAnimFrame(loop);
    }

    function stopGame() {
        quitGame = true;
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
        stopGame: stopGame
    };
}();

