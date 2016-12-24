import getTemplate from './get-desert-template';
import desertEmbels from './desert-embellishments';
import rng from 'app/rng';
import _ from 'underscore';

const SAND = 48;
const PAVEMENT = 58;
const GRAVEL = 21;
const PIT = 24;
const WATER = 27;
const FINISH = 53;
const FINISH_E = 67;
const FINISH_W = 81;
const FINISH_S = 79;
const FINISH_N = 80;

const BRIDGE_NS = 56;
const BRIDGE_EW = 70;
const BRIDGE_W = 82;
const BRIDGE_E = 83;
const BRIDGE_N = 84;
const BRIDGE_S = 98;

const NORTH = 0;
const EAST = 90;
const SOUTH = 180;
const WEST = 270;

const TRACK_WIDTH  = 6;
const MAP_SIZE     = 600;

const EMBEL_NONE = 'EMBEL_NONE';
const INWARD = 'INWARD';
const OUTWARD = 'OUTWARD';
const LEFT = 'LEFT';
const RIGHT = 'RIGHT';

// Args for getAdjacentTileIndex
const N = 'N';
const W = 'W';
const NE = 'NE';
const NW = 'NW';
const E = 'E';
const S = 'S';
const SE = 'SE';
const SW = 'SW';

// constants for point arrays
const X = 0;
const Y = 1;
const ANGLE = 2;

const edges = {};
edges[GRAVEL] = {
    EDGE_NW: 6,
    EDGE_N: 7,
    EDGE_NE: 8,
    EDGE_W: 20,
    EDGE_E: 22,
    EDGE_SW: 34,
    EDGE_S: 35,
    EDGE_SE: 36,
    CORNER_NW: 19,
    CORNER_NE: 18,
    CORNER_SW: 5,
    CORNER_SE: 4,
};
edges[PIT] = {
    EDGE_NW: 9,
    EDGE_N: 10,
    EDGE_NE: 11,
    EDGE_W: 23,
    EDGE_E: 25,
    EDGE_SW: 37,
    EDGE_S: 38,
    EDGE_SE: 39,
    CORNER_NW: 66,
    CORNER_NE: 65,
    CORNER_SW: 52,
    CORNER_SE: 51,
};
edges[WATER] = {
    EDGE_NW: 12,
    EDGE_N: 13,
    EDGE_NE: 14,
    EDGE_W: 26,
    EDGE_E: 28,
    EDGE_SW: 40,
    EDGE_S: 41,
    EDGE_SE: 42,
    CORNER_NW: 69,
    CORNER_NE: 68,
    CORNER_SW: 55,
    CORNER_SE: 54,
};
edges[PAVEMENT] = {
    EDGE_NW: 43,
    EDGE_N: 44,
    EDGE_NE: 45,
    EDGE_W: 57,
    EDGE_E: 59,
    EDGE_SW: 71,
    EDGE_S: 72,
    EDGE_SE: 73,
    CORNER_SE: 60,
    CORNER_NW: 75,
    CORNER_NE: 74,
    CORNER_SW: 61,
};

class DesertGenerator
{
    constructor(options) {
        options = options || {};

        this.options = options;
        this.template = getTemplate({
            height: MAP_SIZE,
            width: MAP_SIZE,
        });
        this.gravelIndices = [];
        this.waterIndices = [];
        this.puddleIndices = [];
        this.bridgeIndices = [];
        this.trackIndices = [];
    }

    generate() {
        const data = Object.assign({}, this.template);

        const points = this._plotPoints();
        this._generateTrack(points, data);
        this._generateTrackMarkers(points, data);
        this._generateObstacles(points, data);
        this._generatePuddles(points, data);
        this._generateGravel(data);
        this._generateWater(data);
        this._addEdgeTiles(data, this.gravelIndices, GRAVEL);
        this._addEdgeTiles(data, this.trackIndices, PAVEMENT);
        this._addEdgeTiles(data, this.waterIndices, WATER);
        this._drawFinishLine(data);
        this._generatePossiblePowerupPoints(data);

        this.generatedData = data;

        return data;
    }

    generateMinimap(game) {
        const minimap = game.make.bitmapData(MAP_SIZE, MAP_SIZE, 'minimap', true);

        this.trackIndices.forEach(index => {
            let point = this._convertIndexToPoint(index);
            minimap.setPixel(point[X], point[Y], 255, 255, 255, false);
        });

        this.puddleIndices.forEach(index => {
            let point = this._convertIndexToPoint(index);
            minimap.setPixel(point[X], point[Y], 0, 0, 255, false);
        });

        this.bridgeIndices.forEach(index => {
            let point = this._convertIndexToPoint(index);
            minimap.setPixel(point[X], point[Y], 0xF6, 0xD4, 0xA4, false);
        });

        minimap.context.putImageData(minimap.imageData, 0, 0);
        minimap.dirty = true;

        // Mark starting line
        minimap.text(
          '★',
          Math.floor(this.finishPoint.x / this.template.tilewidth) - 12,
          Math.floor(this.finishPoint.y / this.template.tileheight) + 5,
          '24px Arial',
          'rgb(255,0,0)',
          false
        );

        return minimap;
    }

    _getRandomizedPebble(x, y) {
      const pebbleTypes = [
        'Pebble1',
      ];

      return {
        rotation: rng.getIntBetween(0, 359),
        type: rng.pickValueFromArray(pebbleTypes),
        visible: true,
        x: x,
        y: y,
      };
    }

