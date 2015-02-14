'use strict';

var TrackMarker = require('./track-marker');

var TrackMarkerFactory = function(state)
{
    this.state = state;

    this.counter = 0;
};

TrackMarkerFactory.prototype.loadAssets = function()
{
    this.state.load.image('track-marker-off', 'assets/img/track-marker-off.png');
    this.state.load.image('track-marker-on', 'assets/img/track-marker-on.png');
};

TrackMarkerFactory.prototype.spritePrototype = TrackMarker;

TrackMarkerFactory.prototype.getNew = function(x, y, angle)
{
    this.counter += 1;

    var sprite = new this.spritePrototype(
        this.state,
        x,
        y,
        'track-marker-off',
        this.counter,
        angle
    );

    return sprite;
};

module.exports = TrackMarkerFactory;