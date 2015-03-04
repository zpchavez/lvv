'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var Comb = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

Comb.prototype = Object.create(AbstractStaticObstacle.prototype);

Comb.prototype.getSpritePath = function()
{
    return ('assets/img/comb.png');
};

Comb.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'comb');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = Comb;
