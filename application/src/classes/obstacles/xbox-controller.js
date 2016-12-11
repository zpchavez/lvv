import AbstractStaticObstacle from './abstract-static-obstacle';

class XboxController extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/xbox-controller.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'xboxController');

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default XboxController;
