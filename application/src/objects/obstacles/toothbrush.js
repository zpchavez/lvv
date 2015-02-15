'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var Toothbrush = function(state, x, y, key)
{
    AbstractStaticObstacle.apply(this, arguments);
};

Toothbrush.prototype = Object.create(AbstractStaticObstacle.prototype);

Toothbrush.prototype.getSpritePath = function()
{
    return ('assets/img/toothbrush.png');
};

Toothbrush.prototype.createPhysicsBody = function(state, rotation)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'toothbrush');

    if (rotation) {
        this.body.rotation = rotation * Math.PI / 180;
    }
};

module.exports = Toothbrush;
