'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var MarkerBlack = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

MarkerBlack.prototype = Object.create(AbstractStaticObstacle.prototype);

MarkerBlack.prototype.getSpritePath = function()
{
    return ('assets/img/obstacles/marker-black.png');
};

MarkerBlack.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'marker');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = MarkerBlack;
