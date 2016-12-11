import AbstractStaticObstacle from './abstract-static-obstacle';

class Binder extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/binder.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'binder');

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default Binder;
