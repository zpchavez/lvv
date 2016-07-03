'use strict';

var Phaser = require('phaser');
var RaceState = require('./race-state');
var DesertGenerator = require('../track-generator/desert/desert-generator');
var global = require('../../global-state');

var LoadingNextRaceState = function()
{
    Phaser.State.apply(this, arguments);
};

LoadingNextRaceState.prototype = Object.create(Phaser.State.prototype);

LoadingNextRaceState.prototype.create = function()
{
    this.renderNextRaceInfo();

    setTimeout(this.loadTrack.bind(this));
};

LoadingNextRaceState.prototype.renderNextRaceInfo = function()
{
    var textString = 'Next Up: Badly Drawn Cars in the Desert';

    this.titleText = this.game.add.text(
        this.game.width / 2,
        (this.game.height / 2) - 100,
        textString,
        {
            font: '42px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
        }
    );
    this.titleText.anchor.setTo(0.5, 0.5);

    this.loadingText = this.game.add.text(
        this.game.width / 2,
        this.game.height / 2,
        'Loading...',
        {
            font: '42px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
        }
    )
    this.loadingText.anchor.set(0.5, 0.5);
};

LoadingNextRaceState.prototype.loadTrack = function(type)
{
    var desertGenerator = new DesertGenerator();
    var trackData = desertGenerator.generate();
    this.game.state.add(
        'race',
        new RaceState(trackData, {
            players: global.state.players,
            teams: global.state.teams
        }),
        true
    );
};

module.exports = LoadingNextRaceState;
