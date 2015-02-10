'use strict';

var AbstractDynamicObstacle = require('./abstract-dynamic-obstacle');

var ClownNose = function()
{
    AbstractDynamicObstacle.apply(this, arguments);
};

ClownNose.prototype = Object.create(AbstractDynamicObstacle.prototype);

ClownNose.prototype.getSpritePath = function()
{
    return 'assets/img/red-circle.png';
};

ClownNose.prototype.getConstants = function()
{
    return {
        ANGULAR_DAMPING     : 0.97,
        MASS                : 150,
        FRICTION_MULTIPLIER : 0.01
    };
};

ClownNose.prototype.createPhysicsBody = function(state)
{
    state.game.physics.p2.enable(this);
    this.body.setCircle(150);
};

module.exports = ClownNose;
