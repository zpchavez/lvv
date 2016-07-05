'use strict';

var AbstractPowerup = require('./abstract-powerup');

var HoverPowerup = function(state, x, y, key)
{
    AbstractPowerup.apply(this, arguments);
};

HoverPowerup.prototype = Object.create(AbstractPowerup.prototype);

HoverPowerup.prototype.applyPowerup = function(car)
{
    car.startHovering();
}

module.exports = HoverPowerup;
