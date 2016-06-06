var getTemplate = require('./get-desert-template');
var rng = require('../../../rng');
var _ = require('underscore');

var SAND = 39;
var PAVEMENT = 46;
var GRAVEL = 18;
var PIT = 21;

var NORTH = 0;
var EAST = 90;
var SOUTH = 180;
var WEST = 270;

var TRACK_WIDTH  = 6;
var MAP_SIZE     = 600;

var EMBEL_NONE = 'EMBEL_NONE';
var EMBEL_T = 'EMBEL_T';
var INWARD = 'INWARD';
var OUTWARD = 'OUTWARD';
var LEFT = 'LEFT';
var RIGHT = 'RIGHT';

// Args for getAdjacentTileIndex
var N = 'N';
var W = 'W';
var NE = 'NE';
var NW = 'NW';
var E = 'E';
var S = 'S';
var SE = 'SE';
var SW = 'SW';

// constants for point arrays
var X = 0;
var Y = 1;
var ANGLE = 2;

var edges = {};
edges[GRAVEL] = {
    EDGE_NW: 6,
    EDGE_N: 7,
    EDGE_NE: 8,
    EDGE_W: 17,
    EDGE_E: 19,
    EDGE_SW: 28,
    EDGE_S: 29,
    EDGE_SE: 30,
    CORNER_NW: 16,
    CORNER_NE: 15,
    CORNER_SW: 5,
    CORNER_SE: 4,
};
edges[PIT] = {
    EDGE_NW: 9,
    EDGE_N: 10,
    EDGE_NE: 11,
    EDGE_W: 20,
    EDGE_E: 22,
    EDGE_SW: 31,
    EDGE_S: 32,
    EDGE_SE: 33,
    CORNER_NW: 54,
    CORNER_NE: 53,
    CORNER_SW: 43,
    CORNER_SE: 42,
}
edges[PAVEMENT] = {
    EDGE_NW: 34,
    EDGE_N: 35,
    EDGE_NE: 36,
    EDGE_W: 45,
    EDGE_E: 47,
    EDGE_SW: 56,
    EDGE_S: 57,
    EDGE_SE: 58,
    CORNER_SE: 48,
    CORNER_NW: 60,
    CORNER_NE: 59,
    CORNER_SW: 49,
}

var DesertGenerator = function(options) {
    options = options || {};

    this.options = options;
    this.template = getTemplate({
        height: MAP_SIZE,
        width: MAP_SIZE,
    });
    this.gravelIndices = [];
    this.pitIndices = [];
    this.trackIndices = [];
};

DesertGenerator.prototype.generate = function() {
    var data = Object.assign({}, this.template);

    var points = this._plotPoints();
    this._generateTrack(points, data);
    this._generateTrackMarkers(points, data);
    this._generateGravel(data);
    this._generatePits(data);
    this._addEdgeTiles(data, this.gravelIndices, GRAVEL);
    this._addEdgeTiles(data, this.pitIndices, PIT);
    this._addEdgeTiles(data, this.trackIndices, PAVEMENT);

    return data;
};

DesertGenerator.prototype._getLayer = function(data, name) {
    var returnedLayer;

    data.layers.forEach(function(layer) {
        if (layer.name === name) {
            returnedLayer = layer;
        }
    });

    return returnedLayer;
};

DesertGenerator.prototype._fillLayer = function(layerData, value) {
    // Do it in batches to avoid "max call stack exceeded"
    var totalTiles = MAP_SIZE * MAP_SIZE;
    for (var i = 0; i < MAP_SIZE; i += 1) {
        layerData.push.apply(
            layerData,
            (new Array(MAP_SIZE)).fill(value)
        );
    }
};

DesertGenerator.prototype._addEdgeTiles = function(data, tileIndices, tile) {
    tileIndices.forEach(function (index) {
        var adj = this._getAdjacentTileIndex.bind(this);
        var bg = this._getLayer(data, 'background').data;
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
    }.bind(this));
};

