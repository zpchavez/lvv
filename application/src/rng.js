/* globals window */
'use strict';

var randomSeed = require('random-seed');

var RNG = function()
{
    var seed, matches;

    matches = /seed=([^&]+)/.exec(window.location.search);
    if (matches) {
        seed = matches[1];
    } else {
        seed = Date.now();
    }

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