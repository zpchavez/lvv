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
var GRAVEL_INNER_NW = 6;
var GRAVEL_INNER_N = 7;
var GRAVEL_INNER_NE = 8;
var GRAVEL_INNER_W = 17;
var GRAVEL_INNER_E = 19;
var GRAVEL_INNER_SW = 28;
var GRAVEL_INNER_S = 29;
var GRAVEL_INNER_SE = 30;
var GRAVEL_OUTER_NW = 4;
var GRAVEL_OUTER_NE = 5;
var GRAVEL_OUTER_SW = 15;
var GRAVEL_OUTER_SE = 16;
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

var DesertGenerator = function(options) {
    options = options || {};

    this.options = options;
    this.template = getTemplate({
        height: MAP_SIZE,
        width: MAP_SIZE,
    });
};

DesertGenerator.prototype.generate = function() {
    var data = Object.assign({}, this.template);

    var points = this._plotPoints();
    this._generateTrack(points, data);
    this._generateTrackMarkers(points, data);
    this._generateRoughTerrain(data);

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

DesertGenerator.prototype._generateRoughTerrain = function(data) {
    var background = this._getLayer(data, 'background');
    var rough = this._getLayer(data, 'rough');

    this._fillLayer(rough.data, 0);

    var totalTiles = MAP_SIZE * MAP_SIZE;
    var roughTileCount = Math.round(totalTiles * .25);
    for (i = 0; i < roughTileCount; i += 1) {
        var r = rng.getIntBetween(0, totalTiles);
        if (background.data[r] !== PAVEMENT) {
            background.data[r] = GRAVEL;
            rough.data[r] = 1;
        }
    }
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
