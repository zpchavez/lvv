'use strict';

var AbstractDynamicObstacle = require('../obstacles/abstract-dynamic-obstacle');

var Mallet = function(state, x, y, key, angle)
{
    AbstractDynamicObstacle.apply(this, arguments);
};

Mallet.prototype = Object.create(AbstractDynamicObstacle.prototype);

Mallet.prototype.getSpritePath = function()
{
    return 'assets/img/weapons/mallet.png';
};

Mallet.prototype.getConstants = function()
{
    return {
        ANGULAR_DAMPING     : 0,
        MASS                : 10,
        FRICTION_MULTIPLIER : 0
    };
};

Mallet.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);
    this.body.clearShapes();
    this.body.setRectangle(34, 19, 0, -47);

    this.pivot.y = 30;

    if (angle) {
        this.body.angle = angle;
    }
};

Mallet.prototype.isMoving = function() {
    return (this.swingingRight || this.returningToNeutral);
}

Mallet.prototype.swingRight = function() {
    this.swingingRight = true;
    this.state.game.physics.p2.removeConstraint(this.car.malletGearConstraint);
    this.car.malletGearConstraint = null;
    this.body.rotateRight(500);
};

Mallet.prototype.getAngleDifference = function(angle1, angle2) {
    return Math.min(
        Math.abs(
            angle1 - angle2
        ),
        360 - Math.abs(
            angle1 - angle2
        )
    );
}

Mallet.prototype.getCarAngleDiff = function() {
    return this.getAngleDifference(this.body.angle, this.car.body.angle);
}

Mallet.prototype.update = function() {
    if (this.swingingRight && this.getCarAngleDiff() >= 90) {
        this.returningToNeutral = true;
        this.body.setZeroRotation();
        this.body.rotateLeft(250);
    }
    if (this.returningToNeutral && this.getCarAngleDiff() < 5) {
        this.body.angle = this.car.angle;
        this.body.setZeroRotation();
        this.returningToNeutral = false;
        if (! this.car.malletGearConstraint) {
            this.car.addMalletGearConstraint();
        }
    }
};

Mallet.prototype.fall = function() {
    return null;
}

module.exports = Mallet;
