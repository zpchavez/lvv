'use strict';

var Phaser       = require('phaser');
var rotateVector = require('../util').rotateVector;

var Car = function(state, x, y, key)
{
    var centerOfMassParticle;

    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.state = state;

    this.state.game.physics.p2.enable(this);

    centerOfMassParticle = this.body.addParticle(0, 0);
    centerOfMassParticle.centerOfMassFor = this;

    this.constants = this.getConstants();
    Object.freeze(this.constants);

    this.body.mass = this.constants.MASS;

    this.victorySpinning = false;
    this.falling         = false;
    this.airborne        = false;
    this.onRoughTerrain  = false;
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

Car.prototype.controlsLocked = function()
{
    return (
        this.falling ||
        this.victorySpinning
    );
};

Car.prototype.accelerate = function()
{
    if (this.controlsLocked() || this.airborne) {
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
    if (this.controlsLocked() || this.airborne) {
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
    if (this.controlsLocked()) {
        return;
    }

    this.body.rotateRight(this.constants.TURNING_VELOCITY);
};


Car.prototype.turnLeft = function()
{
    if (this.controlsLocked()) {
        return;
    }

    this.body.rotateLeft(this.constants.TURNING_VELOCITY);
};

Car.prototype.applyForces = function()
{
    this.body.setZeroRotation();

    if (this.airborne) {
        return;
    }

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

    if (this.victorySpinning) {
        this.body.rotateRight(150);
    }
};

Car.prototype.fall = function(fallTargetLocation, easeToTarget)
{
    this.falling = true;

    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    if (easeToTarget) {
        console.log('Translation tween!');
        console.log(arguments);
        this.state.game.add.tween(this.body)
            .to(
                {x : fallTargetLocation.x, y: fallTargetLocation.y},
                500,
                Phaser.Easing.Linear.None,
                true
            );
    } else {
        this.body.x = fallTargetLocation.x;
        this.body.y = fallTargetLocation.y;
    }

    this.state.game.add.tween(this.scale)
        .to(
            {x : 0.1, y: 0.1},
            500,
            Phaser.Easing.Linear.None,
            true
        )
        .onComplete.add(this.doneFalling, this);
};

Car.prototype.doneFalling = function()
{
    this.falling = false;
    this.scale.x = 1;
    this.scale.y = 1;
    this.state.moveCarToLastActivatedMarker(this);
};

Car.prototype.setVictorySpinning = function(value)
{
    this.victorySpinning = value;
};

Car.prototype.jump = function()
{
    var speed, jumpHeight, timeToVertex;

    speed = Math.sqrt(
        Math.pow(this.body.velocity.x, 2) +
        Math.pow(this.body.velocity.y, 2)
    );

    jumpHeight   = this.constants.JUMP_HEIGHT_MULTIPLIER * speed;
    timeToVertex = jumpHeight * 200;

    if (jumpHeight > 1) {
        this.airborne = true;

        this.state.game.add.tween(this.scale)
            .to({x : jumpHeight, y: jumpHeight}, timeToVertex, Phaser.Easing.Quadratic.Out)
            .to({x : 1, y : 1}, timeToVertex, Phaser.Easing.Quadratic.In)
            .start()
            .onComplete.add(this.land, this);
    }
};

Car.prototype.land = function()
{
    this.airborne = false;
};

module.exports = Car;
