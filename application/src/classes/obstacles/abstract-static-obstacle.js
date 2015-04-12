'use strict';

var Phaser = require('phaser');

var AbstractStaticObstacle = function(state, x, y, key, angle)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.createPhysicsBody(state, angle);

    this.body.dynamic = false;
};

AbstractStaticObstacle.prototype = Object.create(Phaser.Sprite.prototype);

AbstractStaticObstacle.prototype.loadAssets = function(state, key)
{
    state.load.image(key, this.getSpritePath());
};

AbstractStaticObstacle.prototype.getSpritePath = function()
{
    throw new error('Attempted to load assets on abstract class');
};

AbstractStaticObstacle.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    if (angle) {
        this.body.angle = angle;
    }
};

AbstractStaticObstacle.prototype.add = function(state)
{
    state.add.existing(this);
};

module.exports = AbstractStaticObstacle;
