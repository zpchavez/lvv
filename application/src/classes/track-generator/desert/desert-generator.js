var getTemplate = require('./get-desert-template');

var DESERT = 39;
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

var DesertGenerator = function(options) {
    this.options = options;
    this.template = getTemplate();
};

DesertGenerator.prototype.generate = function() {
    var data = Object.assign({}, this.template);

    var background = this._getLayer(data, 'background');
    background.data.push.apply(
        background.data,
        (new Array(100 * 100)).fill(39)
    );

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
            "x":90,
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
         "x":18,
         "y":705
        }
    );

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

module.exports = DesertGenerator;
