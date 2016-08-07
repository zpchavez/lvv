var Phaser = require('phaser');
var Controls = require('../../controls');
var LoadingNextRaceState = require('../loading-next-race-state');
var CarFactory = require('../../car-factory');
var global = require('../../../global-state');
var colors = require('../../../colors');

var SelectColorState = function()
{
    Phaser.State.apply(this, arguments);
    this.carFactory = new CarFactory(this);
};

SelectColorState.prototype = Object.create(Phaser.State.prototype);

SelectColorState.prototype.preload = function()
{
    this.carFactory.loadAssets();
};

SelectColorState.prototype.create = function()
{
    this.renderText();
    this.renderCars();
    this.initInputs();
};

SelectColorState.prototype.renderText = function()
{
    this.titleText = this.game.add.text(
        this.game.width / 2,
        (this.game.height / 2) - 100,
        "Choose Color",
        {
            font: '42px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
        }
    );
    this.titleText.anchor.setTo(0.5, 0.5);
};

SelectColorState.prototype.renderCars = function()
{
    var positions;

    if (global.state.players === 1) {
        positions = [
            [this.game.width / 2, this.game.height / 2]
        ];
    } else if (global.state.players === 2 || global.state.teams) {
        positions = [
            [(this.game.width / 2) - 50, this.game.height / 2],
            [(this.game.width / 2) + 50, this.game.height / 2],
        ];
    } else if (global.state.players === 3) {
        positions = [
            [this.game.width / 2, this.game.height / 2],
            [(this.game.width / 2) - 100, this.game.height / 2],
            [(this.game.width / 2) + 100, this.game.height / 2],
        ];
    } else if (global.state.players === 4) {
        positions = [
            [(this.game.width / 2) - 75, this.game.height / 2],
            [(this.game.width / 2) - 25, this.game.height / 2],
            [(this.game.width / 2) + 25, this.game.height / 2],
            [(this.game.width / 2) + 75, this.game.height / 2],
        ];
    } else {
        throw new Error('Invalid number of players: ' + global.state.players);
    }

    this.colorKeys = Object.keys(colors);
    var playerSprites = [];
    for (var p = 0; p < positions.length; p += 1) {
        playerSprites.push(
            this.game.add.sprite(positions[p][0], positions[p][1], 'player' + (p + 1))
        );
        playerSprites[p].tint = colors[this.colorKeys[p]].hex;
    }
    this.playerSprites = playerSprites;
    this.colorCursors = [0, 1, 2, 3];
    this.selectedColors = [null, null, null, null];
};

SelectColorState.prototype.changeColor = function(player, direction)
{
    if (! this.playerSprites[player - 1]) {
        return;
    }

    var colorIndex;
    if (direction === 'LEFT') {
        colorIndex = (
            this.colorCursors[player] === 0,
            this.colorKeys.length - 1,
            this.colorCursors[player] - 1
        );
    } else {
        colorIndex = (
            this.colorCursors[player] === this.colorKeys.length - 1,
            0,
            this.colorCursors[player] + 1
        );
    }

    // If color selected by another player, select the next available color
    if (this.selectedColors.indexOf(this.colorCursors[player]) !== -1) {
        colorIndex = this.getNextAvailableColorIndex(colorIndex, direction);
    }

    this.playerSprites[player - 1].tint = colors[this.colorKeys[colorIndex]].hex;
    this.colorCursors[player - 1] = colorIndex;
};

SelectColorState.prototype.getNextAvailableColorIndex = function(index, direction)
{
    var filteredSelectedColors = this.selectedColors.filter(function (colorIndex) {
        return colorIndex !== null;
    });

    var multiplier = (direction === 'LEFT' ? -1 : 1);

    var nextAvailable;
    var candidate;

    do {
        candidate = candidate + (1 * multiplier);
        if (this.selectedColors.indexOf(candidate) === -1) {
            nextAvailable = candidate;
        }
    } while (typeof nextAvailable === 'undefined');

    return nextAvailable;
};

SelectColorState.prototype.selectColor = function()
{

};

SelectColorState.prototype.initInputs = function()
{
    this.controls = new Controls(this.game);
    for (var player = 1; player < 5; player += 1) {
        this.controls.onDown(player, 'LEFT', this.changeColor.bind(this, player, 'LEFT'));
        this.controls.onDown(player, 'RIGHT', this.changeColor.bind(this, player, 'RIGHT'));
        this.controls.onDown(player, 'SELECT', this.selectColor.bind(this, player));
    }
};

module.exports = SelectColorState;
