'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var StaticBox = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);
};

StaticBox.prototype = Object.create(AbstractStaticObstacle.prototype);

StaticBox.prototype.getSpritePath = function()
{
    return 'assets/img/black-box.png';
};

module.exports = StaticBox;
