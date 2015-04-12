'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var MarkerGreen = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

MarkerGreen.prototype = Object.create(AbstractStaticObstacle.prototype);

MarkerGreen.prototype.getSpritePath = function()
{
    return ('assets/img/obstacles/marker-green.png');
};

MarkerGreen.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'marker');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = MarkerGreen;
