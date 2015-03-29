'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var Razor = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

Razor.prototype = Object.create(AbstractStaticObstacle.prototype);

Razor.prototype.getSpritePath = function()
{
    return ('assets/img/razor.png');
};

Razor.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'razor');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = Razor;
