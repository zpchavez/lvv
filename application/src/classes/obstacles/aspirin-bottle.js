import AbstractStaticObstacle from './abstract-static-obstacle';

class AspirinBottle extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/aspirin-bottle.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'aspirinBottle');

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default AspirinBottle;
