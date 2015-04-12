'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var Binder = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

Binder.prototype = Object.create(AbstractStaticObstacle.prototype);

Binder.prototype.getSpritePath = function()
{
    return ('assets/img/obstacles/binder.png');
};

Binder.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'binder');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = Binder;