DesertGenerator.prototype._generateTrack = function(points, data) {
    var background = this._getLayer(data, 'background');

    this._fillLayer(background.data, SAND);

    // Draw line between all points, including between the first and last
    var drawPoints = points.slice();
    drawPoints.push(points[0]);
    drawPoints.forEach(function(point, index) {
        if (index > 0) {
            var prevPoint = points[index - 1];
            if ([NORTH, SOUTH].indexOf(prevPoint[ANGLE]) !== -1) {
                this._drawVerticalTrack(
                    background.data,
                    // PAVEMENT,
                    prevPoint[Y] < point[Y] ? prevPoint : point,
                    Math.abs(point[Y] - prevPoint[Y])
                )
            } else {
                var leftPoint = (prevPoint[X] < point[X] ? prevPoint : point).slice();
                leftPoint[X] -= 3; // -3 to fill in corners
                this._drawHorizontalTrack(
                    background.data,
                    leftPoint,
                    Math.abs(point[X] - prevPoint[X]) + 6 // +6 to fill in corners
                )
            }
        }
    }.bind(this));

    return data;
}

DesertGenerator.prototype._generateGravel = function(data) {
    var background = this._getLayer(data, 'background');
    var rough = this._getLayer(data, 'rough');

    this._fillLayer(rough.data, 0);

    // Debug: Add a single patch right by the starting line
    // var startPatchPoint = 150 + (MAP_SIZE * (MAP_SIZE - 150)) - 10;
    // this._generatePatch(
    //     startPatchPoint,
    //     background.data,
    //     GRAVEL,
    //     rough.data,
    //     1,
    //     this.gravelIndices
    // );

    var totalTiles = MAP_SIZE * MAP_SIZE;
    var gravelCount = Math.round(totalTiles * .015);
    for (i = 0; i < gravelCount; i += 1) {
        this._generatePatch(
            rng.getIntBetween(0, totalTiles),
            background.data,
            GRAVEL,
            rough.data,
            1,
            this.gravelIndices
        );
    }
};

DesertGenerator.prototype._generatePits = function(data) {
    var background = this._getLayer(data, 'background');
    var drops = this._getLayer(data, 'drops');

    this._fillLayer(drops.data, 0);

    var totalTiles = MAP_SIZE * MAP_SIZE;
    var pitCount = Math.round(totalTiles * .005);
    for (i = 0; i < pitCount; i += 1) {
        this._generatePatch(
            rng.getIntBetween(0, totalTiles),
            background.data,
            PIT,
            drops.data,
            1,
            this.pitIndices
        );
    }
};