    _getLayer(data, name) {
        let returnedLayer;

        data.layers.forEach(layer => {
            if (layer.name === name) {
                returnedLayer = layer;
            }
        });

        return returnedLayer;
    }

    _addAnts(obstacleLayer, candyObstacle) {
        const candyPoint = [
            candyObstacle.x / this.template.tilewidth,
            candyObstacle.y / this.template.tileheight,
        ];
        this._scatterObstacles(
            obstacleLayer,
            'Ant',
            rng.getIntBetween(10, 25),
            10,
            [
                candyPoint[X] - 60,
                candyPoint[Y] - 60,
            ],
            [
                candyPoint[X] + 60,
                candyPoint[Y] + 60,
            ]
        );
    }

    _generateObstacles(points, data) {
        const obstacleLayer = this._getLayer(data, 'obstacles');

        const obstacles = [
            'HandShovel',
            'HorseShoe',
            'HorseShoe', // Generate two of them
            'Lollipop',
            'Sprayer',
        ];

        const pickedPoints = [];
        for (let i = 0; i < Math.min(obstacles.length, points.length); i += 1) {
            let point;
            do {
                point = rng.pickValueFromArray(points);
            } while (
                // Make sure no two points are too close together
                pickedPoints.indexOf(point) !== -1 ||
                pickedPoints.some(pickedPoint => {
                    return this._getDistanceBetween(point, pickedPoint) < 60;
                }) ||
                // Make sure isn't within 5 tiles of a track marker
                this._getMarkerPoints(data).some(markerPoint => {
                    return this._getDistanceBetween(point, markerPoint) < 6;
                })
            );
            pickedPoints.push(point);

            const range = {
                x: rng.pickValueFromArray([
                    [point[X] - 20, point[X] - 10],
                    [point[X] + 10, point[X] + 20],
                ]),
                y: rng.pickValueFromArray([
                    [point[Y] - 20, point[Y] - 10],
                    [point[Y] + 10, point[Y] + 20],
                ])
            };

            const object = {
                rotation: rng.getIntBetween(0, 359),
                type: obstacles[i],
                visible: true,
                x: rng.getIntBetween(range.x[0], range.x[1]) * this.template.tilewidth,
                y: rng.getIntBetween(range.y[0], range.y[1]) * this.template.tileheight,
            };

            // Limit angles for aspirin bottle, since we need to define rectangles
            // where the pills will be scattered for each one.
            if (object.type === 'AspirinBottle') {
                object.rotation = Math.floor(object.rotation / 45) * 45;
                this._addPillObstacles(obstacleLayer, object);
            }
            // Candy attracts ants.
            if (object.type === 'Lollipop') {
                this._addAnts(obstacleLayer, object);
            }
            obstacleLayer.objects.push(object);
        }
    }

    _addPillObstacles(layer, bottleObject) {
        const point = [
            bottleObject.x / this.template.tilewidth,
            bottleObject.y / this.template.tileheight
        ];
        let topLeft;
        let bottomRight;
        // Define the areas where spilled pills may appear.
        // There's probably a smart, mathy way to do this, but instead...
        switch (Math.floor(bottleObject.rotation / 45)) {
            case 0: // Facing N
                topLeft = [
                    point[X] - 2,
                    point[Y] - 18,
                ];
                bottomRight = [
                    point[X] + 2,
                    point[Y] - 10
                ];
                break;
            case 1: // Facing NE
                topLeft = [
                    point[X] + 6,
                    point[Y] - 11,
                ];
                bottomRight = [
                    point[X] + 9,
                    point[Y] - 6
                ];
                break;
            case 2: // Facing E
                topLeft = [
                    point[X] + 9,
                    point[Y] + 3,
                ];
                bottomRight = [
                    point[X] + 16,
                    point[Y] - 3
                ];
                break;
            case 3: // Facing SE
                topLeft = [
                    point[X] + 7,
                    point[Y] + 6,
                ];
                bottomRight = [
                    point[X] + 9,
                    point[Y] + 9
                ];
                break;
            case 4: // Facing S
                topLeft = [
                    point[X] - 2,
                    point[Y] + 10,
                ];
                bottomRight = [
                    point[X] + 2,
                    point[Y] + 18
                ];
                break;
            case 5: // Facing SW
                topLeft = [
                    point[X] - 10,
                    point[Y] + 9,
                ];
                bottomRight = [
                    point[X] - 6,
                    point[Y] + 12
                ];
                break;
            case 6: // Facing W
                topLeft = [
                    point[X] - 9,
                    point[Y] + 3,
                ];
                bottomRight = [
                    point[X] - 16,
                    point[Y] - 3
                ];
                break;
            case 7: // Facing NW
                topLeft = [
                    point[X] - 6,
                    point[Y] - 11,
                ];
                bottomRight = [
                    point[X] - 9,
                    point[Y] - 6
                ];
                break;
        }

        this._scatterObstacles(
            layer,
            'AspirinPill',
            rng.getIntBetween(6, 12),
            1,
            topLeft,
            bottomRight
        );
    }

