'use strict';

var _         = require('underscore');
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

        var objectClasses    = {};
        var objectPlacements = [];

        data.tilesets.forEach(function (tileset) {
            if (tileset.image) {
                tileset.imagePath = 'assets/tilemaps/' + tileset.image.replace(/[.\/]*/, '', 'g');
                tilesets.push(tileset);
            } else if (tileset.tileproperties) {
                _.each(tileset.tileproperties, function(tile, index) {
                    objectClasses[parseInt(tileset.firstgid, 10) + parseInt(index, 10)] = tile;
                });
            }
        });
        data.tilesets = tilesets;

        console.log('object classes:');
        console.log(objectClasses);

        console.log('data:');
        console.log(data);

        // todo: step through all of data.layers and go through all of layer.objects
        // If object.gid matches something in objectClasses, then set object.type
        // to objectClass.type, and adjust object.x and object.y using the image dimensions
        // (objectClass.imageHeight and objectClass.imageWidth) and object.rotation

        callback(data);
    });

    this.phaserLoader.start();
};

module.exports = TrackLoader;
