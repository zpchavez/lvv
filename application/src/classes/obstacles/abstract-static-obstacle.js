'use strict';

var Phaser = require('phaser');

var AbstractStaticObstacle = function(state, x, y, key, angle)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.createPhysicsBody(state, angle);

    this.body.dynamic = false;
};

AbstractStaticObstacle.prototype = Object.create(Phaser.Sprite.prototype);

AbstractStaticObstacle.prototype.getSpritePath = function()
{
    throw new Error('Attempted to load assets on abstract class');
};

AbstractStaticObstacle.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = AbstractStaticObstacle;
