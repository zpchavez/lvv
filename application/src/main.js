'use strict';

var Phaser           = require('phaser');
var RaceState        = require('./classes/states/race-state');
var MainMenuState    = require('./classes/states/menus/main-menu-state');
var settings         = require('./settings');

var InitialState;

if (settings.state === 'track') {
    InitialState = RaceState;
} else {
    InitialState = MainMenuState;
}

var game = new Phaser.Game(
    960,
    540,
    Phaser.AUTO,
    'phaser-template',
    new MainMenuState()
);

module.exports = game;
