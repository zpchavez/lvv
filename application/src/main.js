import DesertGenerator from './classes/track-generator/desert/desert-generator';
import TrackLoader from './classes/track-loader';
import MainMenuState from './classes/states/menus/main-menu-state';
import globalState from './global-state';

var game = new Phaser.Game(
    960,
    540,
    Phaser.AUTO,
    'phaser-template',
    null
);

const loadTrack = function() {
    // If loader not yet initialized, try again in a bit
    if (! game.load) {
        setTimeout(
            loadTrack,
            100
        );
        return;
    }
    const trackLoader = new TrackLoader(game.load);

    trackLoader.load(globalState.get('theme'), globalState.get('track'), function(data) {
        game.state.add(
            'race',
            new RaceState(data),
            true
        );
    });
};

if (globalState.get('state') === 'random') {
    var RaceState = require('./classes/states/race-state');
    var desertGenerator = new DesertGenerator();
    game.state.add(
        'race',
        new RaceState(desertGenerator.generate()),
        true
    );
} else if (globalState.get('state') === 'track') {
    loadTrack();
} else {
    game.state.add('main-menu', new MainMenuState, true);
}
