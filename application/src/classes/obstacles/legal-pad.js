'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var LegalPad = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

LegalPad.prototype = Object.create(AbstractStaticObstacle.prototype);

LegalPad.prototype.getSpritePath = function()
{
    return ('assets/img/obstacles/legal-pad.jpg');
};

LegalPad.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'legalPad');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = LegalPad;
