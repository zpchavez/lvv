'use strict';

var Phaser           = require('phaser');
var RaceState        = require('./classes/states/race-state');
var DesertGenerator  = require('./classes/track-generator/desert/desert-generator');
var TrackLoader      = require('./classes/track-loader');
var MainMenuState    = require('./classes/states/menus/main-menu-state');
var settings         = require('./settings');

var game = new Phaser.Game(
    960,
    540,
    Phaser.AUTO,
    'phaser-template',
    null
);

var loadTrack = function() {
    // If loader not yet initialized, try again in a bit
    if (! game.load) {
        setTimeout(
            loadTrack,
            100
        );
        return;
    }
    var trackLoader = new TrackLoader(game.load);

    trackLoader.load(settings.theme, settings.track, function(data) {
        game.state.add(
            'race',
            new RaceState(data),
            true
        );
    });
}

if (settings.state === 'random') {
    var desertGenerator = new DesertGenerator();
    game.state.add(
        'race',
        new RaceState(desertGenerator.generate()),
        true
    );
} else if (settings.state === 'track') {
    loadTrack();
} else {
    game.state.add('main-menu', new MainMenuState, true);
}
