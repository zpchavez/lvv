'use strict';

var Phaser = require('phaser');
var Car = require('../car');
var _ = require('underscore');

var AbstractWeapon = function(state, x, y, key)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key]);
    this.state = state;
    this.createPhysicsBody(state);
};

AbstractWeapon.prototype = Object.create(Phaser.Sprite.prototype);

AbstractWeapon.prototype.loadAssets = function(state, key)
{
    state.load.image(key, this.getSpritePath(key));
};

AbstractWeapon.prototype.getSpritePath = function(key)
{
    return 'assets/img/weapons/' + key + '.png';
};

AbstractWeapon.prototype.createPhysicsBody = function(state)
{
    state.game.physics.p2.enable(this);

    this.body.kinematic = true;

    _.each(this.body.data.shapes, function(shape) {
        shape.sensor = true;
    });

    this.body.onBeginContact.add(function (contactingBody) {
        if (Car.prototype.isPrototypeOf(contactingBody.sprite) &&
            contactingBody.sprite.playerNumber !== this.shotBy
        ) {
            this.hit(contactingBody.sprite);
            this.destroy();
        }
    }, this);
};

AbstractWeapon.prototype.add = function(state)
{
    state.add.existing(this);
};

AbstractWeapon.prototype.addToCollisionGroup = function(collisionGroup)
{
    this.body.setCollisionGroup(collisionGroup);
    this.body.collides(collisionGroup);
};

AbstractWeapon.prototype.hit = function(car)
{
    throw new Error('You must overwrite hit');
}

AbstractWeapon.prototype.update = function()
{
    if (! this.inCamera) {
        this.destroy();
    }
}

module.exports = AbstractWeapon;
