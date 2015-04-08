'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var BathroomSink = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

BathroomSink.prototype = Object.create(AbstractStaticObstacle.prototype);

BathroomSink.prototype.getSpritePath = function()
{
    return ('assets/img/sink.png');
};

BathroomSink.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.addCircle(150, 0, 735);

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = BathroomSink;
