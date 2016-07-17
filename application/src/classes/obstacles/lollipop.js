'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var Lollipop = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

Lollipop.prototype = Object.create(AbstractStaticObstacle.prototype);

Lollipop.prototype.getSpritePath = function()
{
    return ('assets/img/obstacles/lollipop.png');
};

Lollipop.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'lollipop');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = Lollipop;
