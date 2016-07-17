'use strict';

var AbstractDynamicObstacle = require('./abstract-dynamic-obstacle');
var rotateVector = require('../../util').rotateVector;
var rng = require('../../rng');
var _ = require('underscore');

var Ant = function(state, x, y, key, angle)
{
    AbstractDynamicObstacle.apply(this, arguments);
    this.falling = false;
    this.rotatingAwayFromTile = null;
    this.rotatingAwayFromBody = null;
    this.rotatingTowardsCandy = null;

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
        MASS                : 1.5,
        FRICTION_MULTIPLIER : 2.0,
        TURNING_VELOCITY    : 40,
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

    // If colliding with another physical body, turn 90 degrees
    this.body.onBeginContact.add(function (contactingBody) {
        this.rotatingAwayFromBody = rng.pickValueFromArray(['Right', 'Left']);
    }.bind(this));

    this.body.onEndContact.add(function (contactingBody) {
        this.rotatingAwayFromBody = null;
    }.bind(this));
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
    if (this.isUnpassableTile(facingPoint) || this.isOutsideOfWorldBounds(facingPoint)) {
        if (this.rotatingAwayFromTile) {
            this.body['rotate' + this.rotatingAwayFromTile](this.constants.TURNING_VELOCITY);
        } else {
            this.rotatingAwayFromTile = rng.pickValueFromArray(['Right', 'Left']);
        }
    } else if (this.rotatingAwayFromBody) {
        this.body['rotate' + this.rotatingAwayFromBody](this.constants.TURNING_VELOCITY);
    } else if (this.rotatingTowardsCandy) {
        if (Math.abs(this.rotatingTowardsCandy.targetAngle - this.angle) < 20) {
            this.rotatingTowardsCandy = null;
        } else {
            this.body['rotate' + this.rotatingTowardsCandy.direction](this.constants.TURNING_VELOCITY);
        }
    } else {
        this.rotatingAwayFromTile = null;
    }

    // If too far from candy, turn towards it
    if (! this.rotatingTowardsCandy && ! this.isFacingCandy() && this.isTooFarFromCandy()) {
        this.startTurningTowardsCandy();
    }

    this.body.moveForward(50);
};

Ant.prototype.isTooFarFromCandy = function() {
    var obstaclesLayer = _.findWhere(this.state.trackData.layers, {name : 'obstacles'});
    var candy = _.findWhere(obstaclesLayer.objects, {type: 'Lollipop'});
    var distanceFromCandy = Phaser.Math.distance(
        candy.x,
        candy.y,
        this.x,
        this.y
    );

    return distanceFromCandy > 200;
}

Ant.prototype.isFacingCandy = function() {
    var targetAngle = this.rotatingTowardsCandy ?
        this.rotatingTowardsCandy.targetAngle :
        this.getAngleToTheCandy();

    return Math.abs(targetAngle - this.angle) < 20;
}

Ant.prototype.getAngleToTheCandy = function() {
    var obstaclesLayer = _.findWhere(this.state.trackData.layers, {name : 'obstacles'});
    var candy = _.findWhere(obstaclesLayer.objects, {type: 'Lollipop'});
    var targetAngle = Math.atan2(
        candy.y - this.y,
        candy.x - this.x
    );
    targetAngle = targetAngle * (180 / Math.PI);
    return targetAngle;
}

Ant.prototype.startTurningTowardsCandy = function() {
    this.rotatingTowardsCandy = {
        direction: rng.pickValueFromArray(['Right', 'Left']),
        targetAngle: this.getAngleToTheCandy(),
    };
}

Ant.prototype.isUnpassableTile = function(point) {
    return !! this.state.map.getTileWorldXY(
        point[0],
        point[1],
        this.state.map.scaledTileWidth,
        this.state.map.scaledTileHeight,
        'drops'
    );
};

Ant.prototype.isOutsideOfWorldBounds = function(point) {
    return (
        point[0] < 0 ||
        point[0] > this.game.world.width ||
        point[1] < 0 ||
        point[1] > this.game.world.height
    );
};

module.exports = Ant;
