'use strict';

var _         = require('underscore');
var trackList = require('../track-list');
var util      = require('../util');

var adjustTrackData = function(data) {
    var tilesets, objectClasses;

    tilesets      = [];
    objectClasses = {};
    data.tilesets.forEach(function (tileset) {
        if (tileset.image) {
            // Set URL for tileset images
            tileset.imagePath = 'assets/tilemaps/' + tileset.image.replace(/[.\/]*/, '', 'g');
            tilesets.push(tileset);

            if (tileset.name === 'meta-tile') {
                data.metaTileGid = tileset.firstgid;
            }
        } else if (tileset.tileproperties) {
            // Convert image collection tileset data to object data
            _.each(tileset.tileproperties, function(tile, index) {
                objectClasses[parseInt(tileset.firstgid, 10) + parseInt(index, 10)] = tile;
            });
        }
    });
    data.tilesets = tilesets;

    data.placedObjectClasses = {};

    // Step through all of data.layers and go through all of layer.objects.
    // If object.gid matches something in objectClasses, then set object.type
    // to objectClass.type, and adjust object.x and object.y using the image dimensions
    // (objectClass.imageHeight and objectClass.imageWidth) and object.rotation.
    data.layers.forEach(function (layer) {
        if (! layer.objects) {
            return;
        }

        layer.objects.forEach(function (tilemapObject) {
            var translationVector;

            if (tilemapObject.gid && objectClasses[tilemapObject.gid]) {
                tilemapObject.type = objectClasses[tilemapObject.gid].type;

                if (! data.placedObjectClasses[tilemapObject.type]) {
                    data.placedObjectClasses[tilemapObject.type] = true;
                }

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
            // Objects without gids and width and/or height defined are instead rotated around
            // the top-left corner
            } else if (tilemapObject.gid === undefined &&
                (tilemapObject.width !== 0 || tilemapObject.imageHeight !== 0)
            ) {
                translationVector = [tilemapObject.width / 2, tilemapObject.height / 2];
                translationVector = util.rotateVector(
                    tilemapObject.rotation * Math.PI / 180,
                    translationVector
                );
                tilemapObject.x += translationVector[0];
                tilemapObject.y += translationVector[1];
            }
        });
    });

    return data;
};

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

        callback(adjustTrackData(data));
    });

    this.phaserLoader.start();
};

module.exports = TrackLoader;
