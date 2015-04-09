'use strict';

var Phaser        = require('phaser');
var MainMenuState = require('./classes/states/menus/main-menu-state');

var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'phaser-template', new MainMenuState());
