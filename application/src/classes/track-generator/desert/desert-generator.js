var getTemplate = require('./get-desert-template');

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

    // Draw a rect
    var rect = {
        nwPos: [10, 10],
        ewLength: 70,
        nsLength: 70,
        width: 3,
    };

    this._drawHorizontalLine(background.data, PAVEMENT, rect.nwPos, rect.ewLength);
    this._drawVerticalLine(background.data, PAVEMENT, rect.nwPos, rect.nsLength);
    this._drawVerticalLine(background.data, PAVEMENT, [rect.nwPos[0] + rect.ewLength, rect.nwPos[1]], rect.nsLength);
    this._drawHorizontalLine(background.data, PAVEMENT, [rect.nwPos[0], rect.nwPos[1] + rect.nsLength], rect.ewLength);

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
