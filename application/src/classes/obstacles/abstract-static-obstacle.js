'use strict';

var AbstractObstacle = require('./abstract-obstacle');

var AbstractStaticObstacle = function(state, x, y, key, angle)
{
    AbstractObstacle.apply(this, arguments);

    this.body.dynamic = false;
};

AbstractStaticObstacle.prototype = Object.create(AbstractObstacle.prototype);

module.exports = AbstractStaticObstacle;
