'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var MarkerBlue = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

MarkerBlue.prototype = Object.create(AbstractStaticObstacle.prototype);

MarkerBlue.prototype.getSpritePath = function()
{
    return ('assets/img/obstacles/marker-blue.png');
};

MarkerBlue.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'marker');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = MarkerBlue;
