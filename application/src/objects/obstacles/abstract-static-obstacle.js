'use strict';

var Phaser = require('phaser');

var AbstractStaticObstacle = function(state, x, y, key, rotation)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.createPhysicsBody(state, rotation);

    this.body.dynamic = false;
};

AbstractStaticObstacle.prototype = Object.create(Phaser.Sprite.prototype);

AbstractStaticObstacle.prototype.getSpritePath = function()
{
    throw new error('Attempted to load assets on abstract class');
};

AbstractStaticObstacle.prototype.createPhysicsBody = function(state, rotation)
{
    state.game.physics.p2.enable(this);

    if (rotation) {
        this.body.rotation = rotation * Math.PI / 180;
    }
};

module.exports = AbstractStaticObstacle;
