'use strict';

var CarSprite = require('./car');

var CarFactory = function(state)
{
    this.state = state;
};

CarFactory.prototype.loadAssets = function()
{
    this.state.load.image('car', this.getSpritePath());
};

CarFactory.prototype.getSpritePath = function()
{
    return 'assets/img/bluebox.png';
};

CarFactory.prototype.spritePrototype = CarSprite;

CarFactory.prototype.getNew = function(x, y, key)
{
    return new this.spritePrototype(this.state, x, y, key);
};

module.exports = CarFactory;