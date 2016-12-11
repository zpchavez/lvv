import AbstractMarker from './abstract-marker';

class TrackMarker extends AbstractMarker
{
    constructor(state, x, y, key, angle, length) {
        super(...arguments);

        AbstractMarker.apply(this, arguments);

        this.activated = false;
    }

    activate() {
        this.loadTexture('track-marker-on');
        this.activated = true;
    }

    deactivate() {
        this.loadTexture('track-marker-off');
        this.activated = false;
    }
}

export default TrackMarker;