    _scatterObstacles(layer, type, number, spacing, topLeft, bottomRight) {
        const obstacles = [];
        let safetyCounter = 0;
        for (let i = 0; i < number; i += 1) {
            let point;
            do {
                point = [
                    rng.getIntBetween(topLeft[X], bottomRight[X]),
                    rng.getIntBetween(topLeft[Y], bottomRight[Y])
                ];
                safetyCounter += 1;
                if (safetyCounter > 100) {
                    point = null;
                    break;
                }
            } while (
                obstacles.some(obstacle => {
                    return this._getDistanceBetween(point, obstacle) < spacing;
                })
            )

            if (! point) {
                break;
            }
            obstacles.push(point);

            layer.objects.push({
                rotation: rng.getIntBetween(0, 360),
                type: type,
                visible: true,
                x: point[X] * this.template.tilewidth,
                y: point[Y] * this.template.tileheight,
            });
        }
    }

    _fillLayer(layerData, value) {
        // Do it in batches to avoid "max call stack exceeded"
        const totalTiles = MAP_SIZE * MAP_SIZE;
        for (let i = 0; i < MAP_SIZE; i += 1) {
            layerData.push.apply(
                layerData,
                (new Array(MAP_SIZE)).fill(value)
            );
        }
    }

    _fillArea(layerData, value, topLeft, bottomRight, affectedIndices) {
        const horizontalSize = bottomRight[X] - topLeft[X];
        const verticalSize   = bottomRight[Y] - topLeft[Y];

        for (let i = 0; i < verticalSize; i += 1) {
            this._drawHorizontalLine(
                layerData,
                value,
                [
                    topLeft[X],
                    topLeft[Y] + i
                ],
                horizontalSize,
                affectedIndices || null
            );
        }
    }

    _fillIndices(data, tile, indices) {
        indices.forEach(index => {
            data[index] = tile;
        });
    }

    _addEdgeTiles(data, tileIndices, tile) {
        tileIndices.forEach(index => {
            const adj = this._getAdjacentTileIndex.bind(this);
            const bg = this._getLayer(data, 'background').data;
            if (bg[adj(index, N)] !== tile && bg[adj(index, NW)] !== tile && bg[adj(index, NE)] !== tile) {
                bg[adj(index, N)] = edges[tile].EDGE_N;
            }
            if (bg[adj(index, S)] !== tile && bg[adj(index, SW)] !== tile && bg[adj(index, SE)] !== tile) {
                bg[adj(index, S)] = edges[tile].EDGE_S;
            }
            if (bg[adj(index, W)] !== tile && bg[adj(index, NW)] !== tile && bg[adj(index, SW)] !== tile) {
                bg[adj(index, W)] = edges[tile].EDGE_W;
            }
            if (bg[adj(index, E)] !== tile && bg[adj(index, NE)] !== tile && bg[adj(index, SE)] !== tile) {
                bg[adj(index, E)] = edges[tile].EDGE_E;
            }
            if (bg[adj(index, NW)] !== tile && bg[adj(index, W)] !== tile && bg[adj(index, N)] !== tile) {
                bg[adj(index, NW)] = edges[tile].EDGE_NW;
            }
            if (bg[adj(index, NE)] !== tile && bg[adj(index, N)] !== tile && bg[adj(index, E)] !== tile) {
                bg[adj(index, NE)] = edges[tile].EDGE_NE;
            }
            if (bg[adj(index, SE)] !== tile && bg[adj(index, E)] !== tile && bg[adj(index, S)] !== tile) {
                bg[adj(index, SE)] = edges[tile].EDGE_SE;
            }
            if (bg[adj(index, SW)] !== tile && bg[adj(index, W)] !== tile && bg[adj(index, S)] !== tile) {
                bg[adj(index, SW)] = edges[tile].EDGE_SW;
            }
            if (bg[adj(index, E)] !== tile && bg[adj(index, SE)] === tile) {
                bg[adj(index, E)] = edges[tile].CORNER_NE;
            }
            if (bg[adj(index, E)] !== tile && bg[adj(index, NE)] === tile) {
                bg[adj(index, E)] = edges[tile].CORNER_SE;
            }
            if (bg[adj(index, W)] !== tile && bg[adj(index, NW)] === tile) {
                bg[adj(index, W)] = edges[tile].CORNER_SW;
            }
            if (bg[adj(index, W)] !== tile && bg[adj(index, SW)] === tile) {
                bg[adj(index, W)] = edges[tile].CORNER_NW;
            }
        });
    }

    _generateTrack(points, data) {
        const background = this._getLayer(data, 'background');
        const obstacleLayer = this._getLayer(data, 'obstacles');

        this._fillLayer(background.data, SAND);

        // Draw track between all points, including between the first and last
        const drawPoints = points.slice();
        drawPoints.push(points[0]);
        drawPoints.forEach((point, index) => {
            if (index > 0) {
                var prevPoint = points[index - 1];
                if ([NORTH, SOUTH].indexOf(prevPoint[ANGLE]) !== -1) {
                    this._drawVerticalTrack(
                        background.data,
                        prevPoint[Y] < point[Y] ? prevPoint : point,
                        Math.abs(point[Y] - prevPoint[Y])
                    )
                } else {
                    var leftPoint = (prevPoint[X] < point[X] ? prevPoint : point).slice();
                    leftPoint[X] -= 3; // -3 to fill in corners
                    this._drawHorizontalPebbleTrack(
                        obstacleLayer,
                        leftPoint,
                        Math.abs(point[X] - prevPoint[X]) + 6 // +6 to fill in corners
                    )
                }
            }
        });

        return data;
    }

