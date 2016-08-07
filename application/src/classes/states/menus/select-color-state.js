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
    this.game.physics.startSystem(Phaser.Physics.P2JS);

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
            [(this.game.width / 2) - 150, this.game.height / 2],
            [(this.game.width / 2) - 50, this.game.height / 2],
            [(this.game.width / 2) + 50, this.game.height / 2],
            [(this.game.width / 2) + 150, this.game.height / 2],
        ];
    } else {
        throw new Error('Invalid number of players: ' + global.state.players);
    }

    var playerSprites = [];
    for (var p = 0; p < positions.length; p += 1) {
        playerSprites.push(
            this.carFactory.getNew(
                positions[p][0],
                positions[p][1],
                'player' + (p + 1)
            )
        );
        playerSprites[p].tint = colors[p].hex;
        this.game.world.addChild(playerSprites[p]);
    }
    this.playerSprites = playerSprites;
    this.colorCursors = [0, 1, 2, 3];
    this.selectedColors = [null, null, null, null];
};

SelectColorState.prototype.changeColor = function(player, direction)
{
    // Player who isn't playing can't change color
    if (! this.playerSprites[player]) {
        return;
    }

    // Can't change color if player already selected a color
    if (this.selectedColors[player] !== null) {
        return;
    }

    var colorIndex;
    if (direction === 'LEFT') {
        colorIndex = (
            this.colorCursors[player] === 0
            ? colors.length - 1
            : this.colorCursors[player] - 1
        );
    } else {
        colorIndex = (
            this.colorCursors[player] === colors.length - 1
            ? 0
            : this.colorCursors[player] + 1
        );
    }

    // If color selected by another player, select the next available color
    if (this.selectedColors.indexOf(colorIndex) !== -1) {
        colorIndex = this.getNextAvailableColorIndex(colorIndex, direction);
    }

    this.playerSprites[player].tint = colors[colorIndex].hex;
    this.colorCursors[player] = colorIndex;
};

SelectColorState.prototype.getNextAvailableColorIndex = function(index, direction)
{
    var filteredSelectedColors = this.selectedColors.filter(function (colorIndex) {
        return colorIndex !== null;
    });

    var multiplier = (direction === 'LEFT' ? -1 : 1);

    var nextAvailable;
    var candidate = index;

    do {
        candidate = candidate + (1 * multiplier);
        if (this.selectedColors.indexOf(candidate) === -1) {
            nextAvailable = candidate;
        }
    } while (typeof nextAvailable === 'undefined');

    return nextAvailable;
};

SelectColorState.prototype.selectColor = function(player)
{
    // Select if not already selected
    if (this.selectedColors.indexOf(this.colorCursors[player]) === -1) {
        this.selectedColors[player] = this.colorCursors[player];
    }

    var selections = this.selectedColors.filter(function(index) {return index !== null});
    if (this.allSelected()) {
        this.showAllSelectedMessage();
    }
};

SelectColorState.prototype.allSelected = function()
{
    var selections = this.selectedColors.filter(function(index) {return index !== null});
    return (
        selections.length === global.state.players ||
        selections.length === 2 && global.state.teams
    );
};

SelectColorState.prototype.update = function()
{
    // Cars that have selected their color spin around
    this.selectedColors.forEach(function(color, player) {
        if (color !== null) {
            this.playerSprites[player].body.rotateRight(150);
        }
    }.bind(this));
};

SelectColorState.prototype.showAllSelectedMessage = function()
{
    console.log('showing the msg');
    this.allSelectedMessage = this.game.add.text(
        this.game.width / 2,
        (this.game.height / 2) + 200,
        "Press button to start!",
        {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
        }
    );
    this.allSelectedMessage.anchor.setTo(0.5, 0.5);
};

SelectColorState.prototype.initInputs = function()
{
    this.controls = new Controls(this.game);
    for (var player = 0; player < 4; player += 1) {
        this.controls.onDown(player, 'LEFT', this.changeColor.bind(this, player, 'LEFT'));
        this.controls.onDown(player, 'RIGHT', this.changeColor.bind(this, player, 'RIGHT'));
        this.controls.onDown(player, 'SELECT', this.selectColor.bind(this, player));
    }
};

module.exports = SelectColorState;
