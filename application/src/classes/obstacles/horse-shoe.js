import AbstractStaticObstacle from './abstract-static-obstacle';

class HorseShoe extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/horse-shoe.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'horse-shoe');

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default HorseShoe;
