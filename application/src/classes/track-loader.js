import rng from '../rng';
import trackList from '../track-list';
import { rotateVector } from '../util';
import TrackAssembler from './track-assembler';
import _ from 'underscore';

// Here's a list of layer names that are reserved for data tile layers that shouldn't be rendered
const dataLayers = {
    drops : true,
    ramps : true,
    rough : true
};

class TrackLoader
{
    constructor(loader) {
        this.phaserLoader = loader;
    }

    adjustTrackData(data) {
        const tilesets = [], objectClasses = {};

        data.tilesets.forEach(tileset => {
            if (tileset.image) {
                // Set URL for tileset images
                tileset.imageUrl = 'assets/tilemaps/' + tileset.image.replace(/[.\/]*/, '', 'g');
                tilesets.push(tileset);

                if (tileset.name === 'meta-tile') {
                    data.metaTileGid = tileset.firstgid;
                }
            } else if (tileset.tileproperties) {
                // Convert image collection tileset data to object data
                Object.keys(tileset.tileproperties).forEach((index) => {
                    objectClasses[parseInt(tileset.firstgid, 10) + parseInt(index, 10)] = tileset.tileproperties[index];
                });
            }
        });
        data.tilesets = tilesets;

        data.placedObjectClasses = {};

        // Step through all of data.layers and go through all of layer.objects.
        // If object.gid matches something in objectClasses, then set object.type
        // to objectClass.type, and adjust object.x and object.y using the image dimensions
        // (objectClass.imageHeight and objectClass.imageWidth) and object.rotation.
        data.layers.forEach(layer => {
            // As long as we're looping through layers, convert imagelayer paths to URLs
            if (layer.type === 'imagelayer') {
                layer.imageUrl = 'assets/' + layer.image.replace(/[.\/]*/, '', 'g');
            }

            // Set data tile layers to not render
            if (layer.type === 'tilelayer' && dataLayers[layer.name]) {
                layer.visible = false;
            }

            if (layer.objects) {
                layer.objects.forEach(tilemapObject => {
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
                            translationVector = rotateVector(
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
                        translationVector = rotateVector(
                            tilemapObject.rotation * Math.PI / 180,
                            translationVector
                        );
                        tilemapObject.x += translationVector[0];
                        tilemapObject.y += translationVector[1];
                    }
                });
            }
        });

        return data;
    }

    // Load track data by theme and track name and pass track data object to callback
    load(theme, name, callback) {
        let trackInstructions, trackSegmentData = [], trackLoader = this;

        trackInstructions = trackList[theme][name];

        // Not a multi-segment track
        if (_(trackInstructions).isString()) {
            this.phaserLoader.json('track-data', trackInstructions);
            this.phaserLoader.onLoadComplete.addOnce(() => {
                var data = trackLoader.phaserLoader.game.cache.getJSON('track-data');
                callback(trackLoader.adjustTrackData(data));
            });
            this.phaserLoader.start();
            return;
        }

        // Iterate over segments and shuffle through choices
        trackInstructions.forEach((row, rowIndex) => {
            row.forEach((segmentChoices, columnIndex) => {
                var selectedUrl = rng.pickValueFromArray(segmentChoices);
                trackLoader.phaserLoader.json(rowIndex + '-' + columnIndex, selectedUrl);
            });
        });

        this.phaserLoader.onLoadComplete.addOnce(() => {
            var assembledTrackData, trackAssembler;

            trackInstructions.forEach((row, rowIndex) => {
                trackSegmentData[rowIndex] = [];
                row.forEach((segment, columnIndex) => {
                    trackSegmentData[rowIndex][columnIndex] = trackLoader.phaserLoader.game.cache.getJSON(rowIndex + '-' + columnIndex);
                });
            });

            trackAssembler = new TrackAssembler(trackSegmentData);

            assembledTrackData = trackAssembler.assemble();

            callback(trackLoader.adjustTrackData(assembledTrackData));
        });

        this.phaserLoader.start();
    }
}

export default TrackLoader;
