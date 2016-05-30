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

// tiles to leave between the track and the world bounds and other parts of the track
var TRACK_BUFFER = 5;
var TRACK_WIDTH  = 5;
var MAP_SIZE     = 200;

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
        (new Array(200 * 200)).fill(SAND)
    );

    // Draw line between all points, including between the first and last
    var drawPoints = points.slice();
    drawPoints.push(points[0]);
    drawPoints.forEach(function(point, index) {
        // background.data[point[0] + (point[1] * background.width)] = PAVEMENT;
        if (index > 0) {
            var prevPoint = points[index - 1];
            if ([NORTH, SOUTH].indexOf(prevPoint[2]) !== -1) {
                this._drawVerticalLine(
                    background.data,
                    PAVEMENT,
                    prevPoint[1] < point[1] ? prevPoint : point,
                    Math.abs(point[1] - prevPoint[1])
                )
            } else {
                this._drawHorizontalLine(
                    background.data,
                    PAVEMENT,
                    prevPoint[0] < point[0] ? prevPoint : point,
                    Math.abs(point[0] - prevPoint[0])
                )
            }
        }
    }.bind(this));

    return data;
}

DesertGenerator.prototype._generateTrackMarkers = function(points, data) {
    var track = this._getLayer(data, 'track');

    var getMarker = function (point, index, isFinish) {
        var id = isFinish ? index : index + 1;

        var adjustment = 5;
        var markerPoint = [point[0], point[1]];
        var multiplier;
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
                multiplier = isFinish ? -1 : 1;
                break;
            case SOUTH:
                multiplier = isFinish ? 1 : -1;
                pointIdx = 1;
                break;
            case EAST:
                multiplier = isFinish ? 1 : -1;
                pointIdx = 0;
                break;
            case WEST:
                multiplier = isFinish ? 1 : -1;
                pointIdx = 0;
                break;
        }
        markerPoint[pointIdx] = point[pointIdx] + (adjustment * multiplier);

        var marker = {
            "id": id,
            "height": this.template.tileheight,
            "width": this.template.tilewidth * TRACK_WIDTH * 3,
            "x": markerPoint[0] * this.template.tilewidth,
            "y": markerPoint[1] * this.template.tileheight,
            "rotation": isFinish ? point[2] : (
                point[2] === 0 ? 270 : point[2] - 90
            ),
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
        [50, MAP_SIZE - 50, NORTH],
        [50, 50, EAST],
        [MAP_SIZE - 50, 50, SOUTH],
        [MAP_SIZE - 50, MAP_SIZE - 50, WEST]
    );

    return points;
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
