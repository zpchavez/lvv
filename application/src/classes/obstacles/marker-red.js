'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var MarkerRed = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

MarkerRed.prototype = Object.create(AbstractStaticObstacle.prototype);

MarkerRed.prototype.getSpritePath = function()
{
    return ('assets/img/obstacles/marker-red.png');
};

MarkerRed.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'marker');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = MarkerRed;
