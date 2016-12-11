import AbstractWeapon from './abstract-weapon';

class CannonBall extends AbstractWeapon
{
    hit(car) {
        car.spinOut();
    }
}

export default CannonBall;
