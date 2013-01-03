window.game.entities = function () {
    "use strict";

    var debugMode = false;

    function setDebugMode(debugFlag) {
        debugMode = (debugFlag === true);
    }

    function Entity(id, x, y, angle, center, color, isStatic, density, useShadow, angularDamping) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.angle = angle || 0;
        this.center = center;
        this.color = color || "red";
        this.angularDamping = typeof angularDamping !== 'undefined' ? angularDamping : 0;

        if (typeof isStatic !== 'undefined') {
            this.isStatic = (isStatic === true);
        }
        if (typeof density !== 'undefined') {
            this.density = density;
        }

        this.innerText = {
            text: null,
            font: null,
            color: null,
            inset: 0
        };

        this.enableShadow = (useShadow === true);
        this.yScale = this.y * window.game.worldConstants.Scale;

        // Indicates that this entity requires a redrawon each frame
        // refresh
        this.requiresRedrawing = true;
    }

    Entity.prototype.update = function (state) {
        this.x = state.x;
        this.y = state.y;
        this.center = state.c;
        this.angle = state.a;
    };

    Entity.prototype.draw = function (ctx) {
        if (debugMode === true) {
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale, 4, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(this.center.x * window.game.worldConstants.Scale, this.center.y * window.game.worldConstants.Scale, 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }

        Entity.prototype.drawInnerText.call(this,ctx);
    };

    Entity.prototype.drawInnerText = function (ctx) {
        if (typeof this.innerText !== 'undefined') {
            if (this.innerText.text !== null) {

                ctx.font = this.innerText.font !== null ? this.innerText.font : "24px Arial";
                ctx.strokeStyle = this.innerText.color !== null ? this.innerText.color : "white";
                ctx.fillStyle = ctx.strokeStyle;
                var xPos = this.center.x * window.game.worldConstants.Scale - (this.innerText.inset * window.game.worldConstants.Scale) + 5;
                var yPos = this.center.y * window.game.worldConstants.Scale - 5;
                ctx.fillText(this.innerText.text, xPos, yPos);
            }
            if (typeof this.innerText.score !== 'undefined') {
                ctx.font = this.innerText.font !== null ? this.innerText.font : "24px Arial";
                ctx.strokeStyle = this.innerText.color !== null ? this.innerText.color : "white";
                ctx.fillStyle = ctx.strokeStyle;
                var xPos = this.center.x * window.game.worldConstants.Scale - 5;
                var yPos = this.center.y * window.game.worldConstants.Scale + 15;
                ctx.fillText(this.innerText.score, xPos, yPos);

            }
        }

    };
    Entity.prototype.setScore = function (score) {
        this.innerText.score = score;
    };

    //*****************************************************
    // Puck
    //*****************************************************
    function PuckEntity(id, x, y, angle, center, puckcolor, radius, isStatic, density, useShadow) {
        var color = puckcolor || 'aqua';
        Entity.call(this, id, x, y, angle, center, color, isStatic, density, useShadow);
        this.image = new Image();
        this.imageLoaded = false;
        var self = this;
        this.image.onload = function () {
            self.imageLoaded = true;
        }
        this.image.src = '/images/puck.png';
        this.angle = angle;
        this.radius = radius;

        // These properties are calculated ones so we do it here and store as member
        // variables so we dont have to keep doing it later
        this.imageXCentre = (this.x - this.radius) * window.game.worldConstants.Scale;
        this.imageYCentre = (this.y - this.radius) * window.game.worldConstants.Scale;
        this.imageWidth = this.radius * 2 * window.game.worldConstants.Scale;
        this.imageHeight = this.radius * 2 * window.game.worldConstants.Scale;
    }
    PuckEntity.prototype = new Entity();
    PuckEntity.prototype.constructor = PuckEntity;
    PuckEntity.prototype.update = function (state) {
        this.x = state.x;
        this.y = state.y;
        this.center = state.c;
        this.angle = state.a;

        // These properties are calculated ones so we do it here and store as member
        // variables so we dont have to keep doing it later
        this.imageXCentre = (this.x - this.radius) * window.game.worldConstants.Scale;
        this.imageYCentre = (this.y - this.radius) * window.game.worldConstants.Scale;
    };
    PuckEntity.prototype.draw = function (ctx) {
        ctx.save();

        if (debugMode !== true) {
            if (this.imageLoaded === true) {
                ctx.drawImage(this.image, this.imageXCentre, this.imageYCentre, this.imageWidth, this.imageHeight);
            }
            if (this.enableShadow === true) {
                ctx.shadowOffsetX = 10;
                ctx.shadowOffsetY = 10;
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(190, 190, 190, 0.5)';
            }
        } else {

            ctx.translate(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale);
            ctx.rotate(this.angle);
            ctx.translate(-(this.x) * window.game.worldConstants.Scale, -(this.y) * window.game.worldConstants.Scale);

            ctx.fillStyle = this.color;
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale, this.radius * window.game.worldConstants.Scale, 0, Math.PI * 2, true);

            ctx.moveTo(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale);
            ctx.lineTo((this.x) * window.game.worldConstants.Scale, (this.y + this.radius) * window.game.worldConstants.Scale);

            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // draw inner circle
            ctx.strokeStyle = '#888888';
            ctx.beginPath();
            ctx.arc(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale, (this.radius - (this.radius / 6)) * window.game.worldConstants.Scale, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.stroke();
            Entity.prototype.draw.call(this, ctx);
        }

        ctx.restore();
    };
    //*****************************************************
    // END Puck
    //*****************************************************

    //*****************************************************
    // Player
    //*****************************************************
    function PlayerEntity(id, x, y, angle, center, playercolor, radius, isStatic, density, useShadow, playerName) {
        var color = playercolor || 'aqua';
        Entity.call(this, id, x, y, angle, center, color, isStatic, density, useShadow);
        this.image = new Image();
        this.imageLoaded = false;
        var self = this;
        this.image.onload = function () {
            self.imageLoaded = true;
        }
        this.image.src = '/images/player.png';
        this.angle = angle;
        this.radius = radius;
        this.innerText.text = playerName;
        this.innerText.inset = 0.6;
        this.innerText.score = 0;  //extra prop

        // These properties are calculated ones so we do it here and store as member
        // variables so we dont have to keep doing it later
        this.imageXCentre = (this.x - this.radius) * window.game.worldConstants.Scale;
        this.imageYCentre = (this.y - this.radius) * window.game.worldConstants.Scale;
        this.imageWidth = this.radius * 2 * window.game.worldConstants.Scale;
        this.imageHeight = this.radius * 2 * window.game.worldConstants.Scale;
    }
    PlayerEntity.prototype = new Entity();
    PlayerEntity.prototype.constructor = PuckEntity;
    PlayerEntity.prototype.update = function (state) {
        this.x = state.x;
        this.y = state.y;
        this.center = state.c;
        this.angle = state.a;

        this.imageXCentre = (this.x - this.radius) * window.game.worldConstants.Scale;
        this.imageYCentre = (this.y - this.radius) * window.game.worldConstants.Scale;

    };
    PlayerEntity.prototype.draw = function (ctx) {
        ctx.save();

        if (debugMode !== true) {
            if (this.imageLoaded === true) {
                ctx.drawImage(this.image, this.imageXCentre, this.imageYCentre, this.imageWidth, this.imageHeight);
            }
            if (this.enableShadow === true) {
                ctx.shadowOffsetX = 20;
                ctx.shadowOffsetY = 20;
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(190, 190, 190, 0.5)';
            }
        } else {
            ctx.translate(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale);
            ctx.rotate(this.angle);
            ctx.translate(-(this.x) * window.game.worldConstants.Scale, -(this.y) * window.game.worldConstants.Scale);

            ctx.fillStyle = this.color;
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale, this.radius * window.game.worldConstants.Scale, 0, Math.PI * 2, true);

            ctx.moveTo(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale);
            ctx.lineTo((this.x) * window.game.worldConstants.Scale, (this.y + this.radius) * window.game.worldConstants.Scale);

            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // draw inner circle
            ctx.strokeStyle = '#888888';
            ctx.beginPath();
            ctx.arc(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale, (this.radius - (this.radius / 6)) * window.game.worldConstants.Scale, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.stroke();
            Entity.prototype.draw.call(this, ctx);
        }

        ctx.restore();
        Entity.prototype.drawInnerText.call(this,ctx);
    };
    //*****************************************************
    // END Player
    //*****************************************************

    //*****************************************************
    // Generic Circle
    //*****************************************************
    function CircleEntity(id, x, y, angle, center, color, radius, isStatic, density, useShadow) {
        color = color || 'aqua';
        Entity.call(this, id, x, y, angle, center, color, isStatic, density, useShadow);
        this.radius = radius;
    }


    CircleEntity.prototype = new Entity();
    CircleEntity.prototype.constructor = CircleEntity;

    CircleEntity.prototype.update = function (state) {
        this.x = state.x;
        this.y = state.y;
        this.center = state.c;
        this.angle = state.a;
    };

    CircleEntity.prototype.draw = function (ctx) {
        ctx.save();
        if (this.enableShadow === true) {
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 10;
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(190, 190, 190, 0.5)';
        }

        ctx.translate(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale);
        ctx.rotate(this.angle);
        ctx.translate(-(this.x) * window.game.worldConstants.Scale, -(this.y) * window.game.worldConstants.Scale);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale, this.radius * window.game.worldConstants.Scale, 0, Math.PI * 2, true);

        if (debugMode) {
            ctx.moveTo(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale);
            ctx.lineTo((this.x) * window.game.worldConstants.Scale, (this.y + this.radius) * window.game.worldConstants.Scale);
        }

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        Entity.prototype.draw.call(this, ctx);
    };

    //***************************
    // *** Generic Rectange
    //***************************
    function RectangleEntity(id, x, y, angle, center, color, halfWidth, halfHeight, isStatic, density) {
        Entity.call(this, id, x, y, angle, center, color, isStatic, density);
        this.halfWidth = halfWidth;
        this.halfHeight = halfHeight;
        // These properties are calculated ones so we do it here and store as member
        // variables so we dont have to keep doing it later
        this.translateXScale = -(this.x) * window.game.worldConstants.Scale;
        this.translateYScale =  -(this.y) * window.game.worldConstants.Scale;
        this.fillRectXPos = (this.x - this.halfWidth) * window.game.worldConstants.Scale;
        this.fillRectYPos = (this.y - this.halfHeight) * window.game.worldConstants.Scale;
        this.fillXScale = (this.halfWidth * 2) * window.game.worldConstants.Scale;
        this.fillYScale = (this.halfHeight * 2) * window.game.worldConstants.Scale;
    }
    RectangleEntity.prototype = new Entity();
    RectangleEntity.prototype.constructor = RectangleEntity;

    RectangleEntity.prototype.draw = function (ctx) {
        ctx.save();
        ctx.translate(this.x * window.game.worldConstants.Scale, this.yScale);
        ctx.rotate(this.angle);
        ctx.translate(this.translateXScale, this.translateYScale);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.fillRectXPos, this.fillRectYPos, this.fillXScale, this.fillYScale);
        ctx.restore();

        Entity.prototype.draw.call(this, ctx);
    };
    //***************************
    // *** END Generic Rectange
    //***************************

    //***************************
    // *** GOAL Rectange
    //***************************
    // Goals actual body is very thin so however the visible width appears much thicker. This is
    // so the world simulator will only collide with the thin part but the visible rendering
    // will appear much larger so the puck will go 'underneath' the visible part before colliding 
    // with the 'thin' part which gives the impression og going 'in' the goal rather than just 
    // touching the visible part
    function GoalEntity(id, x, y, angle, center, color, halfWidth, halfHeight, visibleHalfWidth, visibleHalfHeight, isStatic, density, useLeftShadow,useRightShadow, angularDamping) {
        var enableShadow = (useLeftShadow === true || useRightShadow === true);
        Entity.call(this, id, x, y, angle, center, color, isStatic, density, enableShadow, angularDamping);
        this.halfWidth = halfWidth;
        this.halfHeight = halfHeight;
        this.visibleHalfHeight = visibleHalfHeight;
        this.visibleHalfWidth = visibleHalfWidth;
        this.useLeftShadow = useLeftShadow;
        this.useRightShadow = useRightShadow;

        this.translateXRect = -(this.x) * window.game.worldConstants.Scale;
        this.translateYRect = -(this.y) * window.game.worldConstants.Scale;
        this.fillCentreX = (this.x - this.visibleHalfWidth) * window.game.worldConstants.Scale;
        this.fillCentreY = (this.y - this.visibleHalfHeight) * window.game.worldConstants.Scale;
        this.fillAmountX = (this.visibleHalfWidth * 2) * window.game.worldConstants.Scale;
        this.fillAmountY = (this.visibleHalfHeight * 2) * window.game.worldConstants.Scale;

    }
    GoalEntity.prototype = new Entity();
    GoalEntity.prototype.constructor = GoalEntity;

    GoalEntity.prototype.draw = function (ctx) {
        ctx.save();

        if (this.enableShadow === true) {
            if (this.useLeftShadow === true) {
                ctx.shadowOffsetX = -5;
                ctx.shadowOffsetY = 4;
            } else {
                ctx.shadowOffsetX = 5;
                ctx.shadowOffsetY = 4;
            }
            ctx.shadowBlur = 3;
            ctx.shadowColor = 'rgba(10, 10, 10, 0.6)';
        }

        ctx.translate(this.x * window.game.worldConstants.Scale, this.yScale);
        ctx.rotate(this.angle);
        ctx.translate(this.translateXRect, this.translateYRect);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.fillCentreX,this.fillCentreY,
            this.fillAmountX, this.fillAmountY);
        ctx.restore();

        Entity.prototype.draw.call(this, ctx);
    };
    //***************************
    // *** END GOAL Rectange
    //***************************
    function PolygonEntity(id, x, y, angle, center, color, polys, isStatic, density) {
        Entity.call(this, id, x, y, angle, center, color, isStatic, density);
        this.polys = polys;
    }
    PolygonEntity.prototype = new Entity();
    PolygonEntity.prototype.constructor = PolygonEntity;

    PolygonEntity.prototype.draw = function (ctx) {
        ctx.save();
        ctx.translate(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale);
        ctx.rotate(this.angle);
        ctx.translate(-(this.x) * window.game.worldConstants.Scale, -(this.y) * window.game.worldConstants.Scale);
        ctx.fillStyle = this.color;

        for (var i = 0; i < this.polys.length; i++) {
            var points = this.polys[i];
            ctx.beginPath();
            ctx.moveTo((this.x + points[0].x) * window.game.worldConstants.Scale, (this.y + points[0].y) * window.game.worldConstants.Scale);
            for (var j = 1; j < points.length; j++) {
                ctx.lineTo((points[j].x + this.x) * window.game.worldConstants.Scale, (points[j].y + this.y) * window.game.worldConstants.Scale);
            }
            ctx.lineTo((this.x + points[0].x) * window.game.worldConstants.Scale, (this.y + points[0].y) * window.game.worldConstants.Scale);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();

        Entity.prototype.draw.call(this, ctx);
    };

    // Utility function to create an entity based on the properties in the definition.
    // Assumes an entity is a circle if a 'radius' property is present.
    // Assumes an entity is a polygon if a 'polys' property is present.
    function buildEntity(def) {
        if (def.type === window.game.board.entityType.Player) {
            return new PlayerEntity(def.id, def.x, def.y, def.angle, window.game.worldConstants.NullCenter, def.playercolor, def.radius, def.isStatic, def.density, def.useShadow, def.playerName);
        } else if (def.type === window.game.board.entityType.Goal) {
            return new GoalEntity(def.id, def.x, def.y, def.angle, window.game.worldConstants.NullCenter, def.color, def.halfWidth, def.halfHeight, def.visibleHalfWidth, def.visibleHalfHeight, def.isStatic, def.density, def.useLeftShadow,def.useRightShadow, def.angularDamping);
        } else if (def.type === window.game.board.entityType.Puck) {
            return new PuckEntity(def.id, def.x, def.y, def.angle, window.game.worldConstants.NullCenter, def.puckcolor, def.radius, def.isStatic, def.density, def.useShadow, def.angularDamping);
        } else if (def.type === window.game.board.entityType.Circle) {
            return new CircleEntity(def.id, def.x, def.y, def.angle, window.game.worldConstants.NullCenter, def.color, def.radius, def.isStatic, def.density, def.useShadow, def.angularDamping);
        } else if (def.type === window.game.board.entityType.Polygon) {
            return new PolygonEntity(def.id, def.x, def.y, def.angle, window.game.worldConstants.NullCenter, def.color, def.polys, def.isStatic, def.density, def.useShadow);
        } else {
            return new RectangleEntity(def.id, def.x, def.y, def.angle, window.game.worldConstants.NullCenter, def.color, def.halfWidth, def.halfHeight, def.isStatic, def.density, def.useShadow);
        }
    };

    return {
        buildEntity: buildEntity,
        setDebugMode: setDebugMode
    };

}();