'use strict';

var seedrandom = require('seedrandom');

var RNG = function(seed)
{
    seed = seed || Date.now();

    this.rng = seedrandom(seed);
};

RNG.prototype.getIntBetween = function(min, max)
{
    return Math.round(this.rng() * (max - min) + min);
};

RNG.prototype.pickValueFromArray = function(array)
{
    var max, selectedIndex;

    max = array.length - 1;

    selectedIndex = this.getIntBetween(0, max);

    return array[selectedIndex];
};

module.exports = RNG;