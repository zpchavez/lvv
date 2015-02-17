'use strict';

var AbstractMarker = require('./abstract-marker');

var TrackMarker = function(state, x, y, key, angle, length)
{
    AbstractMarker.apply(this, arguments);

    this.activated = false;
};

TrackMarker.prototype = Object.create(AbstractMarker.prototype);

TrackMarker.prototype.activate = function()
{
    this.loadTexture('track-marker-on');
    this.activated = true;
};

TrackMarker.prototype.deactivate = function()
{
    this.loadTexture('track-marker-off');
    this.activated = false;
};

module.exports = TrackMarker;
