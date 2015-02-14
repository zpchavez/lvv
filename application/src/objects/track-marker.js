'use strict';

var Phaser = require('phaser');

var TrackMarker = function(state, x, y, key)
{
    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.state = state;

    // This will make the added width add to both sides of the sprite
    // equally. Without it, the x and y passed in will specify the position
    // of the very left edge of the marker
    this.anchor.setTo(0.5, 0.5);

    this.height = 32;
    this.width  = 1000;

    this.activated = false;
};

TrackMarker.prototype = Object.create(Phaser.Sprite.prototype);

TrackMarker.prototype.activate = function()
{
    this.loadTexture('track-marker-on');
    this.activated = true;
};

module.exports = TrackMarker;
