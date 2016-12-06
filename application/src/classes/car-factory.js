'use strict';

var CarSprite = require('./car');
var colors = require('../colors');
var global = require('../global-state');
var _ = require('underscore');
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
    this.state.load.image('player0', this.getSpritePath());
    this.state.load.image('player1', this.getSpritePath());
    this.state.load.image('player2', this.getSpritePath());
    this.state.load.image('player3', this.getSpritePath());
    this.state.load.image('car-glass', 'assets/img/vehicles/car-glass.png');

    this.weaponFactory.loadAssets();
};

CarFactory.prototype.getSpritePath = function(player)
{
    return 'assets/img/vehicles/car-body.png';
};

CarFactory.prototype.spritePrototype = CarSprite;

CarFactory.prototype.getNew = function(x, y, playerNumber)
{
    var car = new this.spritePrototype(
        this.state,
        x,
        y,
        'player' + playerNumber,
        this.weaponFactory
    );

    if (global.state.colors) {
        car.tint = colors[global.state.colors[playerNumber]].hex;
    }
    return car;
};

module.exports = CarFactory;
