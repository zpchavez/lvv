var getTemplate = require('./get-desert-template');
var rng = require('../../../rng');
var _ = require('underscore');

var SAND = 39;
var PAVEMENT = 46;
var PAVEMENT_INNER_NW = 34;
var PAVEMENT_INNER_N = 35;
var PAVEMENT_INNER_NE = 36;
var PAVEMENT_INNER_W = 45;
var PAVEMENT_INNER_E = 47;
var PAVEMENT_INNER_SW = 56;
var PAVEMENT_INNER_W = 57;
var PAVEMENT_INNER_SE = 58;
var PAVEMENT_OUTER_NW = 48;
var PAVEMENT_OUTER_NE = 49;
var PAVEMENT_OUTER_SW = 59;
var PAVEMENT_OUTER_SE = 60;
var GRAVEL = 18;
var GRAVEL_EDGE_NW = 6;
var GRAVEL_EDGE_N = 7;
var GRAVEL_EDGE_NE = 8;
var GRAVEL_EDGE_W = 17;
var GRAVEL_EDGE_E = 19;
var GRAVEL_EDGE_SW = 28;
var GRAVEL_EDGE_S = 29;
var GRAVEL_EDGE_SE = 30;
var GRAVEL_CORNER_SE = 4;
var GRAVEL_CORNER_SW = 5;
var GRAVEL_CORNER_NE = 15;
var GRAVEL_CORNER_NW = 16;
var PIT = 21;

var NORTH = 0;
var EAST = 90;
var SOUTH = 180;
var WEST = 270;

var TRACK_WIDTH  = 5;
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

var edges = {};
edges[GRAVEL] = {
    EDGE_NW: GRAVEL_EDGE_NW,
    EDGE_N: GRAVEL_EDGE_N,
    EDGE_NE: GRAVEL_EDGE_NE,
    EDGE_W: GRAVEL_EDGE_W,
    EDGE_E: GRAVEL_EDGE_E,
    EDGE_SW: GRAVEL_EDGE_SW,
    EDGE_S: GRAVEL_EDGE_S,
    EDGE_SE: GRAVEL_EDGE_SE,
    CORNER_NW: GRAVEL_CORNER_NW,
    CORNER_NE: GRAVEL_CORNER_NE,
    CORNER_SW: GRAVEL_CORNER_SW,
    CORNER_SE: GRAVEL_CORNER_SE,
};

var DesertGenerator = function(options) {
    options = options || {};

    this.options = options;
    this.template = getTemplate({
        height: MAP_SIZE,
        width: MAP_SIZE,
    });
    this.gravelIndices = [];
    this.pitIndices = [];
};

