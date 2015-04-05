'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var Marker = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

Marker.prototype = Object.create(AbstractStaticObstacle.prototype);

Marker.prototype.getSpritePath = function()
{
    return ('assets/img/obstacles/marker.png');
};

Marker.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'marker');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = Marker;
