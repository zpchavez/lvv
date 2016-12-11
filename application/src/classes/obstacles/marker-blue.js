import AbstractStaticObstacle from './abstract-static-obstacle';

class MarkerBlue extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/marker-blue.png');
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

export default MarkerBlue;
