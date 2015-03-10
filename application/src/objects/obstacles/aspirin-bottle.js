'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var AspirinBottle = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

AspirinBottle.prototype = Object.create(AbstractStaticObstacle.prototype);

AspirinBottle.prototype.getSpritePath = function()
{
    return ('assets/img/aspirin-bottle.png');
};

AspirinBottle.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'aspirinBottle');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = AspirinBottle;
