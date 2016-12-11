import AbstractStaticObstacle from './abstract-static-obstacle';

class MarkerRed extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/marker-red.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'marker');

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default MarkerRed;
