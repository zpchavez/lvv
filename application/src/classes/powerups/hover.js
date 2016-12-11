import AbstractPowerup from './abstract-powerup';

class HoverPowerup extends AbstractPowerup
{
    applyPowerup(car) {
        car.startHovering();
    }
}

export default HoverPowerup;
