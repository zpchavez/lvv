'use strict';

var randomSeed  = require('random-seed');
var settings    = require('./settings');

var RNG = function()
{
    this.rng = randomSeed.create(settings.seed);
};

RNG.prototype.getIntBetween = function(min, max)
{
    return Math.round(this.rng.random() * (max - min) + min);
};

RNG.prototype.happensGivenProbability = function(chance) {
    return this.rng.random() <= chance;
};

RNG.prototype.pickValueFromArray = function(array)
{
    var max, selectedIndex;

    max = array.length - 1;

    selectedIndex = this.getIntBetween(0, max);

    return array[selectedIndex];
};

module.exports = new RNG();
