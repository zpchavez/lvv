import AbstractDynamicObstacle from './abstract-dynamic-obstacle';
import { rotateVector } from 'app/util';
import rng from 'app/rng';
import _ from 'underscore';

class Ant extends AbstractDynamicObstacle
{
    constructor(state, x, y, key, angle) {
        super(...arguments);

        this.falling = false;
        this.rotatingAwayFromTile = null;
        this.rotatingAwayFromBody = null;
        this.rotatingTowardsCandy = null;

        this.animations.add('walking', [0, 1, 0, 2], 6, true);
        this.animations.play('walking');
    }

    loadAssets(state, key) {
        state.game.load.atlas(
            key,
            'assets/img/obstacles/ant.png',
            'assets/img/obstacles/ant.json'
        );
    }

    getConstants() {
        return {
            ANGULAR_DAMPING     : 0.9,
            MASS                : 1.5,
            FRICTION_MULTIPLIER : 2.0,
            TURNING_VELOCITY    : 40,
        };
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'ant');

        if (angle) {
            this.body.angle = angle;
        }

        // If colliding with another physical body, turn 90 degrees
        this.body.onBeginContact.add((contactingBody) => {
            this.rotatingAwayFromBody = rng.pickValueFromArray(['Right', 'Left']);
        });

        this.body.onEndContact.add((contactingBody) => {
            this.rotatingAwayFromBody = null;
        });
    }

    update() {
        super.update(...arguments);

        if (this.splashing) {
            return;
        }

        // Get point in front of ant.
        const xRotation = Math.cos(this.body.rotation - (90 * Math.PI / 180));
        const yRotation = Math.sin(this.body.rotation - (90 * Math.PI / 180));
        const facingPoint = [
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
            if (this.goingTowardsCandy()) {
                this.rotatingTowardsCandy = null;
                // Snap to exactly facing the candy
                this.body.angle = this.getAngleToTheCandy() + 90;

                // Temporarily disable angular damping so the ant doesn't over turn
                this.body.angularDamping = 1;
                setTimeout(() => {
                    this.body.angularDamping = this.constants.ANGULAR_DAMPING;
                }, 100)
            } else {
                this.body['rotate' + this.rotatingTowardsCandy](this.constants.TURNING_VELOCITY);
            }
        } else {
            this.rotatingAwayFromTile = null;
        }

        // If too far from candy, turn towards it
        if (! this.rotatingTowardsCandy && this.isTooFarFromCandy()) {
            this.startTurningTowardsCandy();
        }

        this.body.moveForward(50);
    }

    getCandy() {
        if (! this.candy) {
            var obstaclesLayer = _.findWhere(this.state.trackData.layers, {name : 'obstacles'});
            this.candy = _.findWhere(obstaclesLayer.objects, {type: 'Lollipop'});
        }
        return this.candy;
    }

    isTooFarFromCandy() {
        const candy = this.getCandy();
        const distanceFromCandy = Phaser.Math.distance(
            candy.x,
            candy.y,
            this.x,
            this.y
        );

        const angleToCandy = this.getAngleToTheCandy();

        return distanceFromCandy > 2000 && !this.goingTowardsCandy();
    }

    getAdjustedAngle() {
        // Because sprite faces up instead of to the right
        return this.angle - 90;
    }

    goingTowardsCandy() {
        const diff = Math.abs(
            (this.getAngleToTheCandy()) -
            (this.getAdjustedAngle())
        ) % 360;

        return (diff < 5);
    }

    getAngleToTheCandy() {
        const obstaclesLayer = _.findWhere(this.state.trackData.layers, {name : 'obstacles'});
        const candy = _.findWhere(obstaclesLayer.objects, {type: 'Lollipop'});
        let targetAngle = Math.atan2(
            candy.y - this.y,
            candy.x - this.x
        );
        targetAngle = targetAngle * (180 / Math.PI);
        return targetAngle;
    }

    startTurningTowardsCandy() {
        this.rotatingTowardsCandy = rng.pickValueFromArray(['Right', 'Left']);
    }

    isUnpassableTile(point) {
        const isDrop = !! this.state.map.getTileWorldXY(
            point[0],
            point[1],
            this.state.map.scaledTileWidth,
            this.state.map.scaledTileHeight,
            'drops'
        );

        const isWater = !! this.state.map.getTileWorldXY(
            point[0],
            point[1],
            this.state.map.scaledTileWidth,
            this.state.map.scaledTileHeight,
            'water'
        );

        return isDrop || isWater;
    }

    isOutsideOfWorldBounds(point) {
        return (
            point[0] < 0 ||
            point[0] > this.game.world.width ||
            point[1] < 0 ||
            point[1] > this.game.world.height
        );
    }
}

export default Ant;
