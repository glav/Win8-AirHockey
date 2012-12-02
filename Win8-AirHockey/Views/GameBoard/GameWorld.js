window.game.world = function () {
    "use strict";

    //*** From the Number 11 demo ****
    var world = {};
    var bodiesState = null;
    var simulator = null;
    var canvasWidth;
    var canvasHeight;
    var canvas; // = document.getElementById("c");
    var ctx; // = canvas.getContext("2d");
    var running = true;
    var initTimeout = null;
    var isMouseDown = false;
    var screenHeight = window.innerHeight;
    var screenWidth = window.innerWidth;
    var mouseX, mouseY;
    var haltGame = false;
    var ballCollisionState = {
        hasCollided: false,
        power: 0,
        vX: 0,
        vY: 0,
        batIdCollidedWith: null
    };
    var debugData= {
            enabled: true,
            batXVelocity: 0,
            batYVelocity: 0,
            lastCalculatedPower: 0,
            lastPowerApplied: 0,
            lastImpulse: 0
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
        clearMessage: function () {
            this.displayText = null;
            this.xPos = 0;
            this.yPos = 0;
        }
    };

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

        //var ball = simulator.getBody('ball'); 
        //ball.SetAngle(0);
        //ball.SetAngularVelocity(0);
        //ball.clearForces();

        if (ballCollisionState.hasCollided) {
            simulator.applyImpulseVector('ball', { x: ballCollisionState.vX, y: ballCollisionState.vY }, ballCollisionState.power);
            if (ballCollisionState.batIdCollidedWith !== null) {
                var body = simulator.getBody(ballCollisionState.batIdCollidedWith);
                simulator.cancelAllMovement(body);
            }
            //simulator.cancelAllMovement(bat);
            ballCollisionState.hasCollided = false;
            ballCollisionState.power = 0;
            ballCollisionState.batIdCollidedWith = null;
            ballCollisionState.vX = 0;
            ballCollisionState.vY = 0;
        }
        if (haltGame) {
            simulator.cancelAllMovement(simulator.getBody('ball'));
            simulator.cancelAllMovement(simulator.getBody('bat1'));
            simulator.cancelAllMovement(simulator.getBody('bat2'));
            simulator.clearForces();
        }
        update(animStart);
        draw();
        requestAnimFrame(loop);
    }

    function update(animStart) {
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
        ctx.fillText("PowerApplied: " + debugData.lastPowerApplied, startXPos, (startYPos += 30));
        ctx.fillText("ActualPowerCalced: " + debugData.lastCalculatedPower, startXPos, (startYPos += 30));
        ctx.fillText("Impulse: " + debugData.lastImpulse, startXPos, (startYPos += 30));
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

    function draw() {
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

    function drawCountDown() {
        if (countdownState.started) {
            var centreX = screenWidth / 2 - 15;
            var centreY = screenHeight / 2 - 15;
            ctx.save();
            ctx.font = "80px Arial";
            ctx.strokeStyle = "red";
            ctx.fillStyle = "red";
            ctx.fillText(countdownState.count, centreX - (centreX / 4), centreY - (centreY / 4));
            ctx.fillText(countdownState.count, centreX + (centreX / 4), centreY - (centreY / 4));
            ctx.restore();
        }

    }

    function scoreGoal(idA, idB) {
        if (debugData.enabled !== true) {
            haltGame = true;
        }

        
        // SO who scored?
        var message;
        var goalHitId = idA.indexOf("goal") >= 0 ? idA : idB;
        if (goalHitId === 'goal1') {
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

    function handleMouseMove(e) {
        if (haltGame) {
            return;
        }
        mouseX = (e.clientX - canvas.getBoundingClientRect().left) / window.game.worldConstants.Scale;
        mouseY = (e.clientY - canvas.getBoundingClientRect().top) / window.game.worldConstants.Scale;

        var selectedBody = simulator.getBodyAt(mouseX, mouseY);
        if (typeof selectedBody !== 'undefined' && selectedBody !== null) {

            var selectedId = selectedBody.GetUserData();
            if (selectedId !== 'ball') {

                var entity = world[selectedId];
                var radius = 0;
                if (entity.radius) {
                    radius = entity.radius;
                }

                if (mouseX <= radius || mouseY <= radius
                        || mouseY >= ((screenHeight / window.game.worldConstants.Scale) - radius)
                        || mouseX >= ((screenWidth / window.game.worldConstants.Scale) - radius)) {
                    return;
                }

                selectedBody.SetPosition({ x: mouseX, y: mouseY });
                var entityState = simulator.getState()[selectedId];
                entity.update(entityState);
            }
        }
    };

    function handlePostSolveCollision(idA, idB, impulse) {
        var ballBody = simulator.getBody('ball');

        if ((idA.indexOf('goal') >= 0 || idB.indexOf('goal') >= 0) &&
               (idA.indexOf('ball') >= 0 || idB.indexOf('ball') >= 0)) {
            scoreGoal(idA, idB);
        }

        if ((idA === "ball" || idB === "ball") && (idA.indexOf('bat') >= 0 || idB.indexOf('bat') >= 0)) {

            var bat, batId;
            if (idA.indexOf('bat') >= 0) {
                batId = idA;
            } else {
                batId = idB;
            }
            bat = simulator.getBody(batId);
            ballCollisionState.batIdCollidedWith = batId;

            //document.removeEventListener("mousemove", handleMouseMove, true);

            var ballBody = simulator.getBody('ball');
            var centreBallPosition = ballBody.GetWorldCenter();
            var centreBatPosition = bat.GetWorldCenter();
            var batVelocity = bat.GetLinearVelocityFromWorldPoint(centreBatPosition);
            var ballVelocity = ballBody.GetLinearVelocityFromWorldPoint(centreBallPosition);

            // add both X velocity for ball and bat together. They should cancel each other
            // out if going opposite dir. Same for Y dir
            var aggregateYVelocity = batVelocity.y + ballVelocity.y/2;
            var aggregateXVelocity = batVelocity.x + ballVelocity.x/2;

            var batInertia = bat.GetInertia();
            debugData.lastCalculatedPower = batInertia;
            // put a cap on the intertia
            batInertia = batInertia > 5000 ? batInertia = 5000 : batInertia;

            ballCollisionState.hasCollided = true;
            ballCollisionState.power = batInertia;
            ballCollisionState.vX = aggregateXVelocity;
            ballCollisionState.vY = aggregateYVelocity;

            // set debug data
            debugData.batXVelocity = batVelocity.x;
            debugData.batYVelocity = batVelocity.y;
            if (batInertia !== 0) {
                debugData.lastPowerApplied = batInertia;
            }
            if (impulse !== 0) {
                debugData.lastImpulse = impulse;
            }

        }
    }

    function startGameSequence() {
        var initialState = window.game.board.setupAllWorldBodySettings();
        var ball = simulator.getBody('ball');
        var bat1 = simulator.getBody('bat1');
        var bat2 = simulator.getBody('bat2');

        var ballSettings = window.game.board.createBallInitialSettings();
        var b1Settings = window.game.board.createBat1InitialSettings();
        var b2Settings = window.game.board.createBat2InitialSettings();

        ball.SetPosition({ x: ballSettings.x, y: ballSettings.y });
        bat1.SetPosition({ x: b1Settings.x, y: b1Settings.y });
        bat2.SetPosition({ x: b2Settings.x, y: b2Settings.y });

        update();
        draw();

        startCountDown(function () {
            // kick off the puck in a random direction and power
            var power = Math.random() * 100 + 10;
            var angle = Math.random() * 360;
            setTimeout(function () {
                //simulator.applyImpulse("ball", parseInt(angleElem.value), parseInt(powerElem.value));
                simulator.applyImpulse("ball", parseInt(angle), parseInt(power));
                haltGame = false;
            }, 500);
        });
        if (!haltGame) {
            startAnimationLoop();
        }
    }

    function initGameBodies() {
        canvas = document.getElementById(window.game.worldConstants.CanvasElementId);
        ctx = canvas.getContext("2d");
        canvasWidth = ctx.canvas.width;
        canvasHeight = ctx.canvas.height;

        var initialState = window.game.board.setupAllWorldBodySettings();

        for (var i = 0; i < initialState.length; i++) {
            var entity = window.game.entities.buildEntity(initialState[i]);
            world[initialState[i].id] = entity;
        }

        world['bat1'].innerText.text = "P1";
        world['bat1'].innerText.inset = 0.6;
        world['bat2'].innerText.text = "P2";
        world['bat2'].innerText.inset = 0.6;

        simulator = new window.game.simulator.box2dWrapper(60, false, canvasWidth, canvasHeight, window.game.worldConstants.Scale);
        simulator.setBodies(world, true);

        window.game.entities.setDebugMode(debugData.enabled);


        /*********** STANDARD MOUSEDOWN/UP EVENTS - ONLY GOOD FOR 1 ELEMENT AT A TIME 
        ************/

        //canvas.addEventListener("mousedown", function (e) {
        //    document.addEventListener("mousemove", handleMouseMove, true);
        //    setTimeout(function () {
        //        isMouseDown = true;
        //        handleMouseMove(e);
        //    }, 1000/60);

        //}, true);

        //canvas.addEventListener("mouseup", function (e) {
        //    if (!isMouseDown) return;
        //    document.removeEventListener("mousemove", handleMouseMove, true);
        //    handleMouseMove(e);
        //    isMouseDown = false;
        //    mouseX = undefined;
        //    mouseY = undefined;
        //}, true);

        /***************************************************************/

        /**************** USING MS GESTURE HANDLING *******************/

        gestureHandler.addMovementEventListeners({
            element: canvas,
            onMSPointerDown: function (e) {
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

                handleMouseMove(e);
            },
            onMSPointerUp: function (e) {
                //console.log('pointer up');
            },
            onMSPointerMove: function (e) {
                handleMouseMove(e);
            },
            onMSPointerCancel: function (e) {
                //console.log('pointer cancel');
            },
            onMSLostPointerCapture: function (e) {
                //console.log('pointer capture');
            },
            onMSGestureChange: function (e) {
                handleMouseMove(e);
                //console.log('pointer change');
            },
            onMSGestureTap: function (e) {
                //console.log('pointer tap');
            },
            onMSGestureEnd: function (e) {
                //console.log('pointer end');
            },
            onMSGestureHold: function (e) {
                //console.log('pointer hold');
            }
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

    // returns the interface to the consumers
    return { initGameBodies: initGameBodies, startAnimationLoop: startAnimationLoop };
}();


//***** end from number 11 demo ******

