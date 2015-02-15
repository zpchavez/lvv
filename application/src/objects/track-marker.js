'use strict';

var Phaser = require('phaser');
var _      = require('underscore');

var TrackMarker = function(state, x, y, key, angle, isFinishLine)
{
    var validAngles;

    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.state = state;

    // This will make the added width add to both sides of the sprite
    // equally. Without it, the x and y passed in will specify the position
    // of the very left edge of the marker
    this.anchor.setTo(0.5, 0.5);

    this.height    = 32;
    this.width     = 1000;
    this.activated = false;

    validAngles = [0, 90];
    if (! _(validAngles).contains(angle)) {
        throw new Error('Invalid marker angle. Must be one of: ' + validAngles.join(', '));
    }

    this.isFinishLine = isFinishLine;

    this.angle = angle;
};

TrackMarker.prototype = Object.create(Phaser.Sprite.prototype);

TrackMarker.prototype.activate = function()
{
    if (this.isFinishLine) {
        throw new Error('cannot activate finish line');
    }

    this.loadTexture('track-marker-on');
    this.activated = true;
};

TrackMarker.prototype.deactivate = function()
{
    if (this.isFinishLine) {
        throw new Error('cannot deactivate finish line');
    }

    this.loadTexture('track-marker-off');
    this.activated = false;
};

module.exports = TrackMarker;
