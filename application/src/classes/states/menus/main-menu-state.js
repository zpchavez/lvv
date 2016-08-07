'use strict';

var Phaser = require('phaser');
var Controls = require('../../controls');
var SelectColorState = require('./select-color-state');
var settings = require('../../../settings');
var global = require('../../../global-state');

var PLAYERS_1 = 0;
var PLAYERS_2 = 1;
var PLAYERS_3 = 2;
var PLAYERS_4 = 3;
var TEAMS     = 4;

var MainMenuState = function()
{
    Phaser.State.apply(this, arguments);
    this.numPlayersSelection = PLAYERS_1;
    this.playerChoices = [
        { players: 1 },
        { players: 2 },
        { players: 3 },
        { players: 4 },
        { players: 4, teams: true }
    ];
};

MainMenuState.prototype = Object.create(Phaser.State.prototype);

MainMenuState.prototype.preload = function()
{
    this.game.input.onDown.add(this.toggleFullscreen, this);
}

MainMenuState.prototype.create = function()
{
    this.renderTitle();

    this.renderNumPlayersMenu();
    this.renderNumPlayersCursor();

    if (settings.profiler) {
        this.game.add.plugin(Phaser.Plugin.Debug);
    }

    this.initInputs();
};

MainMenuState.prototype.renderTitle = function()
{
    this.titleText = this.game.add.text(
        this.game.width / 2,
        (this.game.height / 2) - 100,
        "L'il Vroom Vrooms!",
        {
            font: '42px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
        }
    );
    this.titleText.anchor.setTo(0.5, 0.5);
};

MainMenuState.prototype.renderNumPlayersMenu = function()
{
    var options = { fill: '#ffffff' };

    var optionStrings = ['1 Player', '2 Players', '3 Players', '4 Players', '4 Player Teams'];
    this.numberOfPlayersTextObjects = [];
    optionStrings.forEach(function (text, index) {
        this.numberOfPlayersTextObjects.push(
            this.game.add.text(
                this.game.width / 2 - 50,
                this.game.height / 2 + (index * 30),
                text,
                options
            )
        );
    }.bind(this));
};

MainMenuState.prototype.renderNumPlayersCursor = function()
{
    var selectedText = this.numberOfPlayersTextObjects[this.numPlayersSelection];

    if (this.cursor) {
        this.cursor.destroy();
    }

    this.cursor = this.game.add.text(
        selectedText.x - 40,
        selectedText.y,
        '🏁',
        { fill: '#ffffff' }
    );
};

MainMenuState.prototype.moveCursorUp = function()
{
    if (this.numPlayersSelection === 0) {
        this.numPlayersSelection = TEAMS;
    } else {
        this.numPlayersSelection -= 1;
    }
    this.renderNumPlayersCursor();
};

MainMenuState.prototype.moveCursorDown = function()
{
    if (this.numPlayersSelection === this.playerChoices.length - 1) {
        this.numPlayersSelection = PLAYERS_1;
    } else {
        this.numPlayersSelection += 1;
    }
    this.renderNumPlayersCursor();
};

MainMenuState.prototype.selectOption = function()
{
    global.state.players = this.playerChoices[this.numPlayersSelection].players;
    global.state.teams = this.playerChoices[this.numPlayersSelection].teams;
    this.game.state.add('select-color', new SelectColorState(), true);
};

MainMenuState.prototype.initInputs = function()
{
    this.controls = new Controls(this.game);
    this.controls.onDown(1, 'UP', this.moveCursorUp.bind(this));
    this.controls.onDown(1, 'DOWN', this.moveCursorDown.bind(this));
    this.controls.onDown(1, 'SELECT', this.selectOption.bind(this));
};

MainMenuState.prototype.toggleFullscreen = function()
{
    if (this.game.scale.isFullScreen) {
        this.game.scale.stopFullScreen();
    } else {
        this.game.scale.startFullScreen(false);
    }
};

MainMenuState.prototype.shutdown = function()
{
    this.controls.reset();
};

module.exports = MainMenuState;
