var getTemplate = require('./get-desert-template');
var rng = require('../../../rng');

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

var DesertGenerator = function(options) {
    this.options = options;
    this.template = getTemplate();
};

DesertGenerator.prototype.generate = function() {
    var data = Object.assign({}, this.template);

    this._generateBackground(data);
    this._generateTrackMarkers(data);

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

DesertGenerator.prototype._generateBackground = function(data) {
    var background = this._getLayer(data, 'background');

    // Start with all sand
    background.data.push.apply(
        background.data,
        (new Array(100 * 100)).fill(SAND)
    );

    var points = this._plotPoints();

    console.log('points', JSON.stringify(points));

    points.forEach(function(point) {
        background.data[point[0] * background.width + point[1]] = PAVEMENT;
    });

    return data;
}

DesertGenerator.prototype._generateTrackMarkers = function(data) {
    var track = this._getLayer(data, 'track');

    track.objects.push(
        {
            "height":32,
            "id":18,
            "name":"finish-line",
            "properties": {},
            "rotation":0,
            "type":"finish-line",
            "visible":true,
            "width":681,
            "x":500,
            "y":2176
        },
        {
         "height":33,
         "id":19,
         "name":"",
         "properties":
            {
             "index":"0"
            },
         "rotation":0,
         "type":"marker",
         "visible":true,
         "width":910,
         "x":500,
         "y":705
        }
    );
    return data;
};

DesertGenerator.prototype._plotPoints = function() {
    // Pick starting point
    var corners = [
        [0, 0],
        [this.template.width, 0],
        [this.template.width, this.template.height],
        [0, this.template.height],
    ];
    var awayFromCornerMultipliers = [
        [1, 1],
        [1, -1],
        [-1, -1],
        [-1, 1],
    ];
    var startingPoint;
    var startingQuadrant = rng.getIntBetween(0,3);
    var corner = corners[startingQuadrant];
    var multiplier = awayFromCornerMultipliers[startingQuadrant];
    var startingPoint = [
        rng.getIntBetween(
            corner[0] + 5 * multiplier[0],
            corner[0] + 15 * multiplier[0]
        ),
        rng.getIntBetween(
            corner[1] + 5 * multiplier[1],
            corner[1] + 15 * multiplier[1]
        )
    ];

    return [
        startingPoint
    ];
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
