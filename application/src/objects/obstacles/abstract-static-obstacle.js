'use strict';

var Phaser = require('phaser');

var AbstractStaticObstacle = function(state, x, y, key)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.createPhysicsBody(state);

    this.body.dynamic = false;
};

AbstractStaticObstacle.prototype = Object.create(Phaser.Sprite.prototype);

AbstractStaticObstacle.prototype.getSpritePath = function()
{
    throw new error('Attempted to load assets on abstract class');
};

AbstractStaticObstacle.prototype.createPhysicsBody = function(state)
{
    state.game.physics.p2.enable(this);
};

module.exports = AbstractStaticObstacle;
