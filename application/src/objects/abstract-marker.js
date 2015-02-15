'use strict';

var Phaser = require('phaser');
var _      = require('underscore');

var AbstractMarker = function(state, x, y, key, angle)
{
    var validAngles;

    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.state = state;

    // This will make the added width add to both sides of the sprite
    // equally. Without it, the x and y passed in will specify the position
    // of the very left edge of the marker
    this.anchor.setTo(0.5, 0.5);

    this.height = 32;
    this.width  = 1000;

    validAngles = [0, 90, 180, 270];
    if (! _(validAngles).contains(angle)) {
        throw new Error('Invalid marker angle. Must be one of: ' + validAngles.join(', '));
    }

    this.angle = angle;
};

AbstractMarker.prototype = Object.create(Phaser.Sprite.prototype);

module.exports = AbstractMarker;
