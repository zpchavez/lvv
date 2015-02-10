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
};

Car.prototype = Object.create(Phaser.Sprite.prototype);

Car.prototype.getConstants = function()
{
    return {
        MASS                        : 10,
        ROLLING_FRICTION_MULTIPLIER : 0.175,
        SKID_FRICTION_MULTIPLIER    : 0.25,
        ACCELERATION_FORCE          : 1600,
        BRAKE_FORCE                 : -500,
        TURNING_VELOCITY            : 80
    };
};

Car.prototype.accelerate = function()
{
    this.body.applyForce(
        rotateVector(this.body.rotation, [0, this.constants.ACCELERATION_FORCE]),
        this.body.x,
        this.body.y
    );
};

Car.prototype.brake = function()
{
    this.body.applyForce(
        rotateVector(this.body.rotation, [0, this.constants.BRAKE_FORCE]),
        this.body.x,
        this.body.y
    );
};

Car.prototype.turnRight = function()
{
    this.body.rotateRight(this.constants.TURNING_VELOCITY);
};


Car.prototype.turnLeft = function()
{
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
                carRefVelocity[1] * this.constants.ROLLING_FRICTION_MULTIPLIER * this.body.mass
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
                carRefVelocity[0] * this.constants.SKID_FRICTION_MULTIPLIER * this.body.mass, 0
            ]
        ),
        this.body.x,
        this.body.y
    );
};

module.exports = Car;