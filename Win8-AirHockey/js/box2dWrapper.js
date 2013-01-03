window.game.simulator = function () {

    var b2Vec2 = Box2D.Common.Math.b2Vec2
     , b2AABB = Box2D.Collision.b2AABB
     , b2BodyDef = Box2D.Dynamics.b2BodyDef
     , b2Body = Box2D.Dynamics.b2Body
     , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
     , b2Fixture = Box2D.Dynamics.b2Fixture
     , b2World = Box2D.Dynamics.b2World
     , b2MassData = Box2D.Collision.Shapes.b2MassData
     , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
     , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
     , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
     , b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
     , b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef
     , b2PulleyJointDef = Box2D.Dynamics.Joints.b2PulleyJointDef
    ;

    function box2dWrapper(intervalRate, adaptive, width, height, scale, gameType) {
        this.gameMode = window.game.gameType.twoPlayer;
        if (typeof gameType !== 'undefined') {
            this.gameMode = gameType;
        }
        this.intervalRate = parseInt(intervalRate);
        this.adaptive = adaptive;
        this.width = width;
        this.height = height;
        this.scale = scale;

        this.bodiesMap = {};

        //this.world = new b2World(
        //      new b2Vec2(0, 10)    //gravity
        //   , true                 //allow sleep
        //);
        this.world = new b2World(
              new b2Vec2(0, 0)    //gravity
           , true                 //allow sleep
        );

        var settings = window.game.settings.getCurrent();

        this.fixDef = new b2FixtureDef;
        if (this.gameMode === window.game.gameType.singlePlayer) {
            // For one player game, we setup the friction/restitution to be really fast
            this.fixDef.density = 1;
            this.fixDef.friction = 0 + ((settings.singlePlayerDifficulty ^ 3) * 0.30);
            this.fixDef.restitution = 1 - ((settings.singlePlayerDifficulty ^ 3) * 0.30);
        } else {
            // For two player game, we use the settings.
            this.fixDef.density = 1.0;
            this.fixDef.friction = settings.boardFriction;
            this.fixDef.restitution = settings.simulatorRestitution / 100;
            //this.fixDef.restitution = .6;
        }
    }


    box2dWrapper.prototype.clearForces = function () {
        this.world.ClearForces();

    }

    box2dWrapper.prototype.cancelAllMovement = function (body) {
        body.SetLinearVelocity({ x: 0, y: 0 });
        body.SetAngularVelocity(0);
        body.SetAngle(0);
    }

    box2dWrapper.prototype.update = function () {
        var start = Date.now();
        var stepRate = (this.adaptive) ? (now - this.lastTimestamp) / 1000 : (1 / this.intervalRate);
        this.world.Step(
               stepRate   //frame-rate
            , 10       //velocity iterations
            , 10       //position iterations
         );
        this.world.ClearForces();
        return (Date.now() - start);
    }

    box2dWrapper.prototype.getState = function () {
        var state = {};
        for (var b = this.world.GetBodyList() ; b; b = b.m_next) {
            if (b.IsActive() && typeof b.GetUserData() !== 'undefined' && b.GetUserData() != null) {
                state[b.GetUserData()] = this.getBodySpec(b);
            }
        }
        return state;
    }

    box2dWrapper.prototype.getBodySpec = function (b) {
        return { x: b.GetPosition().x, y: b.GetPosition().y, a: b.GetAngle(), c: { x: b.GetWorldCenter().x, y: b.GetWorldCenter().y } };
    }

    box2dWrapper.prototype.setBodies = function (bodyEntities) {
        var bodyDef = new b2BodyDef;

        for (var id in bodyEntities) {
            var entity = bodyEntities[id];

            if (entity.id == 'ground' || entity.isStatic === true) {
                bodyDef.type = b2Body.b2_staticBody;
            } else {
                bodyDef.type = b2Body.b2_dynamicBody;
            }

            bodyDef.position.x = entity.x;
            bodyDef.position.y = entity.y;
            bodyDef.userData = entity.id;
            bodyDef.angle = entity.angle;
            if (entity.fixedRotation) {
                bodyDef.fixedRotation = entity.fixedRotation;
            }
            if (entity.angularDamping) {
                bodyDef.SetAngularDamping(entity.angularDamping);
            }
            var body = this.registerBody(bodyDef);

            if (entity.radius) {
                this.fixDef.shape = new b2CircleShape(entity.radius);
                if (typeof entity.density !== 'undefined') {
                    this.fixDef.density = entity.density;
                }

                body.CreateFixture(this.fixDef);
            } else if (entity.polys) {
                for (var j = 0; j < entity.polys.length; j++) {
                    var points = entity.polys[j];
                    var vecs = [];
                    for (var i = 0; i < points.length; i++) {
                        var vec = new b2Vec2();
                        vec.Set(points[i].x, points[i].y);
                        vecs[i] = vec;
                    }
                    this.fixDef.shape = new b2PolygonShape;
                    if (typeof entity.density !== 'undefined') {
                        this.fixDef.density = entity.density;
                    }

                    this.fixDef.shape.SetAsArray(vecs, vecs.length);
                    body.CreateFixture(this.fixDef);
                }
            } else {
                this.fixDef.shape = new b2PolygonShape;
                if (typeof entity.density !== 'undefined') {
                    this.fixDef.density = entity.density;
                }

                this.fixDef.shape.SetAsBox(entity.halfWidth, entity.halfHeight);
                body.CreateFixture(this.fixDef);
            }
        }
        this.ready = true;
    }

    box2dWrapper.prototype.registerBody = function (bodyDef) {
        var body = this.world.CreateBody(bodyDef);
        this.bodiesMap[body.GetUserData()] = body;
        return body;
    }

    box2dWrapper.prototype.addRevoluteJoint = function (body1Id, body2Id, params) {
        var body1 = this.bodiesMap[body1Id];
        var body2 = this.bodiesMap[body2Id];
        var joint = new b2RevoluteJointDef();
        joint.Initialize(body1, body2, body1.GetWorldCenter());
        if (params && params.motorSpeed) {
            joint.motorSpeed = params.motorSpeed;
            joint.maxMotorTorque = params.maxMotorTorque;
            joint.enableMotor = true;
        }
        this.world.CreateJoint(joint);
    }

    box2dWrapper.prototype.getBody = function (id) {
        return this.bodiesMap[id];
    };

    box2dWrapper.prototype.applyImpulseVector = function (bodyId, vector, power) {
        var body = this.bodiesMap[bodyId];
        body.ApplyImpulse(new b2Vec2(vector.x * power,
                                     vector.y * power),
                                     body.GetWorldCenter());
    };

    box2dWrapper.prototype.applyImpulse = function (bodyId, degrees, power) {
        var body = this.bodiesMap[bodyId];
        body.ApplyImpulse(new b2Vec2(Math.cos(degrees * (Math.PI / 180)) * power,
                                     Math.sin(degrees * (Math.PI / 180)) * power),
                                     body.GetWorldCenter());
    };
    box2dWrapper.prototype.applyForce = function (bodyId, force, point) {
        var body = this.bodiesMap[bodyId];
        body.ApplyForce(force, point);
    };

    box2dWrapper.prototype.mouseDownAt = function (x, y) {
        if (!this.mouseJoint) {
            var body = this.getBodyAt(x, y);
            if (body) {
                var md = new b2MouseJointDef();
                md.bodyA = this.world.GetGroundBody();
                md.bodyB = body;
                md.target.Set(x, y);
                md.collideConnected = true;
                md.maxForce = 300.0 * body.GetMass();
                this.mouseJoint = this.world.CreateJoint(md);
                //body.SetAwake(true);
            }
        } else {
            this.mouseJoint.SetTarget(new b2Vec2(x, y));
        }
    }

    box2dWrapper.prototype.addContactListener = function (callbacks) {
        var listener = new Box2D.Dynamics.b2ContactListener;
        if (callbacks.BeginContact) listener.BeginContact = function (contact) {
            callbacks.BeginContact(contact.GetFixtureA().GetBody().GetUserData(),
                                   contact.GetFixtureB().GetBody().GetUserData());
        }
        if (callbacks.EndContact) listener.EndContact = function (contact) {
            callbacks.EndContact(contact.GetFixtureA().GetBody().GetUserData(),
                                 contact.GetFixtureB().GetBody().GetUserData());
        }
        if (callbacks.PostSolve) listener.PostSolve = function (contact, impulse) {
            callbacks.PostSolve(contact.GetFixtureA().GetBody().GetUserData(),
                                 contact.GetFixtureB().GetBody().GetUserData(),
                                 impulse.normalImpulses[0]);
        }
        this.world.SetContactListener(listener);
    }

    box2dWrapper.prototype.removeBody = function (id) {
        this.world.DestroyBody(this.bodiesMap[id]);
    }

    box2dWrapper.prototype.isMouseDown = function () {
        return (this.mouseJoint != null);
    }

    box2dWrapper.prototype.mouseUp = function () {
        this.world.DestroyJoint(this.mouseJoint);
        this.mouseJoint = null;
    }

    box2dWrapper.prototype.getBodyAt = function (x, y) {
        var mousePVec = new b2Vec2(x, y);
        var aabb = new b2AABB();
        aabb.lowerBound.Set(x - 0.001, y - 0.001);
        aabb.upperBound.Set(x + 0.001, y + 0.001);

        // Query the world for overlapping shapes.

        var selectedBody = null;
        this.world.QueryAABB(function (fixture) {
            if (fixture.GetBody().GetType() != b2Body.b2_staticBody) {
                if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
                    selectedBody = fixture.GetBody();
                    return false;
                }
            }
            return true;
        }, aabb);
        return selectedBody;
    }

    box2dWrapper.prototype.getBodyIdAt = function (x, y) {
        var body = this.getBodyAt(x, y);
        if (body) {
            return body.GetUserData();
        } else {
            return null;
        }
    }

    return { box2dWrapper: box2dWrapper };
}();