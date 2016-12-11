import AbstractDynamicObstacle from './abstract-dynamic-obstacle';

class AspirinPill extends AbstractDynamicObstacle
{
    getSpritePath() {
        return 'assets/img/obstacles/aspirin-pill.png';
    }

    getConstants() {
        return {
            ANGULAR_DAMPING     : 0.8,
            MASS                : 1.0,
            FRICTION_MULTIPLIER : 0.2
        };
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);
        this.body.setCircle(17);

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default AspirinPill;
