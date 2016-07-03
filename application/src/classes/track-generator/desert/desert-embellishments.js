var rng = require('../../../rng');

var EMBEL_NONE = 'EMBEL_NONE';
// Center embellishments
var EMBEL_T = 'EMBEL_T';
var EMBEL_PLUS = 'EMBEL_PLUS';
var EMBEL_I = 'EMBEL_I';
var EMBEL_L = 'EMBEL_L';
// Corner embellishments
var EMBEL_CORNER_RECT = 'EMBEL_CORNER_RECT';
var EMBEL_CORNER_CUT = 'EMBEL_CORNER_CUT';
var EMBEL_CORNER_CUT_STAIRS = 'EMBEL_CORNER_CUT_STAIRS';

var INWARD = 'INWARD';
var OUTWARD = 'OUTWARD';
var LEFT = 'LEFT';
var RIGHT = 'RIGHT';

module.exports = {
    getCenterEmbellishments: function() {
        return [
            EMBEL_NONE,
            EMBEL_T,
            EMBEL_PLUS,
            EMBEL_I,
            EMBEL_L,
        ];
    },

    getCornerEmbellishments: function() {
        return [
            EMBEL_NONE,
            EMBEL_CORNER_RECT,
            EMBEL_CORNER_CUT,
            EMBEL_CORNER_CUT_STAIRS,
        ];
    },

    getCenterEmbelInstructions: function(type, orientation) {
        var instructions;
        switch(type) {
            case EMBEL_T:
                var lengthOut = rng.getIntBetween(30, 60);
                instructions = [
                    RIGHT,
                    lengthOut,
                    RIGHT,
                    30,
                    LEFT,
                    30,
                    LEFT,
                    90,
                    LEFT,
                    30,
                    LEFT,
                    30,
                    RIGHT,
                    lengthOut,
                    RIGHT,
                ]
                break;
            case EMBEL_PLUS:
                instructions = [
                    RIGHT,
                    30,
                    RIGHT,
                    30,
                    LEFT,
                    30,
                    LEFT,
                    30,
                    RIGHT,
                    30,
                    LEFT,
                    30,
                    LEFT,
                    30,
                    RIGHT,
                    30,
                    LEFT,
                    30,
                    LEFT,
                    30,
                    RIGHT,
                    30,
                    RIGHT,
                ];
                break;
            case EMBEL_I:
                var lengthOut = rng.getIntBetween(60, 100);
                instructions = [
                    RIGHT,
                    lengthOut,
                    LEFT,
                    30,
                    LEFT,
                    lengthOut,
                    RIGHT,
                ];
                break;
            case EMBEL_L:
                instructions = [
                    RIGHT,
                    60,
                    RIGHT,
                    30,
                    LEFT,
                    30,
                    LEFT,
                    60,
                    LEFT,
                    90,
                    RIGHT,
                ]
                break;
        }

        // Flip all the directions if this is an outward embellishment
        if (orientation === 'OUTWARD') {
            for (var i = 0; i < instructions.length; i += 2) {
                instructions[i] = instructions[i] === RIGHT ? LEFT : RIGHT;
            }
        }
        return instructions;
    },

    getCornerEmbelInstructions: function(type) {
        switch(type) {
            case EMBEL_CORNER_RECT:
                return [
                    LEFT,
                    50,
                    RIGHT,
                    100,
                    RIGHT,
                    100,
                    RIGHT,
                    50,
                    LEFT
                ];
                break;
            case EMBEL_CORNER_CUT:
                return [
                    RIGHT,
                    50,
                    LEFT,
                    50,
                    RIGHT,
                ];
                break;
            case EMBEL_CORNER_CUT_STAIRS:
                return [
                    RIGHT,
                    25,
                    LEFT,
                    25,
                    RIGHT,
                    25,
                    LEFT,
                    25,
                    RIGHT,
                ];
                break;
        }
    },
}
