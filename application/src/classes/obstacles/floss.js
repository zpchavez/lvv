import AbstractStaticObstacle from './abstract-static-obstacle';

class Floss extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/floss.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'floss');

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default Floss;
