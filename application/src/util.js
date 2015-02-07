'use strict';

module.exports = {
    rotateVector : function(rotation, vector)
    {
        return [
            vector[0] * Math.cos(rotation) - vector[1] * Math.sin(rotation),
            vector[0] * Math.sin(rotation) + vector[1] * Math.cos(rotation)
        ];
    }
};