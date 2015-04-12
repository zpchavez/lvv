'use strict';

var _      = require('underscore');
var Phaser = require('phaser');
var util   = require('../../util');

var fixturesKey = 'BathroomSinkFixtures';

var BathroomSink = function(state, x, y, key, angle)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.createPhysicsBody(state, angle);

    // The anchor for a sprite without physics is the top-left corner, whereas the anchor
    // for a sprite with physics is in the center, so use this translation vector for the
    // fixtures overlay sprite
    var translationVector = [-this.width / 2, -this.height / 2];
    translationVector = util.rotateVector(angle * Math.PI / 180, translationVector);

    this.fixturesSprite = new Phaser.Sprite(state.game, x + translationVector[0], y + translationVector[1], fixturesKey);
    if (angle) {
        this.fixturesSprite.angle = angle;
    }

    this.body.dynamic = false;
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

    this.body.addCircle(117, -477, -722);
    this.body.addCircle(117, 491, -722);
    this.body.addCircle(163, 0, -715);

    if (angle) {
        this.body.angle = angle;
    }
};

BathroomSink.prototype.add = function(state)
{
    state.add.existing(this);
    state.add.existing(this.fixturesSprite);
};

BathroomSink.prototype.postGameObjectPlacement = function()
{
    this.fixturesSprite.bringToTop();
}

module.exports = BathroomSink;
