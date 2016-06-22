'use strict';

var Phaser = require('phaser');

var settings                 = require('../../../settings');

var MainMenuState = function()
{
    Phaser.State.apply(this, arguments);
};

MainMenuState.prototype = Object.create(Phaser.State.prototype);

MainMenuState.prototype.preload = function()
{
    this.game.input.onDown.add(this.toggleFullscreen, this);
}

MainMenuState.prototype.create = function()
{
    this.renderTitle();

    if (settings.profiler) {
        this.game.add.plugin(Phaser.Plugin.Debug);
    }
};

MainMenuState.prototype.renderTitle = function()
{
    this.titleText = this.game.add.text(
        this.game.width / 2,
        (this.game.height / 2) - 100,
        "L'il Vroom Vrooms!",
        {
            font: '42px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
        }
    );
    this.titleText.anchor.setTo(0.5, 0.5);
};

MainMenuState.prototype.toggleFullscreen = function()
{
    if (this.game.scale.isFullScreen) {
        this.game.scale.stopFullScreen();
    } else {
        this.game.scale.startFullScreen(false);
    }
};

module.exports = MainMenuState;
