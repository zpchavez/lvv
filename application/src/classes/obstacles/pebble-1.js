import AbstractTrackDelineator from './abstract-track-delineator';

class Pebble1 extends AbstractTrackDelineator
{
  getSpritePath() {
    return 'assets/img/obstacles/pebble-1.png';
  }

  getPolygonName() {
    return 'pebble-1';
  }
}

export default Pebble1;
