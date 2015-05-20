'use strict';

var urlRoot = 'assets/tilemaps/maps/';

module.exports = {
    'Breakroom' : {
        'Table Hop'   : [
            [
                [
                    urlRoot + 'breakroom/nw1.json',
                    urlRoot + 'breakroom/nw2.json'
                ],
                [
                    urlRoot + 'breakroom/ne1.json',
                    urlRoot + 'breakroom/ne2.json'
                ]
            ],
            [
                [
                    urlRoot + 'breakroom/sw1.json',
                    urlRoot + 'breakroom/sw2.json'
                ],
                [
                    urlRoot + 'breakroom/se1.json',
                    urlRoot + 'breakroom/se2.json'
                ]
            ]
        ]
    },
    'Desert' : {
        'Two-Segment Track'  : [
            // Each array at this depth represents a row. This track has only one row of two segments.
            [
                // The first segment in this row will be one of these
                [
                    urlRoot + 'desert/two-segment/left-1.json',
                    urlRoot + 'desert/two-segment/left-2.json'
                ],
                // The second segment in this row will be one of these
                [
                    urlRoot + 'desert/two-segment/right-1.json',
                    urlRoot + 'desert/two-segment/right-2.json'
                ]
            ]
        ],
        'Gravel and Pits'    : urlRoot + 'desert/gravel-and-pits.json',
        'Square Loop'        : urlRoot + 'desert/square-loop.json',
        'Figure 8'           : urlRoot + 'desert/figure8.json',
        'Bathroom Obstacles' : urlRoot + 'desert/figure8wObs.json'
    },
    'Bathroom' : {
        'Bathroom Counter 1' : urlRoot + '/bathroom/bathroom-counter-1.json',
        'Countertop Sampler' : urlRoot + '/bathroom/countertop-sampler.json'
    },
    'Misc' : {
        'Hardwood' : urlRoot + 'misc/hardwood.json'
    }
};
