'use strict';

var Phaser           = require('phaser');
var TrackLoaderState = require('./classes/states/track-loader');
var MainMenuState    = require('./classes/states/menus/main-menu-state');
var settings         = require('./settings');

var InitialState;

if (settings.state === 'track') {
    InitialState = TrackLoaderState;
} else {
    InitialState = MainMenuState;
}

var game = new Phaser.Game(
    960,
    540,
    Phaser.AUTO,
    'phaser-template',
    new InitialState()
);

module.exports = game;
