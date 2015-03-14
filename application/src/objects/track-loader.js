'use strict';

var _         = require('underscore');
var trackList = require('../../assets/tilemaps/maps/list');
var util      = require('../util');

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

        // Step through all of data.layers and go through all of layer.objects.
        // If object.gid matches something in objectClasses, then set object.type
        // to objectClass.type, and adjust object.x and object.y using the image dimensions
        // (objectClass.imageHeight and objectClass.imageWidth) and object.rotation.
        data.layers.forEach(function (layer) {
            if (layer.objects) {
                layer.objects.forEach(function (tilemapObject) {
                    var translationVector;

                    if (tilemapObject.gid && objectClasses[tilemapObject.gid]) {
                        tilemapObject.type = objectClasses[tilemapObject.gid].type;
                        if (objectClasses[tilemapObject.gid].imageHeight &&
                            objectClasses[tilemapObject.gid].imageWidth) {
                            // The translation vector leads from the bottom-left corner of the object
                            // to the object center
                            translationVector = [
                                parseInt(objectClasses[tilemapObject.gid].imageWidth, 10) / 2,
                                - parseInt(objectClasses[tilemapObject.gid].imageHeight, 10) / 2
                            ];
                            translationVector = util.rotateVector(
                                tilemapObject.rotation * Math.PI / 180,
                                translationVector
                            );
                            tilemapObject.x += translationVector[0];
                            tilemapObject.y += translationVector[1];
                        }
                    // Objects without gids and width and/or heigh defined are intead rotated around
                    // the top-left corner
                    } else if (tilemapObject.gid === undefined &&
                        (tilemapObject.width !== 0 || tilemapObject.imageHeight !== 0)) {
                        translationVector = [tilemapObject.width / 2, tilemapObject.height / 2];
                        translationVector = util.rotateVector(
                            tilemapObject.rotation * Math.PI / 180,
                            translationVector
                        );
                        tilemapObject.x += translationVector[0];
                        tilemapObject.y += translationVector[1];
                    }
                });
            }
        });

        callback(data);
    });

    this.phaserLoader.start();
};

module.exports = TrackLoader;
