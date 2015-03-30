'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var Toothbrush = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

Toothbrush.prototype = Object.create(AbstractStaticObstacle.prototype);

Toothbrush.prototype.getSpritePath = function()
{
    return ('assets/img/toothbrush.png');
};

Toothbrush.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'toothbrush');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = Toothbrush;
