'use strict';

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

    this.phaserLoader.json('track-data', trackUrl);
    this.phaserLoader.onLoadComplete.addOnce(function () {
        var data = trackLoader.phaserLoader.game.cache.getJSON('track-data');

        // Filter out unsupported image collection tilesets and set imagePath
        var tilesets = [];
        data.tilesets.forEach(function (tileset) {
            if (tileset.image) {
                tileset.imagePath = 'assets/tilemaps/' + tileset.image.replace(/[.\/]*/, '', 'g');
                tilesets.push(tileset);
            }
        });
        data.tilesets = tilesets;

        callback(data);
    });

    this.phaserLoader.start();
};

module.exports = TrackLoader;