    _generatePuddles(points, data) {
        const candidateLines = [];
        for (let i = 0; i < points.length; i += 1) {
            const nextPoint = (i === points.length - 1) ? points[0] : points[i + 1];
            const lineLength = this._getDistanceBetween(points[i], nextPoint);
            if (lineLength > 50) {
                candidateLines.push({
                    line: [
                        points[i],
                        nextPoint
                    ],
                    lineLength: lineLength,
                });
            }
        }

        candidateLines.forEach(candidate => {
            var line = candidate.line;
            var midpoint = this._getMidpoint(line[0], line[1])
            if (
                ! this._getObstaclePoints(data).some(point => {
                    return this._getDistanceBetween(point, midpoint) < 20;
                })
                && rng.happensGivenProbability(.50)
            ) {
                this._addPuddle(data, line, midpoint);
            }
        });
    }

    _addPuddle(data, line, point) {
        const background = this._getLayer(data, 'background');

        let topLeft, bottomRight, innerTopLeft, innerBottomRight, rampTopLeft;
        const puddleLength = 3 + (5 * rng.getIntBetween(1, 4));

        const isNorthSouth = line[0][ANGLE] === NORTH || line[0][ANGLE] === SOUTH;
        if (isNorthSouth) {
            topLeft = [
                point[X] - (TRACK_WIDTH / 2) - 8,
                point[Y] - puddleLength
            ];
            bottomRight = [
                point[X] + (TRACK_WIDTH / 2) + 8,
                point[Y] + puddleLength
            ];
            innerTopLeft = [
                topLeft[X],
                topLeft[Y] + 2
            ];
            innerBottomRight = [
                bottomRight[X],
                bottomRight[Y] - 1
            ];
        } else {
            topLeft = [
                point[X] - puddleLength,
                point[Y] - (TRACK_WIDTH / 2) - 8
            ];
            bottomRight = [
                point[X] + puddleLength,
                point[Y] + (TRACK_WIDTH / 2) + 9 // Can't figure out why it needs the +1
            ];
            innerTopLeft = [
                topLeft[X] + 2,
                topLeft[Y]
            ];
            innerBottomRight = [
                bottomRight[X] - 2,
                bottomRight[Y]
            ];
        }
        const sandIndices = [];

        // First fill entire area with sand
        this._fillArea(
            background.data,
            SAND,
            topLeft,
            bottomRight,
            sandIndices
        );
        // Remove all special tile indices in this area
        this.trackIndices = _.difference(this.trackIndices, sandIndices);
        this.gravelIndices = _.difference(this.gravelIndices, sandIndices);
        this.waterIndices = _.difference(this.waterIndices, sandIndices);

        const puddleIndices = [];
        // Then fill background layer area with water tiles
        this._fillArea(
            background.data,
            WATER,
            innerTopLeft,
            innerBottomRight,
            puddleIndices
        );
        this.puddleIndices.push.apply(this.puddleIndices, puddleIndices);
        this.waterIndices.push.apply(this.waterIndices, puddleIndices);
        // Fill water layer with tiles
        this._fillArea(
            this._getLayer(data, 'water').data,
            1,
            innerTopLeft,
            innerBottomRight
        );

        // Add bridges
        const bridgeIndices = [];
        if (isNorthSouth) {
            // Vertical bridge
            const bridgeNorthEnd = [
                innerTopLeft[X] + Math.floor(Math.abs(innerTopLeft[X] - innerBottomRight[X]) / 2),
                innerTopLeft[Y] - 1
            ];
            const bridgeSouthEnd = [
                innerBottomRight[X] - Math.floor(Math.abs(innerTopLeft[X] - innerBottomRight[X]) / 2),
                innerBottomRight[Y]
            ];
            this._drawNorthSouthBridge(bridgeNorthEnd, bridgeSouthEnd, data, bridgeIndices);
            // Remove water tiles from water layer
            this._fillIndices(this._getLayer(data, 'water').data, 0, bridgeIndices);
        } else {
            // Horizontal bridge
            const bridgeWestEnd = [
                innerTopLeft[X] - 1,
                innerTopLeft[Y] + Math.floor(Math.abs(innerTopLeft[Y] - innerBottomRight[Y]) / 2)
            ];
            const bridgeEastEnd = [
                innerBottomRight[X] + 1,
                innerBottomRight[Y] - Math.floor(Math.abs(innerTopLeft[Y] - innerBottomRight[Y]) / 2),
            ];
            this._drawEastWestBridge(bridgeWestEnd, bridgeEastEnd, data, bridgeIndices);
            // Remove water tiles from water layer
            this._fillIndices(this._getLayer(data, 'water').data, 0, bridgeIndices);
        }

        // Remove waterIndices that no longer refer to water tiles
        this.waterIndices = _.difference(this.waterIndices, bridgeIndices);
        this.bridgeIndices.push.apply(this.bridgeIndices, bridgeIndices);
    }

    _drawEastWestBridge(westPoint, eastPoint, data, affectedIndices) {
        const tileOrder = [
            BRIDGE_W,
            BRIDGE_EW,
            BRIDGE_EW,
            BRIDGE_EW,
            BRIDGE_E,
        ];
        let tileCursor = 0;
        const foregroundData = this._getLayer(data, 'foreground').data;
        for (let y = westPoint[Y] - 2; y <= westPoint[Y] + 2; y += 1) {
            for (let x = westPoint[X]; x <= eastPoint[X]; x += 1) {
                let index = this._convertPointToIndex([x, y]);
                foregroundData[index] = tileOrder[tileCursor];
                tileCursor = (tileCursor === tileOrder.length - 1) ? 0 : tileCursor + 1;
                affectedIndices.push(index);
            }
        }
    }

