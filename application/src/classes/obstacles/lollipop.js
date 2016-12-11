import AbstractStaticObstacle from './abstract-static-obstacle';

class Lollipop extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/lollipop.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'lollipop');

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default Lollipop;
