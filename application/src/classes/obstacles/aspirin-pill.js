'use strict';

var AbstractDynamicObstacle = require('./abstract-dynamic-obstacle');

var AspirinPill = function(state, x, y, key, angle)
{
    AbstractDynamicObstacle.apply(this, arguments);
};

AspirinPill.prototype = Object.create(AbstractDynamicObstacle.prototype);

AspirinPill.prototype.getSpritePath = function()
{
    return 'assets/img/aspirin-pill.png';
};

AspirinPill.prototype.getConstants = function()
{
    return {
        ANGULAR_DAMPING     : 0.8,
        MASS                : 0.5,
        FRICTION_MULTIPLIER : 0.2
    };
};

AspirinPill.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);
    this.body.setCircle(17);

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = AspirinPill;
