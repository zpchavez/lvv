import AbstractProjectile from './abstract-powerup';

class CannonBall extends AbstractProjectile
{
    applyPowerup(car) {
        car.armWithCannon();
    }
}

export default CannonBall;
