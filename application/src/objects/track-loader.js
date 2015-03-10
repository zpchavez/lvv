'use strict';

var tmxParser = require('tmx-parser');
var trackList = require('../../assets/tilemaps/maps/list');

/**
 * @param {Phaser.Loader} loader
 */
var TrackLoader = function(loader)
{
    this.phaserLoader = loader;
};

// Load track data by theme and track name and pass track data object to callback
TrackLoader.prototype.load = function(theme, name, callback)
{
    var trackUrl, trackLoader = this;

    trackUrl = trackList[theme][name];

    this.phaserLoader.text('track-data', trackUrl);
    this.phaserLoader.onLoadComplete.addOnce(function () {
        var tmxData = trackLoader.phaserLoader.game.cache.getText('track-data');

        tmxParser.parse(tmxData, null, function(err, map) {
            var fixedMapData = trackLoader.fixParsedMap(map);

            callback(fixedMapData);
        });
    });

    this.phaserLoader.start();
};

// The object created by tmx-parser is not quite valid, so it needs to be fixed
TrackLoader.prototype.fixParsedMap = function(map)
{
    map.tilesets   = map.tileSets;
    delete map.tileSets;

    map.tileheight = map.tileHeight;
    map.tilewidth  = map.tileWidth;

    map.tilesets = map.tilesets.map(function (tileset) {
        tileset.tileheight  = tileset.tileHeight;
        delete tileset.tileHeight;

        tileset.tilewidth   = tileset.tileWidth;
        delete tileset.tileWidth;

        tileset.imagewidth  = tileset.image.width;
        tileset.imageheight = tileset.image.height;
        tileset.imagePath   = 'assets/tilemaps/' + tileset.image.source.replace(/[.\/]*/, '', 'g');
        return tileset;
    });

    map.layers = map.layers.map(function (layer) {
        var newLayer = {
            data    : [],
            objects : layer.objects || [],
            height  : map.height,
            width   : map.width,
            opacity : layer.opacity,
            type    : layer.type + 'layer',
            name    : layer.name,
            x       : 0,
            y       : 0
        };

        if (layer.tiles) {
            newLayer.data = layer.tiles.map(function (tile) {
                return tile.id;
            });
        }
        return newLayer;
    });

    return map;
};

module.exports = TrackLoader;