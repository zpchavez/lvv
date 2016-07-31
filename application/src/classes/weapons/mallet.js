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
        MASS                : 0.5,
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

Mallet.prototype.swingRight = function() {
    console.log('swinging right');
};

Mallet.prototype.update = function() {
};

Mallet.prototype.fall = function() {
    return null;
}

module.exports = Mallet;
