/* global describe, it, beforeEach */
/* jshint expr: true */
'use strict';

var TrackAssembler = require('../../../../application/src/classes/track-assembler');
var expect         = require('chai').expect;
var proxyquire     = require('proxyquireify')(require);

var getTrackAssemblerWithMockedRngThatReturnsIndex = function(index) {
    return proxyquire(
        '../../../../application/src/classes/track-assembler',
        {
            // Return not-so-random RNG object
            '../rng' : {
                pickValueFromArray : function (array) {
                    return array[index];
                }
            }
        }
    );
};

describe('TrackAssembler', function () {
    beforeEach(function () {

    });

    var getSegmentDataWithOneRowAndTwoColumns = function()
    {
        return [
            [
                {
                    tilewidth  : 32,
                    tileheight : 32,
                    height     : 2,
                    width      : 2,
                    layers     : [
                        {
                            name : 'background',
                            type : 'tilelayer',
                            data : [0, 0, 0, 0]
                        },
                        {
                            name    : 'track',
                            type    : 'objectgroup',
                            objects : [
                                {
                                    x : 0,
                                    y : 0,
                                    properties : {
                                        'finish-line-candidate' : '1',
                                        index                   : '0'
                                    }
                                },
                                {
                                    x : 10,
                                    y : 10,
                                    properties : {
                                        'finish-line-candidate' : '1',
                                        index                   : '1'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    tilewidth  : 32,
                    tileheight : 32,
                    height     : 2,
                    width      : 2,
                    layers     : [
                        {
                            name : 'background',
                            type : 'tilelayer',
                            data : [1, 1, 1, 1]
                        },
                        {
                            name    : 'track',
                            type    : 'objectgroup',
                            objects : [
                                {
                                    x : 0,
                                    y : 0,
                                    properties : {
                                        'finish-line-candidate' : '1',
                                        index                   : '0'
                                    }
                                },
                                {
                                    x : 10,
                                    y : 10,
                                    properties : {
                                        'finish-line-candidate' : '1',
                                        index                   : '1'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        ];
    };

    var getSegmentDataWithTwoRowsAndTwoColumns = function()
    {
        var rowData;

        rowData = getSegmentDataWithOneRowAndTwoColumns()[0];

        return JSON.parse(JSON.stringify([
            rowData,
            rowData
        ]));
    };

    describe('assemble', function() {
        it('combines layers correctly for single row, two column track', function() {
            var trackAssembler, assembledData;

            trackAssembler = new TrackAssembler(getSegmentDataWithOneRowAndTwoColumns());
            assembledData  = trackAssembler.assemble();

            expect(assembledData.layers[0].data).to.eql([0, 0, 1, 1, 0, 0, 1, 1]);
        });

        it('updates x coordinate for objects in second column', function() {
            var trackAssembler, assembledData;

            trackAssembler = new TrackAssembler(getSegmentDataWithOneRowAndTwoColumns());
            assembledData  = trackAssembler.assemble();

            // objects in first column are already correct
            expect(assembledData.layers[1].objects[0].x).to.equal(0);
            expect(assembledData.layers[1].objects[0].y).to.equal(0);
            // objects in second column have x values adjusted
            expect(assembledData.layers[1].objects[2].x).to.equal(64);
            expect(assembledData.layers[1].objects[2].y).to.equal(0);
            expect(assembledData.layers[1].objects[3].x).to.equal(74);
            expect(assembledData.layers[1].objects[3].y).to.equal(10);
        });

        it('updates tileset and layer dimensions correctly for single row, two column track', function() {
            var trackAssembler, assembledData;

            trackAssembler = new TrackAssembler(getSegmentDataWithOneRowAndTwoColumns());
            assembledData  = trackAssembler.assemble();

            expect(assembledData.width).to.equal(4);
            expect(assembledData.height).to.equal(2);
            expect(assembledData.layers[0].width).to.equal(4);
            expect(assembledData.layers[0].height).to.equal(2);
            expect(assembledData.layers[1].width).to.equal(4);
            expect(assembledData.layers[1].height).to.equal(2);
        });

        it('sets indexes on track segments correctly if finish line in first segment', function() {
            var TrackAssembler, trackAssembler, assembledData;

            TrackAssembler = getTrackAssemblerWithMockedRngThatReturnsIndex(0);
            trackAssembler = new TrackAssembler(getSegmentDataWithOneRowAndTwoColumns());
            assembledData  = trackAssembler.assemble();

            expect(assembledData.layers[1].objects[0].name).to.equal('finish-line');
            expect(assembledData.layers[1].objects[1].properties.index).to.equal(0);
            expect(assembledData.layers[1].objects[2].properties.index).to.equal(1);
            expect(assembledData.layers[1].objects[3].properties.index).to.equal(2);
        });

        it('sets indexes on track segments correctly if finish line in second segment', function() {
            var TrackAssembler, trackAssembler, assembledData;

            TrackAssembler = getTrackAssemblerWithMockedRngThatReturnsIndex(2);
            trackAssembler = new TrackAssembler(getSegmentDataWithOneRowAndTwoColumns());
            assembledData  = trackAssembler.assemble();

            expect(assembledData.layers[1].objects[0].properties.index).to.equal(1);
            expect(assembledData.layers[1].objects[1].properties.index).to.equal(2);
            expect(assembledData.layers[1].objects[2].name).to.equal('finish-line');
            expect(assembledData.layers[1].objects[3].properties.index).to.equal(0);
        });

        it('combines layers correctly for two row, two column track', function() {
            var trackAssembler, assembledData;

            trackAssembler = new TrackAssembler(getSegmentDataWithTwoRowsAndTwoColumns());
            assembledData  = trackAssembler.assemble();

            expect(assembledData.layers[0].data).to.eql([0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1]);
        });

        it('updates y coordinate for objects in second row', function() {
            var trackAssembler, assembledData;

            trackAssembler = new TrackAssembler(getSegmentDataWithTwoRowsAndTwoColumns());
            assembledData  = trackAssembler.assemble();

            // objects in first column are already correct
            expect(assembledData.layers[1].objects[0].x).to.equal(0);
            expect(assembledData.layers[1].objects[0].y).to.equal(0);
            // objects in second column have x values adjusted
            expect(assembledData.layers[1].objects[4].x).to.equal(0);
            expect(assembledData.layers[1].objects[4].y).to.equal(64);
            expect(assembledData.layers[1].objects[5].x).to.equal(10);
            expect(assembledData.layers[1].objects[5].y).to.equal(74);
        });

        it('sets index on track segments correctly for two row, two column track', function() {
            var TrackAssembler, trackAssembler, assembledData;

            TrackAssembler = getTrackAssemblerWithMockedRngThatReturnsIndex(5);
            trackAssembler = new TrackAssembler(getSegmentDataWithTwoRowsAndTwoColumns());
            assembledData  = trackAssembler.assemble();

            // segment 0
            expect(assembledData.layers[1].objects[0].properties.index).to.equal(0);
            expect(assembledData.layers[1].objects[1].properties.index).to.equal(1);
            // segment 1
            expect(assembledData.layers[1].objects[2].properties.index).to.equal(2);
            expect(assembledData.layers[1].objects[3].properties.index).to.equal(3);
            // segment 2
            expect(assembledData.layers[1].objects[6].properties.index).to.equal(4);
            expect(assembledData.layers[1].objects[7].properties.index).to.equal(5);
            // segment 3
            expect(assembledData.layers[1].objects[4].properties.index).to.equal(6);
            expect(assembledData.layers[1].objects[5].name).to.equal('finish-line');
        });

        it('updates tileset and layer dimensions correctly for two row, two column track', function() {
            var trackAssembler, assembledData;

            trackAssembler = new TrackAssembler(getSegmentDataWithTwoRowsAndTwoColumns());
            assembledData  = trackAssembler.assemble();

            expect(assembledData.width).to.equal(4);
            expect(assembledData.height).to.equal(4);
            expect(assembledData.layers[0].width).to.equal(4);
            expect(assembledData.layers[0].height).to.equal(4);
            expect(assembledData.layers[1].width).to.equal(4);
            expect(assembledData.layers[1].height).to.equal(4);
        });
    });
});