import AbstractStaticObstacle from './abstract-static-obstacle';

class Sprayer extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/sprayer.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'sprayer');

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default Sprayer;
