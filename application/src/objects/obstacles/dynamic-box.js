'use strict';

var AbstractDynamicObstacle = require('./abstract-dynamic-obstacle');

var DynamicBox = function()
{
    AbstractDynamicObstacle.apply(this, arguments);
};

DynamicBox.prototype = Object.create(AbstractDynamicObstacle.prototype);

DynamicBox.prototype.getSpritePath = function()
{
    return 'assets/img/gray-box.png';
};

DynamicBox.prototype.getAttributes = function()
{
    return {
        angularDamping     : 0.97,
        mass               : 1,
        frictionMultiplier : 0.2
    };
};

module.exports = DynamicBox;
