'use strict';

var CarSprite            = require('./car');
var playerColorNames     = require('../player-color-names');
var teamPlayerColorNames = require('../team-player-color-names');
var _                    = require('underscore');

var CarFactory = function(state, options)
{
    options = options || {};
    _(options).defaults({teams : false});

    this.state = state;
    this.teams = options.teams;
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
    var colorNames;

    colorNames = this.teams ? teamPlayerColorNames : playerColorNames;

    return (
        'assets/img/vehicles/' +
        this.vehicleName + '/' +
        colorNames[player] + '-' +
        this.vehicleName + '.png'
    );
};

CarFactory.prototype.spritePrototype = CarSprite;

CarFactory.prototype.getNew = function(x, y, key)
{
    return new this.spritePrototype(this.state, x, y, key);
};

module.exports = CarFactory;