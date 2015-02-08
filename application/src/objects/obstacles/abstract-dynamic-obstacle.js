'use strict';

var Phaser = require('phaser');

var AbstractDynamicObstacle = function(state, x, y, key, collisionGroup)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.createPhysicsBody(state);

    this.body.setCollisionGroup(collisionGroup);
    this.body.mass = this.getAttributes().mass;
    this.body.angularDamping = this.getAttributes().angularDamping;
};

AbstractDynamicObstacle.prototype = Object.create(Phaser.Sprite.prototype);

AbstractDynamicObstacle.prototype.getSpritePath = function()
{
    throw new Error('Attempted to load assets on abstract class');
};

AbstractDynamicObstacle.prototype.getAttributes = function()
{
    return {
        angularDamping     : 0.97,
        mass               : 1,
        frictionMultiplier : 0.2
    };
};

AbstractDynamicObstacle.prototype.createPhysicsBody = function(state)
{
    state.game.physics.p2.enable(this);
};

AbstractDynamicObstacle.prototype.update = function()
{
    var frictionMultiplier = this.getAttributes().frictionMultiplier;

    this.body.applyForce(
        [
            this.body.velocity.x * frictionMultiplier * this.body.mass,
            this.body.velocity.y * frictionMultiplier * this.body.mass
        ],
        this.body.x,
        this.body.y
    );
};

module.exports = AbstractDynamicObstacle;
