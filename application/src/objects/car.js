'use strict';

var Phaser       = require('phaser');
var rotateVector = require('../util').rotateVector;

var Car = function(state, x, y, key)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.state = state;

    this.state.game.physics.p2.enable(this);

    this.constants = this.getConstants();
    Object.freeze(this.constants);

    this.body.mass = this.constants.MASS;

    this.falling        = false;
    this.airborne       = false;
    this.onRoughTerrain = false;
};

Car.prototype = Object.create(Phaser.Sprite.prototype);

Car.prototype.getConstants = function()
{
    return {
        MASS                        : 10,
        ROLLING_FRICTION_MULTIPLIER : 0.175,
        ROUGH_TERRAIN_MULTIPLIER    : 2,
        SKID_FRICTION_MULTIPLIER    : 0.25,
        ACCELERATION_FORCE          : 1600,
        BRAKE_FORCE                 : -500,
        TURNING_VELOCITY            : 80,
        JUMP_HEIGHT_MULTIPLIER      : 0.002
    };
};

Car.prototype.accelerate = function()
{
    if (this.falling) {
        return;
    }

    this.body.applyForce(
        rotateVector(this.body.rotation, [0, this.constants.ACCELERATION_FORCE]),
        this.body.x,
        this.body.y
    );
};

Car.prototype.brake = function()
{
    if (this.falling) {
        return;
    }

    this.body.applyForce(
        rotateVector(this.body.rotation, [0, this.constants.BRAKE_FORCE]),
        this.body.x,
        this.body.y
    );
};

Car.prototype.turnRight = function()
{
    if (this.falling) {
        return;
    }

    this.body.rotateRight(this.constants.TURNING_VELOCITY);
};


Car.prototype.turnLeft = function()
{
    if (this.falling) {
        return;
    }

    this.body.rotateLeft(this.constants.TURNING_VELOCITY);
};

Car.prototype.applyForces = function()
{
    this.body.setZeroRotation();

    var carRefVelocity = rotateVector(
        -this.body.rotation,
        [this.body.velocity.x, this.body.velocity.y]
    );

    // apply rolling friction
    this.body.applyForce(
        rotateVector(
            this.body.rotation,
            [
                0,
                carRefVelocity[1] *
                this.constants.ROLLING_FRICTION_MULTIPLIER *
                (this.onRoughTerrain ? this.constants.ROUGH_TERRAIN_MULTIPLIER : 1) *
                this.body.mass
            ]
        ),
        this.body.x,
        this.body.y
    );

    // apply skid friction
    this.body.applyForce(
        rotateVector(
            this.body.rotation,
            [
                carRefVelocity[0] * this.constants.SKID_FRICTION_MULTIPLIER * this.body.mass,
                0
            ]
        ),
        this.body.x,
        this.body.y
    );
};

Car.prototype.fall = function(tileLocation)
{
    this.falling = true;

    this.body.x = tileLocation.x;
    this.body.y = tileLocation.y;

    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    this.state.game.add.tween(this.scale).to({x : 0.1, y: 0.1}, 500, Phaser.Easing.Linear.None, true)
        .onComplete.add(this.doneFalling, this);
};

Car.prototype.doneFalling = function()
{
    this.falling = false;
    this.scale.x = 1;
    this.scale.y = 1;
    this.state.moveCarToLastActivatedMarker();
};

Car.prototype.jump = function()
{
    var speed, height, timeToVertex;

    this.onRamp  = false;
    this.airborne = true;

    speed = Math.sqrt(
        Math.pow(this.body.velocity.x, 2) +
        Math.pow(this.body.velocity.y, 2)
    );

    height       = this.constants.JUMP_HEIGHT_MULTIPLIER * speed;
    timeToVertex = height * 200;

    this.state.game.add.tween(this.scale)
        .to({x : height, y: height}, timeToVertex, Phaser.Easing.Quadratic.Out)
        .to({x : 1, y : 1}, timeToVertex, Phaser.Easing.Quadratic.In)
        .start()
        .onComplete.add(this.land, this);
};

Car.prototype.land = function()
{
    this.airborne = false;
};

module.exports = Car;
