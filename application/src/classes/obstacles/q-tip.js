import AbstractTrackDelineator from './abstract-track-delineator';

class QTip extends AbstractTrackDelineator
{
    constructor(state, x, y, key, angle) {
        super(...arguments);

        this.contactingEntities = {};
    }

    getSpritePath() {
        return ('assets/img/obstacles/q-tip.png');
    }

    getPolygonName() {
      return 'qTip';
    }
}

export default QTip;
