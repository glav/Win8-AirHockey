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

        if (this.innerText.text !== null) {

            ctx.font = this.innerText.font !== null ? this.innerText.font : "30px Arial";
            ctx.strokeStyle = this.innerText.color !== null ? this.innerText.color : "white";
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillText(this.innerText.text, this.center.x * window.game.worldConstants.Scale - (this.innerText.inset * window.game.worldConstants.Scale), this.center.y * window.game.worldConstants.Scale);
        }
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

    }
    PuckEntity.prototype = new Entity();
    PuckEntity.prototype.constructor = PuckEntity;
    PuckEntity.prototype.update = function (state) {
        this.x = state.x;
        this.y = state.y;
        this.center = state.c;
        this.angle = state.a;
    };
    PuckEntity.prototype.draw = function (ctx) {
        ctx.save();

        if (debugMode !== true) {
            if (this.imageLoaded === true) {
                ctx.drawImage(this.image, (this.x - this.radius) * window.game.worldConstants.Scale, (this.y - this.radius) * window.game.worldConstants.Scale, this.radius * 2 * window.game.worldConstants.Scale, this.radius * 2 * window.game.worldConstants.Scale);
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
        }

        ctx.restore();
        Entity.prototype.draw.call(this, ctx);
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

    }
    PlayerEntity.prototype = new Entity();
    PlayerEntity.prototype.constructor = PuckEntity;
    PlayerEntity.prototype.update = function (state) {
        this.x = state.x;
        this.y = state.y;
        this.center = state.c;
        this.angle = state.a;
    };
    PlayerEntity.prototype.draw = function (ctx) {
        ctx.save();

        if (debugMode !== true) {
            if (this.imageLoaded === true) {
                ctx.drawImage(this.image, (this.x - this.radius) * window.game.worldConstants.Scale, (this.y - this.radius) * window.game.worldConstants.Scale, this.radius * 2 * window.game.worldConstants.Scale, this.radius * 2 * window.game.worldConstants.Scale);
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
        }

        ctx.restore();
        Entity.prototype.draw.call(this, ctx);
    };
    //*****************************************************
    // END Puck
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

    function RectangleEntity(id, x, y, angle, center, color, halfWidth, halfHeight, isStatic, density) {
        Entity.call(this, id, x, y, angle, center, color, isStatic, density);
        this.halfWidth = halfWidth;
        this.halfHeight = halfHeight;
    }
    RectangleEntity.prototype = new Entity();
    RectangleEntity.prototype.constructor = RectangleEntity;

    RectangleEntity.prototype.draw = function (ctx) {
        ctx.save();
        ctx.translate(this.x * window.game.worldConstants.Scale, this.y * window.game.worldConstants.Scale);
        ctx.rotate(this.angle);
        ctx.translate(-(this.x) * window.game.worldConstants.Scale, -(this.y) * window.game.worldConstants.Scale);
        ctx.fillStyle = this.color;
        ctx.fillRect((this.x - this.halfWidth) * window.game.worldConstants.Scale,
            (this.y - this.halfHeight) * window.game.worldConstants.Scale,
            (this.halfWidth * 2) * window.game.worldConstants.Scale,
            (this.halfHeight * 2) * window.game.worldConstants.Scale);
        ctx.restore();

        Entity.prototype.draw.call(this, ctx);
    };

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
        if (def.playercolor || def.playerName) {
            return new PlayerEntity(def.id, def.x, def.y, def.angle, window.game.worldConstants.NullCenter, def.playercolor, def.radius, def.isStatic, def.density, def.useShadow, def.playerName);
        } else if (def.puckcolor) {
            return new PuckEntity(def.id, def.x, def.y, def.angle, window.game.worldConstants.NullCenter, def.puckcolor, def.radius, def.isStatic, def.density, def.useShadow, def.angularDamping);
        } else if (def.radius) {
            return new CircleEntity(def.id, def.x, def.y, def.angle, window.game.worldConstants.NullCenter, def.color, def.radius, def.isStatic, def.density, def.useShadow, def.angularDamping);
        } else if (def.polys) {
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