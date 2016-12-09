import TrackMarkerFactory from './track-marker-factory';

class Track
{
    constructor(state) {
        this.state              = state;
        this.markers            = [];
        this.finish             = null;
        this.trackMarkerFactory = new TrackMarkerFactory(state);
        this.debug              = false;
    }

    setDebug(value) {
        if (value) {
            this.enableDebug();
        } else {
            this.disableDebug();
        }
    }

    enableDebug() {
        this.debug = true;

        this.trackMarkerFactory.enableDebug();

        this.markers.forEach(marker => {
            marker.renderable = true;
        });

        if (this.finish) {
            this.finish.renderable = true;
        }
    }

    disableDebug() {
        this.debug = false;

        this.trackMarkerFactory.disableDebug();

        this.markers.forEach(marker => {
            marker.renderable = false;
        });

        if (this.finish) {
            this.finish.renderable = false;
        }
    }

    loadAssets() {
        this.trackMarkerFactory.loadAssets();
    }

    /**
     * Load track data from an object containing marker and finish line details
     *
     * @param  {Object} data
     * @return {Track}  this
     */
    loadFromObject(data) {
        const track = this;

        data.markers.forEach(datum => {
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
    }

    setLapCompletedCallback(callback, context) {
        this.lapCompletedCallback = callback.bind(context);
    }

    setMarkerSkippedCallback(callback, context) {
        this.markerSkippedCallback = callback.bind(context);
    }

    deactivateMarkers() {
        for (let i = 0; i < this.markers.length; i += 1) {
            this.markers[i].deactivate();
        }
    };

    enforce(car) {
        const track = this;

        if (track.finish.overlap(car)) {
            if (track.lastActivatedMarker === track.markers.length - 1) {
                track.lapCompletedCallback();
                track.deactivateMarkers();
                track.lastActivatedMarker = -1;
            } else if (track.lastActivatedMarker === -1) {
                return;
            }
        }

        track.markers.forEach((marker, index) => {
            if (marker.overlap(car)) {
                if (marker.activated) {
                    return;
                }

                if ((index - track.lastActivatedMarker - 1) === 0) { // no markers skipped
                    marker.activate();
                    track.lastActivatedMarker = index;
                } else {
                    track.markerSkippedCallback(car);
                }
            }
        });
    }

    getLastActivatedMarker() {
        if (this.lastActivatedMarker === -1) {
            return this.finish;
        } else {
            return this.markers[this.lastActivatedMarker];
        }
    }

    getNextMarker() {
        if (this.lastActivatedMarker === (this.markers.length - 1)) {
            return this.finish;
        } else {
            return this.markers[this.lastActivatedMarker + 1];
        }
    }
}

export default Track;
