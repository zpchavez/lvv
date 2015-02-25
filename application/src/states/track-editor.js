'use strict';

var Phaser = require('phaser');

var TrackEditorState = function()
{
    Phaser.State.apply(this, arguments);
};

TrackEditorState.prototype = Object.create(Phaser.State.prototype);

TrackEditorState.prototype.preload = function()
{
    this.load.tilemap('desert', 'assets/tilemaps/maps/desert.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('tiles', 'assets/tilemaps/tiles/tmw_desert_spacing.png');
};

TrackEditorState.prototype.create = function()
{
    this.map = this.game.add.tilemap('desert');

    this.map.addTilesetImage('Desert', 'tiles');

    this.currentTile = this.map.getTile(2, 3);

    this.layer = this.map.createLayer('Ground');

    this.layer.resizeWorld();
    this.marker = this.game.add.graphics();
    this.marker.lineStyle(2, 0x000000, 1);
    this.marker.drawRect(0, 0, 32, 32);

    this.cursors = {
        w : this.game.input.keyboard.addKey(Phaser.Keyboard.W),
        a : this.game.input.keyboard.addKey(Phaser.Keyboard.A),
        s : this.game.input.keyboard.addKey(Phaser.Keyboard.S),
        d : this.game.input.keyboard.addKey(Phaser.Keyboard.D)
    };
};

TrackEditorState.prototype.update = function()
{
    this.marker.x = this.layer.getTileX(this.game.input.activePointer.worldX) * 32;
    this.marker.y = this.layer.getTileY(this.game.input.activePointer.worldY) * 32;

    if (this.game.input.mousePointer.isDown)
    {
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.SHIFT))
        {
            this.currentTile = this.map.getTile(this.layer.getTileX(this.marker.x), this.layer.getTileY(this.marker.y));
        }
        else
        {
            if (this.map.getTile(this.layer.getTileX(this.marker.x), this.layer.getTileY(this.marker.y)) !== this.currentTile)
            {
                this.map.putTile(this.currentTile, this.layer.getTileX(this.marker.x), this.layer.getTileY(this.marker.y));
            }
        }
    }

    if (this.cursors.a.isDown)
    {
        this.game.camera.x -= 4;
    }
    else if (this.cursors.d.isDown)
    {
        this.game.camera.x += 4;
    }

    if (this.cursors.w.isDown)
    {
        this.game.camera.y -= 4;
    }
    else if (this.cursors.s.isDown)
    {
        this.game.camera.y += 4;
    }
};

module.exports = TrackEditorState;
