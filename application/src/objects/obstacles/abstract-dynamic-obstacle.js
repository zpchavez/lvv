'use strict';

var Phaser = require('phaser');

var AbstractDynamicObstacle = function(state, x, y, key)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.createPhysicsBody(state);

    this.constants = this.getConstants();
    Object.freeze(this.constants);

    this.body.mass = this.constants.MASS;
    this.body.angularDamping = this.constants.ANGULAR_DAMPING;
};

AbstractDynamicObstacle.prototype = Object.create(Phaser.Sprite.prototype);

AbstractDynamicObstacle.prototype.getSpritePath = function()
{
    throw new Error('Attempted to load assets on abstract class');
};

AbstractDynamicObstacle.prototype.getConstants = function()
{
    return {
        ANGULAR_DAMPING     : 0.97,
        MASS                : 1,
        FRICTION_MULTIPLIER : 0.2
    };
};

AbstractDynamicObstacle.prototype.createPhysicsBody = function(state)
{
    state.game.physics.p2.enable(this);
};

AbstractDynamicObstacle.prototype.update = function()
{
    var frictionMultiplier = this.constants.FRICTION_MULTIPLIER;

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
