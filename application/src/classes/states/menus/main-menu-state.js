'use strict';

var Phaser = require('phaser');

var CarDrivingState          = require('../examples/car-driving-state');
var TrackMarkerState         = require('../examples/track-marker-state');
var BathroomObstacleSetState = require('../examples/bathroom-obstacle-set-state');
var RaceState                = require('../race-state');
var TrackLoader              = require('../../track-loader');
var settings                 = require('../../../settings');

var MainMenuState = function()
{
    Phaser.State.apply(this, arguments);
};

MainMenuState.prototype = Object.create(Phaser.State.prototype);

MainMenuState.prototype.preload = function()
{
    this.load.image('button-driving-example', 'assets/img/car-driving-example-button.png');
    this.load.image('button-track-marker-example', 'assets/img/track-marker-example-button.png');
    this.load.image('button-bathroom-obstacle-set', 'assets/img/bathroom-obstacle-set-button.png');
    this.load.image('button-track-loader', 'assets/img/track-loader-button.png');
};

MainMenuState.prototype.create = function()
{
    this.add.button(120, 10, 'button-driving-example', this.onDrivingExampleClick.bind(this));

    this.add.button(230, 10, 'button-track-marker-example', this.onTrackMarkerExampleClick.bind(this));

    this.add.button(400, 10, 'button-track-loader', this.onTrackLoaderClick.bind(this));

    this.add.button(10, 120, 'button-bathroom-obstacle-set', this.onBathroomObstacleSetClick.bind(this));

    if (settings.profiler) {
        this.game.add.plugin(Phaser.Plugin.Debug);
    }

    if (settings.state === 'track') {
        this.onTrackLoaderClick();
    }
};

MainMenuState.prototype.onDrivingExampleClick = function()
{
    this.game.state.add('car-driving-example', new CarDrivingState(), true);
};

MainMenuState.prototype.onTrackMarkerExampleClick = function()
{
    this.game.state.add('simple-track-example', new TrackMarkerState(), true);
};

MainMenuState.prototype.onBathroomObstacleSetClick = function()
{
    this.game.state.add('bathroom-obstacle-set-example', new BathroomObstacleSetState(), true);
};

MainMenuState.prototype.onTrackLoaderClick = function()
{
    var trackLoader, stateManager = this.game.state;
    var mainMenu = this;
    trackLoader = new TrackLoader(this.game.load);

    trackLoader.load(settings.theme, settings.track, function(data) {
        stateManager.add(
            'race',
            new RaceState(data),
            true
        );
        mainMenu.shutdown();
    });
};

module.exports = MainMenuState;