DesertGenerator.prototype.generate = function() {
    var data = Object.assign({}, this.template);

    var points = this._plotPoints();
    this._generateTrack(points, data);
    this._generateTrackMarkers(points, data);
    this._generateGravel(data);
    this._generatePits(data);
    this._addEdgeTiles(data, this.gravelIndices, GRAVEL);

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
            if ([NORTH, SOUTH].indexOf(prevPoint[2]) !== -1) {
                this._drawVerticalTrack(
                    background.data,
                    // PAVEMENT,
                    prevPoint[1] < point[1] ? prevPoint : point,
                    Math.abs(point[1] - prevPoint[1])
                )
            } else {
                var leftPoint = (prevPoint[0] < point[0] ? prevPoint : point).slice();
                leftPoint[0] -= 3; // -3 to fill in corners
                this._drawHorizontalTrack(
                    background.data,
                    leftPoint,
                    Math.abs(point[0] - prevPoint[0]) + 7 // +7 to fill in corners
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

        var markerPoint = [point[0], point[1]];
        var coordinateMultiplier;
        var rotationMultiplier;
        var pointIdx;
        var prevPoint = isFinish ? points[points.length - 1] : points[index];
        var headedFromDirection;
        if (isFinish) {
            headedFromDirection = point[2];
        }  else {
            headedFromDirection = prevPoint[2]
        }
        switch (headedFromDirection) {
            case NORTH:
                pointIdx = 1;
                coordinateMultiplier = isFinish ? -1 : 1;
                rotationMultiplier = point[2] === EAST ? -1 : 1;
                break;
            case SOUTH:
                coordinateMultiplier = isFinish ? 1 : -1;
                pointIdx = 1;
                rotationMultiplier = point[2] === EAST ? 1 : -1;
                break;
            case EAST:
                coordinateMultiplier = isFinish ? 1 : -1;
                pointIdx = 0;
                rotationMultiplier = point[2] === SOUTH ? -1 : 1;
                break;
            case WEST:
                coordinateMultiplier = isFinish ? -1 : 1;
                pointIdx = 0;
                rotationMultiplier = point[2] === SOUTH ? 1 : -1;
                break;
        }
        var adjustment = 5;
        markerPoint[pointIdx] = point[pointIdx] + (adjustment * coordinateMultiplier);

        // I might be able to do this neater by putting the directions in an array
        // and mathing the indexes
        var markerRotation;
        if (isFinish) {
            markerRotation = point[2];
        } else if (rotationMultiplier === -1 && point[2] === 0) {
            markerRotation = 270;
        } else if (rotationMultiplier === 1 && point[2] === 270) {
            markerRotation = 0;
        } else {
            markerRotation = point[2] + (90 * rotationMultiplier)
        }

        var marker = {
            "id": id,
            "height": this.template.tileheight,
            "width": this.template.tilewidth * TRACK_WIDTH * 3,
            "x": markerPoint[0] * this.template.tilewidth,
            "y": markerPoint[1] * this.template.tileheight,
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
        (lineStart[0] + lineEnd[0]) / 2,
        (lineStart[1] + lineEnd[1]) / 2,
    ];
    var headingDirection = lineStart[2];
    var inward = orientation === INWARD;
    switch (headingDirection) {
        case NORTH:
            midpoint[1] -= 10;
            midpoint[2] = inward ? EAST : WEST;
            break;
        case SOUTH:
            midpoint[1] -= 10;
            midpoint[2] = inward ? WEST : EAST;
            break;
        case EAST:
            midpoint[0] -= 10;
            midpoint[2] = inward ? SOUTH : NORTH;
            break;
        case WEST:
            midpoint[0] -= 10;
            midpoint[2] = inward ? NORTH : SOUTH;
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
            switch (cursor[2]) {
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
                cursor[2] = cursor[2] === 0 ? 270 : cursor[2] - 90;
            } else {
                cursor[2] = cursor[2] === 270 ? 0 : cursor[2] + 90;
            }
            points.push(cursor.slice());
        } else {
            throw new Error('Unknown instruction: ' + instruction);
        }
    });

    return points;
};

DesertGenerator.prototype._drawHorizontalTrack = function(data, leftPos, length) {
    for (var y = leftPos[1] - 3; y <= leftPos[1] + 3; y += 1) {
        this._drawHorizontalLine(data, PAVEMENT, [leftPos[0], y], length);
    }
};

DesertGenerator.prototype._drawVerticalTrack = function(data, topPos, length) {
    for (var x = topPos[0] - 3; x <= topPos[0] + 3; x += 1) {
        this._drawVerticalLine(data, PAVEMENT, [x, topPos[1]], length);
    }
};

DesertGenerator.prototype._drawHorizontalLine = function(data, tile, leftPos, length) {
    var x = leftPos[0];
    var y = leftPos[1];
    data.splice.apply(data, [
        (this.template.width * y) + x,
        length,
    ].concat(new Array(length).fill(tile)));
};

DesertGenerator.prototype._drawVerticalLine = function(data, tile, topPos, length) {
    var x = topPos[0];
    var y = topPos[1];

    for (var pos = y; pos <= y + length; pos += 1) {
        data[(pos * this.template.width) + x] = tile;
    }
};

module.exports = DesertGenerator;
