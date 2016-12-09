import TrackMarker from './track-marker';
import FinishMarker from './finish-marker';

class TrackMarkerFactory
{
    constructor(state) {
        this.state = state;
        this.debug = false;
    }

    enableDebug() {
        this.debug = true;
    }

    disableDebug() {
        this.debug = false;
    }

    loadAssets() {
        this.state.load.image('track-marker-off', 'assets/img/track-marker-off.png');
        this.state.load.image('track-marker-on', 'assets/img/track-marker-on.png');
        this.state.load.image('finish-line', 'assets/img/finish-line.png');
    }

    createMarker(x, y, angle, length) {
        var sprite = new TrackMarker(
            this.state,
            x,
            y,
            'track-marker-off',
            angle,
            length
        );

        sprite.renderable = this.debug;

        return sprite;
    }

    createFinishLine(x, y, angle, length) {
        var sprite = new FinishMarker(
            this.state,
            x,
            y,
            'finish-line',
            angle,
            length
        );

        sprite.renderable = this.debug;

        return sprite;
    }
}

export default TrackMarkerFactory;
