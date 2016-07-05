'use strict';

var AbstractWeapon = require('./abstract-weapon');

var CannonBall = function(state, x, y, key)
{
    AbstractWeapon.apply(this, arguments);
};

CannonBall.prototype = Object.create(AbstractWeapon.prototype);

CannonBall.prototype.hit = function(car)
{
    // Set alpha to 0 because setting visible to false eliminates the player
    // and we want to give them a chance to respawn and catch-up
    car.alpha = 0;
    car.disabled = true;
    car.body.clearCollision();
    setTimeout(
        function() {
            car.alpha = 1;
            car.disabled = false;
            car.addToCollisionGroup(this.state.collisionGroup);
            this.state.moveCarToLastActivatedMarker(car);
        }.bind(this),
        500
    );
}

module.exports = CannonBall;