    _drawNorthSouthBridge(northPoint, southPoint, data, affectedIndices) {
        const tileOrder = [
            BRIDGE_N,
            BRIDGE_NS,
            BRIDGE_NS,
            BRIDGE_NS,
            BRIDGE_S,
        ];
        let tileCursor = 0;
        let foregroundData = this._getLayer(data, 'foreground').data;
        for (let x = northPoint[X] - 2; x <= northPoint[X] + 2; x += 1) {
            for (let y = northPoint[Y]; y <= southPoint[Y]; y += 1) {
                let index = this._convertPointToIndex([x, y]);
                foregroundData[index] = tileOrder[tileCursor];
                tileCursor = (tileCursor === tileOrder.length - 1) ? 0 : tileCursor + 1;
                affectedIndices.push(index);
            }
        }
    }

    _generateGravel(data) {
        const background = this._getLayer(data, 'background');
        const rough = this._getLayer(data, 'rough');

        this._fillLayer(rough.data, 0);

        const totalTiles = MAP_SIZE * MAP_SIZE;
        const gravelCount = Math.round(totalTiles * .015);
        for (let i = 0; i < gravelCount; i += 1) {
            this._generatePatch(
                rng.getIntBetween(0, totalTiles),
                background.data,
                GRAVEL,
                rough.data,
                1,
                this.gravelIndices
            );
        }
    }

    _generateWater(data) {
        const background = this._getLayer(data, 'background');
        const obstacles = this._getLayer(data, 'obstacles');
        const water = this._getLayer(data, 'water');

        this._fillLayer(water.data, 0);

        const totalTiles = MAP_SIZE * MAP_SIZE;
        const pitCount = Math.round(totalTiles * .005);
        for (let i = 0; i < pitCount; i += 1) {
            // If there's an obstacle nearby, pick a different tile
            let point;
            let tileIndex;
            do {
                tileIndex = rng.getIntBetween(0, totalTiles);
                point = this._convertIndexToPoint(tileIndex);
            } while (
                obstacles.objects.some(object => {
                    return this._getDistanceBetween(
                        point,
                        [
                            object.x / this.template.tilewidth,
                            object.y / this.template.tileheight
                        ]
                    ) < 20;
                })
            )

            this._generatePatch(
                tileIndex,
                background.data,
                WATER,
                water.data,
                1,
                this.waterIndices
            );
        }
    }

    _generatePatch(
        pointIndex,
        backgroundData,
        backgroundTile,
        layerData,
        layerTile,
        tileIndices
    ) {
         if (backgroundData[pointIndex] !== SAND) {
             return false;
         }

         const tooCloseToAnotherSpecialTile = tileIndex => {
             const adj = this._getAdjacentTileIndex.bind(this);
             const bg = backgroundData;
             let tooClose = false;

             // Tile can't be touching a non-sand, non-patch-type tile
             [N, S, E, W, NE, NW, SE, SW].forEach(direction => {
                if (tooClose) {
                    return;
                }
                if ([SAND, backgroundTile].indexOf(bg[adj(tileIndex, direction)]) === -1) {
                    tooClose = true;
                }
             });

             if (bg[adj(tileIndex, N)] === SAND) {
                 if (
                     bg[adj(adj(tileIndex, N), N)] !== SAND ||
                     bg[adj(adj(tileIndex, N), NW)] !== SAND ||
                     bg[adj(adj(tileIndex, N), NE)] !== SAND
                 ) {
                     tooClose = true;
                 }
             }
             if (! tooClose && bg[adj(tileIndex, S)] === SAND) {
                 if (
                     bg[adj(adj(tileIndex, S), S)] !== SAND ||
                     bg[adj(adj(tileIndex, S), SW)] !== SAND ||
                     bg[adj(adj(tileIndex, S), SE)] !== SAND
                 ) {
                     tooClose = true;
                 }
             }
             if (! tooClose && bg[adj(tileIndex, E)] === SAND) {
                 if (
                     bg[adj(adj(tileIndex, E), E)] !== SAND ||
                     bg[adj(adj(tileIndex, E), NE)] !== SAND ||
                     bg[adj(adj(tileIndex, E), SE)] !== SAND
                 ) {
                     tooClose = true;
                 };
             }
             if (! tooClose && bg[adj(tileIndex, W)] === SAND) {
                 if (
                     bg[adj(adj(tileIndex, W), W)] !== SAND ||
                     bg[adj(adj(tileIndex, W), NW)] !== SAND ||
                     bg[adj(adj(tileIndex, W), SW)] !== SAND
                 ) {
                     tooClose = true;
                 };
             }

             if (! tooClose && bg[adj(tileIndex, NE)] === SAND) {
                 if (bg[adj(adj(tileIndex, NE), NE)] !== SAND) {
                     tooClose = true;
                 }
             }
             if (! tooClose && bg[adj(tileIndex, NW)] === SAND) {
                 if (bg[adj(adj(tileIndex, NW), NW)] !== SAND) {
                     tooClose = true;
                 }
             }
             if (! tooClose && bg[adj(tileIndex, SE)] === SAND) {
                 if (bg[adj(adj(tileIndex, SE), SE)] !== SAND) {
                     tooClose = true;
                 }
             }
             if (! tooClose && bg[adj(tileIndex, SW)] === SAND) {
                 if (bg[adj(adj(tileIndex, SW), SW)] !== SAND) {
                     tooClose = true;
                 }
             }

             return tooClose;
         };

         // Add the center point
         if (! tooCloseToAnotherSpecialTile(pointIndex)) {
             backgroundData[pointIndex] = backgroundTile;
             layerData[pointIndex] = layerTile;
             tileIndices.push(pointIndex);
         }

         const checkedIndexes = [];
         const addPatchPoints = (centerIndex, chance) => {
             if (chance <= 0 || ! chance) {
                 return;
             }

             const possiblePoints = this._getSurroundingAreas(centerIndex, checkedIndexes);
             possiblePoints.forEach(possiblePointIndex => {
                if (
                    backgroundData[possiblePointIndex] === SAND &&
                    rng.happensGivenProbability(chance) &&
                    ! tooCloseToAnotherSpecialTile(possiblePointIndex)
                ) {
                    backgroundData[possiblePointIndex] = backgroundTile;
                    layerData[possiblePointIndex] = layerTile;
                    tileIndices.push(possiblePointIndex);
                    // Gets less likely the further out we go
                    addPatchPoints(possiblePointIndex, chance - .1);
                }
                checkedIndexes.push(possiblePointIndex);
             });
         };

         addPatchPoints(pointIndex, .9);
    }

