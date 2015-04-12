'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var XboxController = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

XboxController.prototype = Object.create(AbstractStaticObstacle.prototype);

XboxController.prototype.getSpritePath = function()
{
    return ('assets/img/obstacles/xbox-controller.png');
};

XboxController.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'xboxController');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = XboxController;
