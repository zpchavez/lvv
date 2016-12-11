import AbstractPowerup from './abstract-powerup';

class CannonPowerup extends AbstractPowerup
{
    applyPowerup(car) {
        car.armWithCannon();
    }
}

export default CannonPowerup;
