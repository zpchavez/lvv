'use strict';

var AbstractWeapon = require('./abstract-weapon');

var CannonBall = function(state, x, y, key)
{
    AbstractWeapon.apply(this, arguments);
};

CannonBall.prototype = Object.create(AbstractWeapon.prototype);

CannonBall.prototype.hit = function(car)
{
    car.spinOut();
}

module.exports = CannonBall;