    _getAdjacentTileIndex(tileIndex, direction) {
        let adjacentTileIndex = false;

        switch (direction) {
            case NW:
                adjacentTileIndex = tileIndex - this.template.width - 1;
                break;
            case N:
                adjacentTileIndex = tileIndex - this.template.width;
                break;
            case NE:
                adjacentTileIndex = tileIndex - this.template.width + 1;
                break;
            case W:
                adjacentTileIndex = tileIndex - 1;
                break;
            case E:
                adjacentTileIndex = tileIndex + 1;
                break;
            case SW:
                adjacentTileIndex = tileIndex + this.template.width - 1;
                break;
            case S:
                adjacentTileIndex = tileIndex + this.template.width;
                break;
            case SE:
                adjacentTileIndex = tileIndex + this.template.width + 1;
                break;
        }

        if (adjacentTileIndex < 0 && adjacentTileIndex > MAP_SIZE * MAP_SIZE - 1) {
            return false;
        }

        return adjacentTileIndex;
    }

    _getSurroundingAreas(tileIndex, excludedIndexes) {
        excludedIndexes = excludedIndexes || [];

        let surroundingAreas = [
            // diagonals
            this._getAdjacentTileIndex(tileIndex, NW),
            this._getAdjacentTileIndex(tileIndex, NE),
            this._getAdjacentTileIndex(tileIndex, SW),
            this._getAdjacentTileIndex(tileIndex, SE),

            // orthogonals
            this._getAdjacentTileIndex(tileIndex, N),
            this._getAdjacentTileIndex(tileIndex, S),
            this._getAdjacentTileIndex(tileIndex, E),
            this._getAdjacentTileIndex(tileIndex, W),
        ];

        // Filter out points that go off the map
        surroundingAreas = surroundingAreas.filter(surroundingTileIndex => {
            return (
                surroundingTileIndex !== false &&
                excludedIndexes.indexOf(surroundingTileIndex) === -1
            );
        });

        return surroundingAreas;
    }

    // Get marker points as tile coordinates
    _getMarkerPoints(data)
    {
        const track = this._getLayer(data, 'track');
        const points = [];

        track.objects.forEach(marker => {
            points.push([
                marker.x / this.template.tilewidth,
                marker.y / this.template.tileheight,
                marker.rotation
            ]);
        });

        return points;
    }

    _getObstaclePoints(data)
    {
        const obstacles = this._getLayer(data, 'obstacles');
        const points = [];

        obstacles.objects.forEach(obstacle => {
            points.push([
                obstacle.x / this.template.tilewidth,
                obstacle.y / this.template.tileheight,
                obstacle.rotation
            ]);
        });

        return points;
    }

    _generateTrackMarkers(points, data) {
        const track = this._getLayer(data, 'track');

        const getMarker = (point, index) => {
            var coordinate;
            var coordinateMultiplier;

            switch (point[ANGLE]) {
                case NORTH:
                    coordinate = Y;
                    coordinateMultiplier = -1;
                    break;
                case SOUTH:
                    coordinateMultiplier = 1;
                    coordinate = Y;
                    break;
                case EAST:
                    coordinateMultiplier = 1;
                    coordinate = X;
                    break;
                case WEST:
                    coordinateMultiplier = -1;
                    coordinate = X;
                    break;
            }

            let adjustment = 10;
            const markerPoint = [point[X], point[Y]];
            markerPoint[coordinate] = point[coordinate] + (adjustment * coordinateMultiplier);

            const marker = {
                "id": index,
                "height": this.template.tileheight,
                "width": this.template.tilewidth * TRACK_WIDTH * 5,
                "x": markerPoint[X] * this.template.tilewidth,
                "y": markerPoint[Y] * this.template.tileheight,
                "rotation": point[ANGLE],
                "visible":true,
            };

            return marker;
        };

        points.forEach((point, index) => {
            track.objects.push(getMarker(point, index + 1));
        });

        // Pick a finish line and then number the markers accordingly:
        const finishIndex = rng.getIntBetween(0, track.objects.length - 1);
        let markerIncrementer = 0;
        Object.assign(track.objects[finishIndex], { name: 'finish-line', type: 'finish-line' });
        for (let i = finishIndex + 1; i < track.objects.length; i += 1) {
            track.objects[i].properties = { index: markerIncrementer };
            markerIncrementer += 1;
        }
        // Loop back around to the first point
        for (let i = 0; i < finishIndex; i += 1) {
            track.objects[i].properties = { index: markerIncrementer };
            markerIncrementer += 1;
        }

        return data;
    }

