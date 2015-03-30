'use strict';

var _              = require('underscore');
var rng            = require('../rng');
var trackList      = require('../track-list');
var util           = require('../util');
var TrackAssembler = require('./track-assembler');

/**
 * @param {Phaser.Loader} loader
 */
var TrackLoader = function(loader)
{
    this.phaserLoader = loader;
};

TrackLoader.prototype.adjustTrackData = function(data)
{
    var tilesets, objectClasses;

    tilesets      = [];
    objectClasses = {};
    data.tilesets.forEach(function (tileset) {
        if (tileset.image) {
            // Set URL for tileset images
            tileset.imageUrl = 'assets/tilemaps/' + tileset.image.replace(/[.\/]*/, '', 'g');
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
        // As long as we're looping through layers, convert imagelayer paths to URLs
        if (layer.type === 'imagelayer') {
            layer.imageUrl = 'assets/' + layer.image.replace(/[.\/]*/, '', 'g');
        }

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

// Load track data by theme and track name and pass track data object to callback
TrackLoader.prototype.load = function(theme, name, callback)
{
    var trackInstructions, trackSegmentData = [], trackLoader = this;

    trackInstructions = trackList[theme][name];

    // Not a multi-segment track
    if (_(trackInstructions).isString()) {
        this.phaserLoader.json('track-data', trackInstructions);
        this.phaserLoader.onLoadComplete.addOnce(function () {
            var data = trackLoader.phaserLoader.game.cache.getJSON('track-data');
            callback(trackLoader.adjustTrackData(data));
        });
        this.phaserLoader.start();
        return;
    }

    // Iterate over segments and shuffle through choices
    trackInstructions.forEach(function (row, rowIndex) {
        row.forEach(function (segmentChoices, columnIndex) {
            var selectedUrl = rng.pickValueFromArray(segmentChoices);
            trackLoader.phaserLoader.json(rowIndex + '-' + columnIndex, selectedUrl);
        });
    });

    this.phaserLoader.onLoadComplete.addOnce(function () {
        var assembledTrackData, trackAssembler;

        trackInstructions.forEach(function (row, rowIndex) {
            trackSegmentData[rowIndex] = [];
            row.forEach(function (segment, columnIndex) {
                trackSegmentData[rowIndex][columnIndex] = trackLoader.phaserLoader.game.cache.getJSON(rowIndex + '-' + columnIndex);
            });
        });

        trackAssembler = new TrackAssembler(trackSegmentData);

        assembledTrackData = trackAssembler.assemble();

        callback(trackLoader.adjustTrackData(assembledTrackData));
    });

    this.phaserLoader.start();
};

module.exports = TrackLoader;
