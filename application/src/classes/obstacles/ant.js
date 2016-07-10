'use strict';

var AbstractDynamicObstacle = require('./abstract-dynamic-obstacle');
var rotateVector = require('../../util').rotateVector;
var rng = require('../../rng');

var Ant = function(state, x, y, key, angle)
{
    AbstractDynamicObstacle.apply(this, arguments);
    this.falling = false;
    this.rotatingTo = null;
    this.rotatingDirection = null;

    this.animations.add('walking', [0, 1, 0, 2], 6, true);
    this.animations.play('walking');
};

Ant.prototype = Object.create(AbstractDynamicObstacle.prototype);

Ant.prototype.loadAssets = function(state, key)
{
    state.game.load.atlas(
        key,
        'assets/img/obstacles/ant.png',
        'assets/img/obstacles/ant.json'
    );
};

Ant.prototype.getConstants = function()
{
    return {
        ANGULAR_DAMPING     : 0.9,
        MASS                : 0.5,
        FRICTION_MULTIPLIER : 2.0,
        TURNING_VELOCITY    : 80,
    };
};

Ant.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'ant');

    if (angle) {
        this.body.angle = angle;
    }
};

Ant.prototype.update = function()
{
    AbstractDynamicObstacle.prototype.update.apply(this, arguments);

    // Get point in front of ant.
    var xRotation = Math.cos(this.body.rotation - (90 * Math.PI / 180));
    var yRotation = Math.sin(this.body.rotation - (90 * Math.PI / 180));
    var facingPoint = [
        this.x + (100 * xRotation),
        this.y + (100 * yRotation),
    ];

    // Turn if heading for an unpassable tile
    if (this.state.map.getTileWorldXY(
        facingPoint[0],
        facingPoint[1],
        this.state.map.scaledTileWidth,
        this.state.map.scaledTileHeight,
        'drops'
    )) {
        if (this.rotatingDirection) {
            this.body['rotate' + this.rotatingDirection](this.constants.TURNING_VELOCITY);
        } else {
            this.rotatingDirection = rng.pickValueFromArray(['Right', 'Left']);
        }
    } else if (this.rotatingDirection) {
        if (this.rotatingTo && this.rotatingTo !== this.body.angle) {
            this.body['rotate' + this.rotatingDirection](this.constants.TURNING_VELOCITY);
        } else {
            this.rotatingDirection = null;
        }
    } else {
        this.rotatingDirection = null;
    }

    this.body.moveForward(50);
}

module.exports = Ant;
