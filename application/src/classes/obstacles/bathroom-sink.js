'use strict';

var _      = require('underscore');
var Phaser = require('phaser');
var util   = require('../../util');
var Car    = require('../car');

var fixturesKey = 'BathroomSinkFixtures';

var BathroomSink = function(state, x, y, key, angle)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.fixturesSprite = new Phaser.Sprite(state.game, x, y, fixturesKey);

    this.createPhysicsBody(state, angle);

    this.body.dynamic = false;
    this.fixturesSprite.body.dynamic = false;
};

BathroomSink.prototype = Object.create(Phaser.Sprite.prototype);

BathroomSink.prototype.loadAssets = function(state, key)
{
    state.load.image(key, 'assets/img/sink-bowl.png');
    state.load.image(fixturesKey, 'assets/img/sink-fixtures.png');
};

BathroomSink.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'sinkBowl');

    _.each(this.body.data.shapes, function(shape) {
        shape.sensor = true;
    });

    this.body.onBeginContact.add(function (contactingBody) {
        if (Car.prototype.isPrototypeOf(contactingBody.sprite) &&
            ! (car.falling || car.airborne)) {
            contactingBody.sprite.fall(
                {
                    x : this.x,
                    y : this.y
                },
                true
            );
        }
    }, this);

    if (angle) {
        this.body.angle = angle;
    }

    state.game.physics.p2.enable(this.fixturesSprite);

    this.fixturesSprite.body.clearShapes();

    this.fixturesSprite.body.addCircle(117, -477, -722);
    this.fixturesSprite.body.addCircle(117, 491, -722);
    this.fixturesSprite.body.addCircle(163, 0, -715);

    if (angle) {
        this.fixturesSprite.body.angle = angle;
    }
};

BathroomSink.prototype.add = function(state)
{
    state.add.existing(this);
    state.add.existing(this.fixturesSprite);
};

BathroomSink.prototype.addToCollisionGroup = function(collisionGroup)
{
    this.body.setCollisionGroup(collisionGroup);
    this.body.collides(collisionGroup);

    this.fixturesSprite.body.setCollisionGroup(collisionGroup);
    this.fixturesSprite.body.collides(collisionGroup);
};

BathroomSink.prototype.postGameObjectPlacement = function()
{
    this.fixturesSprite.bringToTop();
}

module.exports = BathroomSink;
