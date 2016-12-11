import AbstractStaticObstacle from './abstract-static-obstacle';

class Comb extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/comb.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'comb');

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default Comb;
