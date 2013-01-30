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

    return {
        ballCollisionState: ballCollisionState,
        canvasUpdateArea: canvasUpdateArea,
        debugData: debugData
    };

}();