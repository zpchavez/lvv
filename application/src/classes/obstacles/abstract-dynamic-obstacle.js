'use strict';

var AbstractObstacle = require('./abstract-obstacle');

var AbstractDynamicObstacle = function(state, x, y, key, angle)
{
    AbstractObstacle.apply(this, arguments);

    this.constants = this.getConstants();
    Object.freeze(this.constants);

    this.body.mass = this.constants.MASS;
    this.body.angularDamping = this.constants.ANGULAR_DAMPING;
};

AbstractDynamicObstacle.prototype = Object.create(AbstractObstacle.prototype);

AbstractDynamicObstacle.prototype.getConstants = function()
{
    return {
        ANGULAR_DAMPING     : 0.97,
        MASS                : 1,
        FRICTION_MULTIPLIER : 0.2
    };
};

AbstractDynamicObstacle.prototype.update = function()
{
    var frictionMultiplier = this.constants.FRICTION_MULTIPLIER;

    this.body.applyForce(
        [
            this.body.velocity.x * frictionMultiplier * this.body.mass,
            this.body.velocity.y * frictionMultiplier * this.body.mass
        ],
        0,
        0
    );
};

AbstractDynamicObstacle.prototype.splash = function(splashTargetLocation)
{
    this.splashing = true;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.body.angle = 0;
    this.tint = 0xffffff;
    this.loadTexture('splash', 0);
    this.body.x = splashTargetLocation.x;
    this.body.y = splashTargetLocation.y;
    this.animations.add('splash', [0, 1], 2, false);
    this.animations.play('splash', null, false, true);
};

AbstractDynamicObstacle.prototype.fall = function(fallTargetLocation, easeToTarget)
{
    this.falling = true;

    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.body.clearCollision();

    if (easeToTarget) {
        this.game.add.tween(this.body)
            .to(
                {x : fallTargetLocation.x, y: fallTargetLocation.y},
                500,
                Phaser.Easing.Linear.None,
                true
            );
    } else {
        this.body.x = fallTargetLocation.x;
        this.body.y = fallTargetLocation.y;
    }

    this.game.add.tween(this.scale)
        .to(
            {x : 0.1, y: 0.1},
            500,
            Phaser.Easing.Linear.None,
            true
        )
        .onComplete.add(this.destroy, this);
};

module.exports = AbstractDynamicObstacle;
