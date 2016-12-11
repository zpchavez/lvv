import AbstractStaticObstacle from './abstract-static-obstacle';

class Razor extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/razor.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'razor');

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default Razor;
