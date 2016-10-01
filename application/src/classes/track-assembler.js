'use strict';

var _   = require('underscore');
var rng = require('../rng');

var TrackAssembler = function(segmentData)
{
    this.segmentData = segmentData;

    this.numRows = segmentData.length;
    this.numCols = segmentData[0].length;

    this.firstSegment = this.segmentData[0][0];

    this.segmentHeight = this.firstSegment.height;
    this.segmentWidth  = this.firstSegment.width;

    this.finalData = _.extend({}, this.firstSegment);

    this.finalData.height = this.segmentHeight * this.numRows;
    this.finalData.width  = this.segmentWidth * this.numCols;

    this.segmentPixelWidth = this.segmentWidth * this.firstSegment.tilewidth;
    this.segmentPixelHeight = this.segmentHeight * this.firstSegment.tileheight;
};

TrackAssembler.prototype._numberSegmentsInClockwiseOrder = function()
{
    var segmentCounter = 0,
        colCounter     = 0,
        rowCounter     = 0;

    // From top left to top right
    for (colCounter = 0; colCounter < this.numCols; colCounter += 1) {
        this.segmentData[rowCounter][colCounter].segmentNumber = segmentCounter;
        segmentCounter += 1;
    }

    // From top right to bottom right
    colCounter = this.numCols - 1;
    for (rowCounter = 1; rowCounter < this.numRows; rowCounter += 1) {
        this.segmentData[rowCounter][colCounter].segmentNumber = segmentCounter;
        segmentCounter += 1;
    }

    // From bottom right to bottom left
    rowCounter = this.numRows - 1;
    for (;colCounter >= 0; colCounter -= 1) {
        if (_(this.segmentData[rowCounter][colCounter].segmentNumber).isNumber()) {
            continue;
        }
        this.segmentData[rowCounter][colCounter].segmentNumber = segmentCounter;
        segmentCounter += 1;
    }

    // From bottom left to top left
    colCounter = 0;
    for (;rowCounter >= 0; rowCounter -= 1) {
        if (_(this.segmentData[rowCounter][colCounter].segmentNumber).isNumber()) {
            continue;
        }
        this.segmentData[rowCounter][colCounter].segmentNumber = segmentCounter;
        segmentCounter += 1;
    }
};

TrackAssembler.prototype._combineLayers = function()
{
    var layers = [], self = this;

    this.firstSegment.layers.forEach(function (layer) {
        layer.width  = self.finalData.width;
        layer.height = self.finalData.height;
        if (layer.type === 'tilelayer') {
            var rowData = [];
            self.segmentData.forEach(function (row) {
                _.range(0, self.segmentHeight).forEach(function (layerRowNumber) {
                    row.forEach(function (segment) {
                        var segmentData = _(segment.layers).findWhere({name : layer.name}).data;
                        rowData = rowData.concat(
                            segmentData.slice(
                                layerRowNumber * self.segmentWidth,
                                layerRowNumber * self.segmentWidth + self.segmentWidth
                            )
                        );
                    });
                });
            });
            layer.data = rowData;
            layers.push(layer);
        } else if (layer.type === 'objectgroup') {
            var updatedObjects = [];
            self.segmentData.forEach(function (row, rowNum) {
                row.forEach(function (segment, colNum) {
                    var segmentObjects = _(segment.layers).findWhere({name : layer.name}).objects;
                    segmentObjects.forEach(function (object) {
                        // Update position based on segment
                        object.x = object.x + (self.segmentPixelWidth * colNum);
                        object.y = object.y + (self.segmentPixelHeight * rowNum);
                        object.segmentNumber = segment.segmentNumber;
                        updatedObjects.push(object);
                    });
                });
            });
            layer.objects = updatedObjects;
            layers.push(layer);
        }
    });

    // Add imagelayers and update their positions based on which segment they appear in
    self.segmentData.forEach(function (row, rowNum) {
        row.forEach(function (segment, colNum) {
            var imageLayers = _(segment.layers).where({type : 'imagelayer'}) || [];
            imageLayers.forEach(function (imageLayer) {
                imageLayer.x = imageLayer.x + (self.segmentPixelWidth * colNum);
                imageLayer.y = imageLayer.y + (self.segmentPixelHeight * rowNum);
                // Every image layer is it's own thing. They aren't combined.
                layers.push(_.extend({}, imageLayer));
            });
        });
    });

    this.finalData.layers = layers;
};

TrackAssembler.prototype._setUpTrackMarkers = function()
{
    var trackLayer,
        finishLineCandidateIndexes = [],
        selectedFinishLineMarkerIndex,
        sortedTrackObjects,
        finishLineIndex,
        totalMarkers,
        finalTrackObjects;

    // Pick a finish line and number the markers accordingly.
    trackLayer = _(this.finalData.layers).findWhere({name : 'track'});
    trackLayer.objects.forEach(function (marker, index) {
        if (parseInt(marker.properties['finish-line-candidate'], 10)) {
            finishLineCandidateIndexes.push(index);
        }
    });
    selectedFinishLineMarkerIndex = rng.pickValueFromArray(finishLineCandidateIndexes);

    // Set the finish line as a finish line
    trackLayer.objects[selectedFinishLineMarkerIndex].name = 'finish-line';

    // Set track marker indexes

    sortedTrackObjects = _(trackLayer.objects).sortBy(function (marker) {
        // Ensure that all the markers from one segment precede any from the next segment.
        // The 100 multiplier ensures this will work unless there are more than 100 markers
        // in one segment.
        return marker.segmentNumber * (100 + parseInt(marker.properties.index, 10) + 1);
    });

    // Find where the finish line appears in the sorted list.
    finishLineIndex = _(sortedTrackObjects).findIndex({name : 'finish-line'});
    totalMarkers = trackLayer.objects.length;

    finalTrackObjects = sortedTrackObjects.map(function (object, index) {
        if (index < finishLineIndex) {
            object.properties.index = totalMarkers - 1 - finishLineIndex + index;
        } else if (index > finishLineIndex) {
            object.properties.index = index - finishLineIndex - 1;
        }
        return object;
    });
};

TrackAssembler.prototype.assemble = function()
{
    this._numberSegmentsInClockwiseOrder();

    this._combineLayers();

    this._setUpTrackMarkers();

    return this.finalData;
};

module.exports = TrackAssembler;
