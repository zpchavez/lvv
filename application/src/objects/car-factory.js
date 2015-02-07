'use strict';

var CarSprite = require('./car-sprite');

var CarFactory = function() {};

CarFactory.prototype.loadAssets = function(state)
{
    state.load.image('car', this.getSpritePath());
};

CarFactory.prototype.getSpritePath = function()
{
    return 'assets/img/bluebox.png';
};

CarFactory.prototype.spritePrototype = CarSprite;

CarFactory.prototype.getSprite = function(state, x, y, key, group)
{
    return new this.spritePrototype(state, x, y, key, group);
};

module.exports = CarFactory;