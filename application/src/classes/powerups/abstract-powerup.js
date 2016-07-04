'use strict';

var Phaser = require('phaser');
var Car = require('../car');
var _ = require('underscore');

var AbstractPowerup = function(state, x, y, key)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.createPhysicsBody(state);
};

AbstractPowerup.prototype = Object.create(Phaser.Sprite.prototype);

AbstractPowerup.prototype.loadAssets = function(state, key)
{
    state.load.image(key, this.getSpritePath(key));
};

AbstractPowerup.prototype.getSpritePath = function(key)
{
    return 'assets/img/powerups/' + key + '.png';
};

AbstractPowerup.prototype.createPhysicsBody = function(state)
{
    state.game.physics.p2.enable(this);

    this.body.dynamic = false;

    _.each(this.body.data.shapes, function(shape) {
        shape.sensor = true;
    });

    this.body.onBeginContact.add(function (contactingBody) {
        if (Car.prototype.isPrototypeOf(contactingBody.sprite)) {
            this.applyPowerup(contactingBody.sprite);
            this.destroy();
        }
    }, this);
};

AbstractPowerup.prototype.add = function(state)
{
    state.add.existing(this);
};

AbstractPowerup.prototype.addToCollisionGroup = function(collisionGroup)
{
    this.body.setCollisionGroup(collisionGroup);
    this.body.collides(collisionGroup);
};

AbstractPowerup.prototype.applyPowerup = function(car)
{
    throw new Error('You must overwrite applyPowerUp');
}

module.exports = AbstractPowerup;
