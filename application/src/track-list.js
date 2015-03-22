'use strict';

var urlRoot = 'assets/tilemaps/maps/';

module.exports = {
    'Desert' : {
        'Gravel and Pits'    : urlRoot + 'desert/gravel-and-pits.json',
        'Square Loop'        : urlRoot + 'desert/square-loop.json',
        'Figure 8'           : urlRoot + 'desert/figure8.json',
        'Bathroom Obstacles' : urlRoot + 'desert/figure8wObs.json',
        'Two-Segment Track'  : [
            // Each array at this depth represents a row. This track has only one row of two segments.
            [
                // Column 1
                [
                    urlRoot + 'desert/two-segment/left-1.json',
                    urlRoot + 'desert/two-segment/left-2.json'
                ],
                // Column 2
                [
                    urlRoot + 'desert/two-segment/right-1.json',
                    urlRoot + 'desert/two-segment/right-2.json'
                ]
            ]
        ]
    }
};