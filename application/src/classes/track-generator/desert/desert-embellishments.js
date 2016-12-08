import rng from 'app/rng';

const EMBEL_NONE = 'EMBEL_NONE';
// Center embellishments
const EMBEL_T = 'EMBEL_T';
const EMBEL_PLUS = 'EMBEL_PLUS';
const EMBEL_I = 'EMBEL_I';
const EMBEL_L = 'EMBEL_L';
const EMBEL_J = 'EMBEL_J';
// Corner embellishments
const EMBEL_CORNER_RECT = 'EMBEL_CORNER_RECT';
const EMBEL_CORNER_CUT = 'EMBEL_CORNER_CUT';
const EMBEL_CORNER_CUT_STAIRS = 'EMBEL_CORNER_CUT_STAIRS';

const INWARD = 'INWARD';
const OUTWARD = 'OUTWARD';
const LEFT = 'LEFT';
const RIGHT = 'RIGHT';

export default {
    getCenterEmbellishments() {
        return [
            EMBEL_NONE,
            EMBEL_T,
            EMBEL_PLUS,
            EMBEL_I,
            EMBEL_L,
            EMBEL_J,
        ];
    },

    getCornerEmbellishments() {
        return [
            EMBEL_NONE,
            EMBEL_CORNER_RECT,
            EMBEL_CORNER_CUT,
            EMBEL_CORNER_CUT_STAIRS,
        ];
    },

    getCenterEmbelInstructions(type, orientation) {
        let instructions;
        let lengthOut
        switch(type) {
            case EMBEL_T:
                lengthOut = rng.getIntBetween(30, 60);
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
                lengthOut = rng.getIntBetween(60, 100);
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
            case EMBEL_J:
                instructions = [
                    RIGHT,
                    90,
                    LEFT,
                    60,
                    LEFT,
                    30,
                    LEFT,
                    30,
                    RIGHT,
                    60,
                    RIGHT,
                ]
                break;
        }

        // Flip all the directions if this is an outward embellishment
        if (orientation === 'OUTWARD') {
            for (let i = 0; i < instructions.length; i += 2) {
                instructions[i] = instructions[i] === RIGHT ? LEFT : RIGHT;
            }
        }
        return instructions;
    },

    getCornerEmbelInstructions(type) {
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
};
