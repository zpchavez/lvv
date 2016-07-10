'use strict';

var AbstractDynamicObstacle = require('./abstract-dynamic-obstacle');

var Ant = function(state, x, y, key, angle)
{
    AbstractDynamicObstacle.apply(this, arguments);
    this.falling = false;
    this.animations.add('walking', [0, 1, 0, 2], 6, true);
    this.animations.play('walking');
};

Ant.prototype = Object.create(AbstractDynamicObstacle.prototype);

Ant.prototype.loadAssets = function(state, key)
{
    state.game.load.atlas(
        key,
        'assets/img/obstacles/ant.png',
        'assets/img/obstacles/ant.json'
    );
};

Ant.prototype.getConstants = function()
{
    return {
        ANGULAR_DAMPING     : 0.8,
        MASS                : 0.5,
        FRICTION_MULTIPLIER : 0.2
    };
};

Ant.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'ant');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = Ant;
