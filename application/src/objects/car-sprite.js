'use strict';

var Phaser       = require('phaser');
var rotateVector = require('../util').rotateVector;

var Car = function(state, x, y, key, group)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key, group]);

    this.state = state;

    this.state.game.physics.p2.enable(this);

    this.body.mass = 10;
};

Car.prototype = Object.create(Phaser.Sprite.prototype);

Car.prototype.accelerate = function()
{
    this.body.applyForce(
        rotateVector(this.body.rotation, [0, 1600]),
        this.body.x,
        this.body.y
    );
};

Car.prototype.brake = function()
{
    this.body.applyForce(
        rotateVector(this.body.rotation, [0, -500]),
        this.body.x,
        this.body.y
    );
};

Car.prototype.turnRight = function()
{
    this.body.rotateRight(80);
};


Car.prototype.turnLeft = function()
{
    this.body.rotateLeft(80);
};

Car.prototype.applyForces = function()
{
    this.body.setZeroRotation();

    var carRefVelocity = rotateVector(-this.body.rotation, [this.body.velocity.x, this.body.velocity.y]);

    // apply rolling friction
    this.body.applyForce(
        rotateVector(this.body.rotation, [0, carRefVelocity[1] * 0.175 * this.body.mass]),
        this.body.x,
        this.body.y
    );

    // apply skid friction
    this.body.applyForce(
        rotateVector(this.body.rotation, [carRefVelocity[0] * 0.25 * this.body.mass, 0]),
        this.body.x,
        this.body.y
    );
};

module.exports = Car;