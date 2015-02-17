'use strict';

var TrackMarkerFactory = require('./track-marker-factory');
var _                  = require('underscore');

var Track = function(state)
{
    this.state              = state;
    this.markers            = [];
    this.finish             = null;
    this.trackMarkerFactory = new TrackMarkerFactory(state);
};

Track.prototype.loadAssets = function()
{
    this.trackMarkerFactory.loadAssets();
};

/**
 * Load track data from an object containing marker and finish line details
 *
 * @param  {Object} data
 * @return {Track}  this
 */
Track.prototype.loadFromObject = function(data)
{
    var track = this;

    _.each(data.markers, function(datum) {
        var marker = track.trackMarkerFactory.createMarker(datum[0], datum[1], datum[2], datum[3]);
        track.markers.push(marker);
        track.state.game.world.addChild(marker);
    });

    this.finish = this.trackMarkerFactory.createFinishLine(
        data.finishLine[0],
        data.finishLine[1],
        data.finishLine[2],
        data.finishLine[3]
    );
    this.state.game.world.addChild(this.finish);

    this.lastActivatedMarker = -1; // -1 means the finish line

    return this;
};

Track.prototype.setLapCompletedCallback = function(callback, context)
{
    this.lapCompletedCallback = _.bind(callback, context);
};

Track.prototype.setMarkerSkippedCallback = function(callback, context)
{
    this.markerSkippedCallback = _.bind(callback, context);
};

Track.prototype.deactivateMarkers = function()
{
    for (var i = 0; i < this.markers.length; i += 1) {
        this.markers[i].deactivate();
    }
};

Track.prototype.enforce = function(car)
{
    var track = this;

    if (track.finish.overlap(car)) {
        if (track.lastActivatedMarker === track.markers.length - 1) {
            track.lapCompletedCallback();
            track.deactivateMarkers();
            track.lastActivatedMarker = -1;
        } else if (track.lastActivatedMarker === -1) {
            return;
        }
    }

    _.each(track.markers, function(marker, index) {
        if (marker.overlap(car)) {
            if (marker.activated) {
                return;
            }

            if ((index - track.lastActivatedMarker - 1) === 0) { // no markers skipped
                marker.activate();
                track.lastActivatedMarker = index;
            } else {
                track.markerSkippedCallback();
            }
        }
    });
};

module.exports = Track;
