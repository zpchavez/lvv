import AbstractStaticObstacle from './abstract-static-obstacle';

class Toothbrush extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/toothbrush.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'toothbrush');

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default Toothbrush;
