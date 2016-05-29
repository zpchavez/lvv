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

var NORTH = 0;
var EAST = 90;
var SOUTH = 180;
var WEST = 270;

var DesertGenerator = function(options) {
    options = options || {};

    _(options).defaults({
        trackWidth: 5
    });

    this.options = options;
    this.template = getTemplate();
};

DesertGenerator.prototype.generate = function() {
    var data = Object.assign({}, this.template);

    var points = this._plotPoints();
    this._generateBackground(points, data);
    this._generateTrackMarkers(points, data);

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

DesertGenerator.prototype._generateBackground = function(points, data) {
    var background = this._getLayer(data, 'background');

    // Start with all sand
    background.data.push.apply(
        background.data,
        (new Array(100 * 100)).fill(SAND)
    );

    console.log('points', JSON.stringify(points));

    points.forEach(function(point) {
        background.data[point[0] + (point[1] * background.width)] = PAVEMENT;
    });

    return data;
}

DesertGenerator.prototype._generateTrackMarkers = function(points, data) {
    var track = this._getLayer(data, 'track');

    var getMarker = function (point, index, isFinish) {
        var id = isFinish ? index : index + 1;

        var marker = {
            "id": id,
            "height": this.template.tileheight,
            "width": this.template.tilewidth * this.options.trackWidth * 3,
            "x": point[0] * this.template.tilewidth,
            "y": point[1] * this.template.tileheight,
            "rotation": point[2],
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

    console.log('points', track.objects);

    return data;
};

DesertGenerator.prototype._plotPoints = function() {
    // tiles to leave between the track and the world bounds and other parts of the track
    var TRACK_BUFFER = 5;
    var points = [];
    var corners = [
        [0, 0],
        [this.template.width, 0],
        [this.template.width, this.template.height],
        [0, this.template.height],
    ];
    var awayFromCornerMultipliers = [
        [1, 1],
        [-1, 1],
        [-1, -1],
        [1, -1],
    ];
    var quadrantDirection = [EAST, SOUTH, WEST, NORTH];
    var startingPoint;
    var startingQuadrant = rng.getIntBetween(0,3);
    var corner = corners[startingQuadrant];
    var multiplier = awayFromCornerMultipliers[startingQuadrant];

    var startingPoint = [
        rng.getIntBetween(
            corner[0] + (TRACK_BUFFER * multiplier[0]),
            corner[0] + ((TRACK_BUFFER + 10) * multiplier[0])
        ),
        rng.getIntBetween(
            corner[1] + (TRACK_BUFFER * multiplier[1]),
            corner[1] + ((TRACK_BUFFER + 10) * multiplier[1])
        ),
        quadrantDirection[startingQuadrant]
    ];
    points.push(startingPoint);

    var plotNextPoint = function (retry) {
        retry = retry || 0;
        if (retry > 100) {
            throw new Error('too many retries');
        }

        var nextPoint;
        var prevPoints = points.slice().reverse();
        var nextDirection;
        switch (prevPoints[0]) {
            case NORTH:
                if (prevPoints[1] === null) {
                    nextDirection = EAST;
                } else {
                    nextDirection = rng.pickValueFromArray([EAST, WEST]);
                }
                break;
            case EAST:
                if (prevPrevPoint === null) {
                    nextDirection = SOUTH;
                } else {
                    nextDirection = rng.pickValueFromArray([NORTH, SOUTH]);
                }
                break;
            case SOUTH:
                if (prevPoints[1] === null) {
                    nextDirection = WEST;
                } else {
                    nextDirection = rng.pickValueFromArray([EAST, WEST]);
                }
                break;
            case WEST:
                if (prevPrevPoint === null) {
                    nextDirection = NORTH;
                } else {
                    nextDirection = rng.pickValueFromArray([NORTH, SOUTH]);
                }
                break;
        }

        switch (nextDirection) {
            case EAST:
                nextPoint = [
                    prevPoint[0],
                    rng.getIntBetween(prevPoint[1] - 30, TRACK_BUFFER),
                    EAST,
                ];
                break;
            case WEST:
                nextPoint = [
                    prevPoint[0],
                    rng.getIntBetween(prevPoint[1] + 30, this.template.height - TRACK_BUFFER),
                    WEST
                ];
                break;
            case SOUTH:
                nextPoint = [
                    rng.getIntBetween(prevPoint[0] + 30, this.template.width - TRACK_BUFFER),
                    prevPoint[1],
                    SOUTH,
                ];
                break;
            case NORTH:
                nextPoint = [
                    rng.getIntBetween(prevPoint[0] - 30, TRACK_BUFFER),
                    prevPoint[1],
                    NORTH,
                ];
                break;
        }

        if (this._isValidNextPoint(points, nextPoint)) {
            return nextPoint;
        } else {
            return plotNextPoint(retries + 1);
        }
    }.bind(this);

    var loops = 0;
    while (! this._pointsAreCompletable(points)) {
        if (loops > 500) {
            throw new Error('trying too hard');
        }
        points.push(plotNextPoint());
        loops += 1;
    }

    return points;
};

DesertGenerator.prototype._isValidNextPoint = function(points, nextPoint) {

};

DesertGenerator.prototype._pointsAreCompletable = function(points) {

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
