class AbstractState extends Phaser.State
{
    create()
    {
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.input.onDown.add(this.toggleFullscreen, this);
    }

    toggleFullscreen(event)
    {
        if (event.button === Phaser.Mouse.LEFT_BUTTON) {
            if (this.game.scale.isFullScreen) {
                this.game.scale.stopFullScreen();
            } else {
                this.game.scale.startFullScreen(false);
            }
        }
    }

    shutdown()
    {
        if (this.controls) {
            this.controls.reset();
        }
    }
}

export default AbstractState;
