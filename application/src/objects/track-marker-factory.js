'use strict';

var TrackMarker  = require('./track-marker');
var FinishMarker = require('./finish-marker');

var TrackMarkerFactory = function(state)
{
    this.state = state;
};

TrackMarkerFactory.prototype.loadAssets = function()
{
    this.state.load.image('track-marker-off', 'assets/img/track-marker-off.png');
    this.state.load.image('track-marker-on', 'assets/img/track-marker-on.png');
    this.state.load.image('finish-line', 'assets/img/finish-line.png');
};

TrackMarkerFactory.prototype.createMarker = function(x, y, angle)
{
    var sprite = new TrackMarker(
        this.state,
        x,
        y,
        'track-marker-off',
        angle
    );

    return sprite;
};

TrackMarkerFactory.prototype.createFinishLine = function(x, y, angle)
{
    var sprite = new FinishMarker(
        this.state,
        x,
        y,
        'finish-line',
        angle
    );

    return sprite;
};

module.exports = TrackMarkerFactory;