'use strict';

var CarSprite            = require('./car');
var playerColorNames     = require('../player-color-names');
var teamPlayerColorNames = require('../team-player-color-names');
var _                    = require('underscore');
var WeaponFactory = require('./weapons/weapon-factory');

var CarFactory = function(state, options)
{
    options = options || {};
    _(options).defaults({teams : false});

    this.state = state;
    this.weaponFactory = new WeaponFactory(this.state);
    this.teams = options.teams;
};

CarFactory.prototype.vehicleName = 'car';

CarFactory.prototype.loadAssets = function()
{
    this.state.load.image('player1', this.getSpritePath());
    this.state.load.image('player2', this.getSpritePath());
    this.state.load.image('player3', this.getSpritePath());
    this.state.load.image('player4', this.getSpritePath());

    this.weaponFactory.loadAssets();
};

CarFactory.prototype.getSpritePath = function(player)
{
    return 'assets/img/vehicles/car.png';
};

CarFactory.prototype.spritePrototype = CarSprite;

CarFactory.prototype.getNew = function(x, y, key)
{
    return new this.spritePrototype(this.state, x, y, key, this.weaponFactory);
};

module.exports = CarFactory;
