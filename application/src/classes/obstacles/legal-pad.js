import AbstractStaticObstacle from './abstract-static-obstacle';

class LegalPad extends AbstractStaticObstacle
{
    getSpritePath() {
        return ('assets/img/obstacles/legal-pad.jpg');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'legalPad');

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default LegalPad;
