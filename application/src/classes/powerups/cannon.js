'use strict';

var AbstractPowerup = require('./abstract-powerup');

var CannonPowerup = function(state, x, y, key)
{
    AbstractPowerup.apply(this, arguments);
};

CannonPowerup.prototype = Object.create(AbstractPowerup.prototype);

CannonPowerup.prototype.applyPowerup = function(car)
{
    car.armWithCannon();
}

module.exports = CannonPowerup;
