'use strict';

var randomSeed = require('random-seed');

var RNG = function(seed)
{
    seed = seed || Date.now();

    this.rng = randomSeed.create(seed);
};

RNG.prototype.getIntBetween = function(min, max)
{
    return Math.round(this.rng.random() * (max - min) + min);
};

RNG.prototype.pickValueFromArray = function(array)
{
    var max, selectedIndex;

    max = array.length - 1;

    selectedIndex = this.getIntBetween(0, max);

    return array[selectedIndex];
};

module.exports = new RNG();