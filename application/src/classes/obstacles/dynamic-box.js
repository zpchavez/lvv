import AbstractDynamicObstacle from './abstract-dynamic-obstacle';

class DynamicBox extends AbstractDynamicObstacle
{
    getSpritePath() {
        return 'assets/img/obstacles/gray-box.png';
    }

    getConstants() {
        return {
            ANGULAR_DAMPING     : 0.97,
            MASS                : 1,
            FRICTION_MULTIPLIER : 0.2
        };
    }
}

export default DynamicBox;
