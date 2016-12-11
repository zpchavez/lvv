import AbstractStaticObstacle from './abstract-static-obstacle';

class MarkerBlack extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/marker-black.png');
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

export default MarkerBlack;