    _drawFinishLine(data) {
        const track = this._getLayer(data, 'track');
        const decoration = this._getLayer(data, 'decoration');

        let finishMarker;
        for (let i = 0; i < track.objects.length; i += 1) {
            if (track.objects[i].name === 'finish-line') {
                finishMarker = track.objects[i];
                break;
            }
        }

        this.finishPoint = finishMarker;

        const point = [
            finishMarker.x / this.template.tilewidth,
            finishMarker.y / this.template.tileheight
        ];

        let startingPos;
        if ([EAST, WEST].indexOf(finishMarker.rotation) !== -1) {
            startingPos = [point[X], point[Y] - TRACK_WIDTH / 2 - 1];
            decoration.data[this._convertPointToIndex(startingPos)] = FINISH_N;
            this._drawVerticalLine(decoration.data, FINISH, [startingPos[X], startingPos[Y] + 1], TRACK_WIDTH + 1);
            decoration.data[
                this._convertPointToIndex(
                    [startingPos[X], startingPos[Y] + TRACK_WIDTH + 2]
                )
            ] = FINISH_S;
        } else {
            startingPos = [point[X] - TRACK_WIDTH / 2 - 1, point[Y]];
            decoration.data[this._convertPointToIndex(startingPos)] = FINISH_W;
            this._drawHorizontalLine(decoration.data, FINISH, [startingPos[X] + 1, startingPos[Y]], TRACK_WIDTH + 1);
            decoration.data[
                this._convertPointToIndex(
                    [startingPos[X] + TRACK_WIDTH + 2, startingPos[Y]]
                )
            ] = FINISH_E;
        }
    }

    _plotPoints() {
        // Start with a plain rectangle
        const points = [];

        points.push(
            [150, MAP_SIZE - 150, NORTH],
            [150, 150, EAST],
            [MAP_SIZE - 150, 150, SOUTH],
            [MAP_SIZE - 150, MAP_SIZE - 150, WEST]
        );

        this.starterPoints = points.slice();

        this._embellishTrack(points);

        return points;
    }

    _embellishTrack(points) {
        const centerEmbellishmentTypes = desertEmbels.getCenterEmbellishments();
        const centerEmbellishments = [
            rng.pickValueFromArray(centerEmbellishmentTypes),
            rng.pickValueFromArray(centerEmbellishmentTypes),
            rng.pickValueFromArray(centerEmbellishmentTypes),
            rng.pickValueFromArray(centerEmbellishmentTypes),
        ];

        const cornerEmbellishmentTypes = desertEmbels.getCornerEmbellishments();
        const cornerEmbellishments = [
            rng.pickValueFromArray(cornerEmbellishmentTypes),
            rng.pickValueFromArray(cornerEmbellishmentTypes),
            rng.pickValueFromArray(cornerEmbellishmentTypes),
            rng.pickValueFromArray(cornerEmbellishmentTypes),
        ];

        let addedPoints = 0;
        for (let i = 0; i < 4; i += 1) {
            addedPoints += this._addCenterEmbellishment(
                points,
                centerEmbellishments[i],
                rng.pickValueFromArray([INWARD, OUTWARD]),
                addedPoints + i,
                i
            );

            addedPoints += this._addCornerEmbellishment(
                points,
                cornerEmbellishments[i],
                addedPoints + i
            );
        }
    }

    _addCornerEmbellishment(points, type, index) {
        if (type === EMBEL_NONE) {
            return 0;
        }

        // Get the 3/4 point
        const lineStart = points[index];
        const lineEnd   = points.length === index + 1 ? points[0] : points[index + 1];
        const branchPoint = lineEnd.slice();
        branchPoint[ANGLE] = lineStart[ANGLE];
        switch (branchPoint[ANGLE]) {
            case NORTH:
                branchPoint[Y] += 50;
                break;
            case EAST:
                branchPoint[X] -= 50;
                break;
            case SOUTH:
                branchPoint[Y] -= 50;
                break;
            case WEST:
                branchPoint[X] += 50;
                break;
        }

        const embellishment = this._plotPointsLogoStyle(
            branchPoint,
            desertEmbels.getCornerEmbelInstructions(type)
        );

        // Need to remove bottom left corner point if we're doing the SW corner
        if (points.length === index + 1) {
            points.splice(0, 1);
        }

        points.splice.apply(points, [index + 1, 1].concat(embellishment));

        return embellishment.length - 1; // -1 because the corner point was spliced over
    }

