/* globals window */
'use strict';

var Phaser     = require('phaser');
var React      = require('react');
var EditorMenu = require('../components/editor');
var _          = require('underscore');

var TrackEditorState = function()
{
    Phaser.State.apply(this, arguments);

    this.showInstructionsOffCanvas();
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

TrackEditorState.prototype.save = function()
{
    var layers = [], tilesets, fileData, dataUri;

    _(this.map.layers).each(function (layer) {
        var layerData = {
            name    : layer.name,
            height  : layer.height,
            width   : layer.width,
            opacity : layer.alpha,
            type    : 'tilelayer',
            visible : layer.visible,
            x       : layer.x,
            y       : layer.y,
            data    : []
        };
        _(layer.data).each(function (datum) {
            _(datum).each(function (line) {
                layerData.data.push(line.index);
            });
        });

        layers.push(layerData);
    });

    tilesets = [];
    _(this.map.tilesets).each(function (tileset) {
        tilesets.push({
            firstgid    : tileset.firstgid,
            imagewidth  : tileset.image.width,
            imageheight : tileset.image.height,
            margin      : tileset.tileMargin,
            name        : tileset.name,
            properties  : tileset.properties,
            spacing     : tileset.tileSpacing,
            tileheight  : tileset.tileHeight,
            tilewidth   : tileset.tileWidth
        });
    });

    fileData = {
        height      : this.map.height,
        width       : this.map.width,
        orientation : this.map.orientation,
        properties  : this.map.properties,
        tileheight  : this.map.tileHeight,
        tilewidth   : this.map.tileWidth,
        version     : this.map.version,
        layers      : layers,
        tilesets    : tilesets
    };

    dataUri = 'data:application/json;base64,' + window.btoa(JSON.stringify(fileData));

    this.showInstructionsOffCanvas({downloadUri : dataUri});
};

TrackEditorState.prototype.showInstructionsOffCanvas = function(props)
{
    props = props || {};

    props.saveButtonCallback = _(this.save).bind(this);

    React.render(
        React.createElement(EditorMenu, props),
        window.document.getElementById('content')
    );
};

module.exports = TrackEditorState;
