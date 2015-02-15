'use strict';

var AbstractMarker = require('./abstract-marker');

var FinishMarker = function(state, x, y, key, angle)
{
    AbstractMarker.apply(this, arguments);
};

FinishMarker.prototype = Object.create(AbstractMarker.prototype);

module.exports = FinishMarker;
