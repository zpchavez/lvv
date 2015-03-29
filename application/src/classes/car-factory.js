'use strict';

var CarSprite = require('./car');

var CarFactory = function(state)
{
    this.state = state;

    this.playerColorNames = [
        'blue',
        'red',
        'yellow',
        'green'
    ];
};

CarFactory.prototype.vehicleName = 'car';

CarFactory.prototype.loadAssets = function()
{
    this.state.load.image('player1', this.getSpritePath(0));
    this.state.load.image('player2', this.getSpritePath(1));
    this.state.load.image('player3', this.getSpritePath(2));
    this.state.load.image('player4', this.getSpritePath(3));
};

CarFactory.prototype.getSpritePath = function(player)
{
    return (
        'assets/img/vehicles/' +
        this.vehicleName + '/' +
        this.playerColorNames[player] + '-' +
        this.vehicleName + '.png'
    );
};

CarFactory.prototype.spritePrototype = CarSprite;

CarFactory.prototype.getNew = function(x, y, key)
{
    return new this.spritePrototype(this.state, x, y, key);
};

module.exports = CarFactory;