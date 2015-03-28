/* global describe, it, beforeEach */
/* jshint expr: true */
'use strict';

var TrackAssembler = require('../../../../application/src/classes/track-assembler');
var expect = require('chai').expect;

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
                            name : 'foreground',
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
                                        'finish-line-candidate' : '1'
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
                            name : 'foreground',
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
                                        'finish-line-candidate' : '1'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        ];
    };

    describe('assemble', function() {
        it('combines layers correctly for single row, two column track', function() {
            var trackAssembler, assembledData;

            trackAssembler = new TrackAssembler(getSegmentDataWithOneRowAndTwoColumns());
            assembledData  = trackAssembler.assemble();

            expect(assembledData.layers[0].data).to.eql([0, 0, 1, 1, 0, 0, 1, 1]);
            expect(assembledData.layers[1].data).to.eql([0, 0, 1, 1, 0, 0, 1, 1]);
        });

        it('updates x coordinate for objects in second column', function() {
            var trackAssembler, assembledData;

            trackAssembler = new TrackAssembler(getSegmentDataWithOneRowAndTwoColumns());
            assembledData  = trackAssembler.assemble();

            // objects in first column are already correct
            expect(assembledData.layers[2].objects[0].x).to.equal(0);
            expect(assembledData.layers[2].objects[0].y).to.equal(0);
            // objects in second column have x values adjusted
            expect(assembledData.layers[2].objects[1].x).to.equal(64);
            expect(assembledData.layers[2].objects[1].y).to.equal(0);
        });
    });
});