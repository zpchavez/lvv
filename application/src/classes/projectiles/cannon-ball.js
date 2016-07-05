'use strict';

var AbstractProjectile = require('./abstract-powerup');

var CannonBall = function(state, x, y, key)
{
    AbstractProjectile.apply(this, arguments);
};

CannonBall.prototype = Object.create(AbstractProjectile.prototype);

CannonBall.prototype.applyPowerup = function(car)
{
    car.armWithCannon();
}

module.exports = CannonBall;