    // Mutates 'points' and returns the number of points added
    _addCenterEmbellishment(points, type, orientation, index, side) {
        if (type === EMBEL_NONE) {
            return 0;
        }

        // Get the midpoint
        const lineStart = this.starterPoints[side];
        const lineEnd   = side === 3 ? this.starterPoints[0] : this.starterPoints[side + 1];
        const midpoint = this._getMidpoint(lineStart, lineEnd);
        midpoint[ANGLE] = lineStart[ANGLE];

        switch (midpoint[ANGLE]) {
            case NORTH:
                midpoint[Y] += 10;
                break;
            case SOUTH:
                midpoint[Y] -= 10;
                break;
            case EAST:
                midpoint[X] -= 10;
                break;
            case WEST:
                midpoint[X] += 10;
                break;
        }

        const embellishment = this._plotPointsLogoStyle(
            midpoint,
            desertEmbels.getCenterEmbelInstructions(type, orientation)
        );

        points.splice.apply(points, [index + 1, 0].concat(embellishment));
        return embellishment.length;
    }

    _plotPointsLogoStyle(startingPoint, instructions) {
        const points = [];

        const cursor = startingPoint.slice();
        instructions.forEach(instruction => {
            if (typeof instruction === 'number') {
                var axisIndex;
                var coordinateMultiplier;
                switch (cursor[ANGLE]) {
                    case NORTH:
                        axisIndex = 1;
                        coordinateMultiplier = -1;
                        break;
                    case SOUTH:
                        axisIndex = 1;
                        coordinateMultiplier = 1;
                        break;
                    case EAST:
                        axisIndex = 0;
                        coordinateMultiplier = 1;
                        break;
                    case WEST:
                        axisIndex = 0;
                        coordinateMultiplier = -1;
                        break;
                }
                cursor[axisIndex] += (instruction * coordinateMultiplier);
            } else if ([LEFT, RIGHT].indexOf(instruction) !== -1) {
                if (instruction === LEFT) {
                    cursor[ANGLE] = cursor[ANGLE] === 0 ? 270 : cursor[ANGLE] - 90;
                } else {
                    cursor[ANGLE] = cursor[ANGLE] === 270 ? 0 : cursor[ANGLE] + 90;
                }
                points.push(cursor.slice());
            } else {
                throw new Error('Unknown instruction: ' + instruction);
            }
        });

        return points;
    }

    _drawHorizontalPebbleTrack(obstacleLayer, leftPos, length) {
      const pad = (TRACK_WIDTH / 2) * this.template.tileheight;
      for (
        let x = leftPos[X];
        x < leftPos[X] + (length * this.template.tilewidth);
        x += this.template.tilewidth
      ) {
        obstacleLayer.objects.push(this._getRandomizedPebble(x, leftPos[Y] - pad));
      }
    }

    _drawHorizontalTrack(data, leftPos, length) {
        const pad = TRACK_WIDTH / 2;
        for (let y = leftPos[Y] - pad; y <= leftPos[Y] + pad; y += 1) {
            var indexes;
            if (y === leftPos[Y] - pad || y === leftPos[Y] + pad) {
                indexes = this.trackIndices;
            }
            this._drawHorizontalLine(data, PAVEMENT, [leftPos[X], y], length, indexes);
        }
    }

    _drawVerticalTrack(data, topPos, length) {
        const pad = TRACK_WIDTH / 2;
        for (let x = topPos[X] - pad; x <= topPos[X] + pad; x += 1) {
            var indexes;
            if (x === topPos[X] - pad || x === topPos[X] + pad) {
                indexes = this.trackIndices;
            }
            this._drawVerticalLine(data, PAVEMENT, [x, topPos[Y]], length, indexes);
        }
    }

    // indexes is an array that, if present, will be mutated to contain the point indexes
    // where tiles were set
    _drawHorizontalLine(data, tile, leftPos, length, indexes) {
        const x = leftPos[X];
        const y = leftPos[Y];

        for (let pos = x; pos <= x + length; pos += 1) {
            const index = this._convertPointToIndex([pos, y]);
            data[index] = tile;
            if (indexes) {
                indexes.push(index);
            }
        }
    }

    _drawVerticalLine(data, tile, topPos, length, indexes) {
        const x = topPos[X];
        const y = topPos[Y];

        for (let pos = y; pos <= y + length; pos += 1) {
            var index = this._convertPointToIndex([x, pos]);
            data[index] = tile;
            if (indexes) {
                indexes.push(index);
            }
        }
        return indexes;
    }

    _generatePossiblePowerupPoints(data) {
        data.possiblePowerupPoints = [];
        this.trackIndices.forEach(trackIndex => {
            var point = this._convertIndexToPoint(trackIndex);
            point[X] = point[X] * this.template.tilewidth;
            point[Y] = point[Y] * this.template.tileheight;
            data.possiblePowerupPoints.push([point[X], point[Y]]);
        });
    }

    _convertPointToIndex(point) {
        return (point[Y] * this.template.width) + point[X];
    }

    _convertIndexToPoint(index) {
        return [
            index % this.template.width,
            Math.floor(index / this.template.width)
        ];
    };

    _getDistanceBetween(point1, point2) {
        return (
            Math.sqrt(
                Math.pow(point1[X] - point2[X], 2) +
                Math.pow(point1[Y] - point2[Y], 2)
            )
        );
    };

    _getMidpoint(point1, point2) {
        return [
            (point1[X] + point2[X]) / 2,
            (point1[Y] + point2[Y]) / 2,
        ];
    }
}

export default DesertGenerator;
