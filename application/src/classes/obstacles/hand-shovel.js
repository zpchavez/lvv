import AbstractStaticObstacle from './abstract-static-obstacle';

class HandShovel extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/hand-shovel.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'hand-shovel');

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default HandShovel;
