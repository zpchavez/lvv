import AbstractDynamicObstacle from './abstract-dynamic-obstacle';

class ClownNose extends AbstractDynamicObstacle
{
    getSpritePath() {
        return 'assets/img/obstacles/red-circle.png';
    }

    getConstants() {
        return {
            ANGULAR_DAMPING     : 0.97,
            MASS                : 150,
            FRICTION_MULTIPLIER : 0.01
        };
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);
        this.body.setCircle(150);
    }
}

export default ClownNose;
