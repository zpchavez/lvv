export function rotateVector(rotation, vector) {
    return [
        vector[0] * Math.cos(rotation) - vector[1] * Math.sin(rotation),
        vector[0] * Math.sin(rotation) + vector[1] * Math.cos(rotation)
    ];
};

export function getVectorMagnitude(vector) {
    return Math.sqrt(
        Math.pow(vector[0], 2) +
        Math.pow(vector[1], 2)
    );
};
