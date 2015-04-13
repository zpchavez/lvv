'use strict';

var AbstractObstacle = require('./abstract-obstacle');

var AbstractDynamicObstacle = function(state, x, y, key, angle)
{
    AbstractObstacle.apply(this, arguments);

    this.createPhysicsBody(state, angle);

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
        this.body.x,
        this.body.y
    );
};

module.exports = AbstractDynamicObstacle;