DesertGenerator.prototype._generatePatch = function(
    pointIndex, backgroundData, backgroundTile, layerData, layerTile, tileIndices
) {
     if (backgroundData[pointIndex] !== SAND) {
         return false;
     }

     var tooCloseToAnotherSpecialTile = function(tileIndex) {
         var adj = this._getAdjacentTileIndex.bind(this);
         var bg = backgroundData;
         var tooClose = false;

         // Tile can't be touching a non-sand, non-patch-type tile
         [N, S, E, W, NE, NW, SE, SW].forEach(function (direction) {
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
     }.bind(this);

     // Add the center point
     if (! tooCloseToAnotherSpecialTile(pointIndex)) {
         backgroundData[pointIndex] = backgroundTile;
         layerData[pointIndex] = layerTile;
         tileIndices.push(pointIndex);
     }

     var checkedIndexes = [];
     var addPatchPoints = function(centerIndex, chance) {
         if (chance <= 0 || ! chance) {
             return;
         }

         var possiblePoints = this._getSurroundingAreas(centerIndex, checkedIndexes);
         possiblePoints.forEach(function (possiblePointIndex) {
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
     }.bind(this);

     addPatchPoints(pointIndex, .9);
}

DesertGenerator.prototype._getAdjacentTileIndex = function(tileIndex, direction) {
    var adjacentTileIndex = false;

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
};

DesertGenerator.prototype._getSurroundingAreas = function(tileIndex, excludedIndexes) {
    excludedIndexes = excludedIndexes || [];

    var surroundingAreas = [
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
    surroundingAreas = surroundingAreas.filter(function (surroundingTileIndex) {
        return (
            surroundingTileIndex !== false &&
            excludedIndexes.indexOf(surroundingTileIndex) === -1
        );
    });

    return surroundingAreas;
};

DesertGenerator.prototype._generateTrackMarkers = function(points, data) {
    var track = this._getLayer(data, 'track');

    var getMarker = function (point, index, isFinish) {
        var id = isFinish ? index : index + 1;

        var markerPoint = [point[X], point[Y]];
        var coordinateMultiplier;
        var rotationMultiplier;
        var pointIdx;
        var prevPoint = isFinish ? points[points.length - 1] : points[index];
        var headedFromDirection;
        if (isFinish) {
            headedFromDirection = point[ANGLE];
        }  else {
            headedFromDirection = prevPoint[ANGLE]
        }
        switch (headedFromDirection) {
            case NORTH:
                pointIdx = 1;
                coordinateMultiplier = isFinish ? -1 : 1;
                rotationMultiplier = point[ANGLE] === EAST ? -1 : 1;
                break;
            case SOUTH:
                coordinateMultiplier = isFinish ? 1 : -1;
                pointIdx = 1;
                rotationMultiplier = point[ANGLE] === EAST ? 1 : -1;
                break;
            case EAST:
                coordinateMultiplier = isFinish ? 1 : -1;
                pointIdx = 0;
                rotationMultiplier = point[ANGLE] === SOUTH ? -1 : 1;
                break;
            case WEST:
                coordinateMultiplier = isFinish ? -1 : 1;
                pointIdx = 0;
                rotationMultiplier = point[ANGLE] === SOUTH ? 1 : -1;
                break;
        }
        var adjustment = 5;
        markerPoint[pointIdx] = point[pointIdx] + (adjustment * coordinateMultiplier);

        // I might be able to do this neater by putting the directions in an array
        // and mathing the indexes
        var markerRotation;
        if (isFinish) {
            markerRotation = point[ANGLE];
        } else if (rotationMultiplier === -1 && point[ANGLE] === 0) {
            markerRotation = 270;
        } else if (rotationMultiplier === 1 && point[ANGLE] === 270) {
            markerRotation = 0;
        } else {
            markerRotation = point[ANGLE] + (90 * rotationMultiplier)
        }

        var marker = {
            "id": id,
            "height": this.template.tileheight,
            "width": this.template.tilewidth * TRACK_WIDTH * 3,
            "x": markerPoint[X] * this.template.tilewidth,
            "y": markerPoint[Y] * this.template.tileheight,
            "rotation": markerRotation,
            "visible":true,
        };

        if (isFinish) {
            marker.name = 'finish-line';
            marker.type = 'finish-line';
        } else {
            marker.name = '';
            marker.properties = { index: index };
        }

        return marker;
    }.bind(this);

    track.objects.push(getMarker(points[0], 0, true));

    points.slice(1).forEach(function (point, index) {
        track.objects.push(getMarker(point, index));
    });

    return data;
};

DesertGenerator.prototype._plotPoints = function() {
    // Start with a plain rectangle
    var points = [];

    points.push(
        [150, MAP_SIZE - 150, NORTH],
        [150, 150, EAST],
        [MAP_SIZE - 150, 150, SOUTH],
        [MAP_SIZE - 150, MAP_SIZE - 150, WEST]
    );

    this._embellishTrack(points);

    return points;
};

DesertGenerator.prototype._embellishTrack = function(points) {
    var embellishmentTypes = [
        EMBEL_NONE,
        EMBEL_T,
    ];
    var centerEmbellishments = [
        rng.pickValueFromArray(embellishmentTypes),
        rng.pickValueFromArray(embellishmentTypes),
        rng.pickValueFromArray(embellishmentTypes),
        rng.pickValueFromArray(embellishmentTypes),
    ];

    var addedPoints = 0;
    centerEmbellishments.forEach(function (embelType, index) {
        addedPoints += this._addEmbellishment(
            points,
            embelType,
            rng.pickValueFromArray([INWARD, OUTWARD]),
            addedPoints + index
        );
    }.bind(this));
};

// Mutates 'points' and returns the number of points added
DesertGenerator.prototype._addEmbellishment = function(points, type, orientation, index) {
    if (type === EMBEL_NONE) {
        return 0;
    }

    // Get the midpoint
    var lineStart = points[index];
    var lineEnd   = points.length === index + 1 ? points[0] : points[index + 1];
    var midpoint = [
        (lineStart[X] + lineEnd[X]) / 2,
        (lineStart[Y] + lineEnd[Y]) / 2,
    ];
    var headingDirection = lineStart[ANGLE];
    var inward = orientation === INWARD;
    switch (headingDirection) {
        case NORTH:
            midpoint[Y] -= 10;
            midpoint[ANGLE] = inward ? EAST : WEST;
            break;
        case SOUTH:
            midpoint[Y] -= 10;
            midpoint[ANGLE] = inward ? WEST : EAST;
            break;
        case EAST:
            midpoint[X] -= 10;
            midpoint[ANGLE] = inward ? SOUTH : NORTH;
            break;
        case WEST:
            midpoint[X] -= 10;
            midpoint[ANGLE] = inward ? NORTH : SOUTH;
            break;
    }
    var embellishment = [];

    switch (type) {
        case EMBEL_T:
            embellishment = this._plotPointsLogoStyle(
                midpoint,
                [
                    30,
                    inward ? RIGHT : LEFT,
                    30,
                    inward ? LEFT : RIGHT,
                    30,
                    inward ? LEFT : RIGHT,
                    90,
                    inward ? LEFT : RIGHT,
                    30,
                    inward ? LEFT : RIGHT,
                    30,
                    inward ? RIGHT : LEFT,
                    30,
                    inward ? RIGHT : LEFT,
                ]
            )
            break;
    }

    points.splice.apply(points, [index + 1, 0].concat(embellishment));
    return embellishment.length;
};

DesertGenerator.prototype._plotPointsLogoStyle = function(startingPoint, instructions) {
    var points = [startingPoint];

    var cursor = startingPoint.slice();
    instructions.forEach(function (instruction) {
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
};

DesertGenerator.prototype._drawHorizontalTrack = function(data, leftPos, length) {
    var pad = TRACK_WIDTH / 2;
    for (var y = leftPos[Y] - pad; y <= leftPos[Y] + pad; y += 1) {
        var indexes;
        if (y === leftPos[Y] - pad || y === leftPos[Y] + pad) {
            indexes = this.trackIndices;
        }
        this._drawHorizontalLine(data, PAVEMENT, [leftPos[X], y], length, indexes);
    }
};

DesertGenerator.prototype._drawVerticalTrack = function(data, topPos, length) {
    var pad = TRACK_WIDTH / 2;
    for (var x = topPos[X] - pad; x <= topPos[X] + pad; x += 1) {
        var indexes;
        if (x === topPos[X] - pad || x === topPos[X] + pad) {
            indexes = this.trackIndices;
        }
        this._drawVerticalLine(data, PAVEMENT, [x, topPos[Y]], length, indexes);
    }
};

// indexes is an array that, if present, will be mutated to contain the point indexes
// where tiles were set
DesertGenerator.prototype._drawHorizontalLine = function(data, tile, leftPos, length, indexes) {
    var x = leftPos[X];
    var y = leftPos[Y];

    for (var pos = x; pos <= x + length; pos += 1) {
        var index = this._convertPointToIndex([pos, y]);
        data[index] = tile;
        if (indexes) {
            indexes.push(index);
        }
    }
};

DesertGenerator.prototype._drawVerticalLine = function(data, tile, topPos, length, indexes) {
    var x = topPos[X];
    var y = topPos[Y];

    for (var pos = y; pos <= y + length; pos += 1) {
        var index = this._convertPointToIndex([x, pos]);
        data[index] = tile;
        if (indexes) {
            indexes.push(index);
        }
    }
    return indexes;
};

DesertGenerator.prototype._convertPointToIndex = function(point) {
    return (point[Y] * this.template.width) + point[X];
};

module.exports = DesertGenerator;
