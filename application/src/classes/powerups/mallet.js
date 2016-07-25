'use strict';

var AbstractPowerup = require('./abstract-powerup');

var Mallet = function(state, x, y, key)
{
    AbstractPowerup.apply(this, arguments);
};

Mallet.prototype = Object.create(AbstractPowerup.prototype);

Mallet.prototype.getSpritePath = function(key)
{
    return 'assets/img/powerups/mallet.png';
};

Mallet.prototype.applyPowerup = function(car)
{
    car.armWithMallet();
}

module.exports = Mallet;
