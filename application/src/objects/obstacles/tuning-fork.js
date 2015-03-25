'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var TuningFork = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

TuningFork.prototype = Object.create(AbstractStaticObstacle.prototype);

TuningFork.prototype.getSpritePath = function()
{
    return ('assets/img/tuning-fork.png');
};

TuningFork.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'tuningFork');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = TuningFork;
