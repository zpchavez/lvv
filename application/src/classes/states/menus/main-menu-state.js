'use strict';

var Phaser = require('phaser');
var LoadingNextRaceState = require('../loading-next-race-state');
var settings = require('../../../settings');

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
        '=>',
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
    this.game.lvvGlobals = this.playerChoices[this.numPlayersSelection];

    var score = {};
    if (this.game.lvvGlobals.teams) {
        score.team1 = 0;
        score.team2 = 0;
    } else {
        for (var i = 0; i < 4; i += 1) {
            score['player' + (i + 1)] = 0;
        }
    }
    this.game.lvvGlobals.score = score;

    this.game.state.add('loading', new LoadingNextRaceState(), true);
};

MainMenuState.prototype.initInputs = function()
{
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.game.input.gamepad.start();

    this.cursors.up.onDown.add(this.moveCursorUp.bind(this));
    this.cursors.down.onDown.add(this.moveCursorDown.bind(this));
    this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(this.selectOption.bind(this));

    this.game.input.gamepad.pad1.onDownCallback = function (button) {
        switch (button) {
            case Phaser.Gamepad.XBOX360_A:
                this.selectOption();
                break;
            case Phaser.Gamepad.XBOX360_DPAD_UP:
                this.moveCursorUp();
                break;
            case Phaser.Gamepad.XBOX360_DPAD_DOWN:
                this.moveCursorDown();
                break;
        }
    }.bind(this);
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
    this.game.input.gamepad.pad1.onDownCallback = null;
};

module.exports = MainMenuState;
