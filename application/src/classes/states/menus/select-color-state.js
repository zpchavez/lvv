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

    var colorKeys = Object.keys(colors);
    var playerSprites = [];
    for (var p = 0; p < positions.length; p += 1) {
        playerSprites.push(
            this.game.add.sprite(positions[p][0], positions[p][1], 'player' + (p + 1))
        );
        playerSprites[p].tint = colors[colorKeys[p]].hex;
    }
};

SelectColorState.prototype.initInputs = function()
{
};

module.exports = SelectColorState;
