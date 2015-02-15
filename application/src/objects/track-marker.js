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
    if (this.isFinishLine) {
        throw new Error('cannot activate finish line');
    }

    this.loadTexture('track-marker-on');
    this.activated = true;
};

TrackMarker.prototype.deactivate = function()
{
    if (this.isFinishLine) {
        throw new Error('cannot deactivate finish line');
    }

    this.loadTexture('track-marker-off');
    this.activated = false;
};

module.exports = TrackMarker;
