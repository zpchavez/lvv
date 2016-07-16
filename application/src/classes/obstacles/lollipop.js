'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var Lollipop = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

Lollipop.prototype = Object.create(AbstractStaticObstacle.prototype);

Lollipop.prototype.loadAssets = function(state, key)
{
    state.load.image(key, 'assets/img/obstacles/lollipop.png');
    state.load.physics('Lollipop', 'assets/physics/lollipop.json')
};

Lollipop.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Lollipop', 'lollipop');

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = Lollipop;
