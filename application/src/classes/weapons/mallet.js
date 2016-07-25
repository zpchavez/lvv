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
        ANGULAR_DAMPING     : 0.8,
        MASS                : 1.0,
        FRICTION_MULTIPLIER : 0.2
    };
};

Mallet.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();
    this.body.loadPolygon('Obstacles', 'mallet');

    if (angle) {
        this.body.angle = angle;
    }
};

Mallet.prototype.fall = function() {
    return null;
}

module.exports = Mallet;
