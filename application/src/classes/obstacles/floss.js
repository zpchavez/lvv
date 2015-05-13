'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var Floss = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

Floss.prototype = Object.create(AbstractStaticObstacle.prototype);

Floss.prototype.getSpritePath = function()
{
    return ('assets/img/obstacles/floss.png');
};

Floss.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'floss');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = Floss;
