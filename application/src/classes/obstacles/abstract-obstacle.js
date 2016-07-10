'use strict';

var Phaser = require('phaser');

var AbstractObstacle = function(state, x, y, key, angle)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.createPhysicsBody(state, angle);
    this.state = state;
};

AbstractObstacle.prototype = Object.create(Phaser.Sprite.prototype);

AbstractObstacle.prototype.loadAssets = function(state, key)
{
    state.load.image(key, this.getSpritePath());
};

AbstractObstacle.prototype.getSpritePath = function()
{
    throw new Error('Attempted to load assets on abstract class');
};

AbstractObstacle.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    if (angle) {
        this.body.angle = angle;
    }
};

AbstractObstacle.prototype.add = function(state)
{
    state.add.existing(this);
};

AbstractObstacle.prototype.addToCollisionGroup = function(collisionGroup)
{
    this.body.setCollisionGroup(collisionGroup);
    this.body.collides(collisionGroup);
};

module.exports = AbstractObstacle;
