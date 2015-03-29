'use strict';

var AbstractDynamicObstacle = require('./abstract-dynamic-obstacle');

var DynamicBox = function(state, x, y, key, angle)
{
    AbstractDynamicObstacle.apply(this, arguments);
};

DynamicBox.prototype = Object.create(AbstractDynamicObstacle.prototype);

DynamicBox.prototype.getSpritePath = function()
{
    return 'assets/img/gray-box.png';
};

DynamicBox.prototype.getConstants = function()
{
    return {
        ANGULAR_DAMPING     : 0.97,
        MASS                : 1,
        FRICTION_MULTIPLIER : 0.2
    };
};

module.exports = DynamicBox;
