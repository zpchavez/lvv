import _ from 'underscore';
import { rotateVector, getVectorMagnitude } from 'app/util';
import globalState from 'app/global-state';
import colors from 'app/colors';
import global from 'app/global-state';

const transformCallback = function(worldTransform, parentTransform)
{
    var translationCoordinates = [worldTransform.tx, worldTransform.ty];

    worldTransform
        // reverse the current translation first so that the translation coordinates aren't scaled as well
        .translate(-translationCoordinates[0], -translationCoordinates[1])
        // scale up for jump height
        .scale(this.airborneHeight + 1, this.airborneHeight + 1)
        // then reapply the current translation
        .translate(translationCoordinates[0], translationCoordinates[1])
        // translate upward for jump height
        .translate(0, -this.airborneHeight * 180);
};

class Car extends Phaser.Sprite
{
    constructor(state, x, y, key, weaponFactory) {
        super(state.game, x, y, key);

        this.state = state;

        this.state.game.physics.p2.enable(this);

        this.glassSprite = this.addChild(state.game.make.sprite(0, 0, 'car-glass'));
        this.glassSprite.anchor.setTo(0.5);

        const centerOfMassParticle = this.body.addParticle(0, 0);
        centerOfMassParticle.centerOfMassFor = this;

        this.constants = this.getConstants();
        Object.freeze(this.constants);

        this.body.mass = this.constants.MASS;

        this.victorySpinning = false;
        this.falling = false;
        this.disabled = false;
        this.airborne = false;
        this.airborneHeight = 0;
        this.onRoughTerrain = false;
        this.armedWithCannon = globalState.get('startWithCannons');
        this.weaponFactory = weaponFactory;

        this.multipliers = {
            friction: {},
            skid: {},
            brake: {},
        };

        this.transformCallback = transformCallback;
        this.transformCallbackContext = this;
        this.spriteKey = key;
    }

    getConstants() {
        return {
            MASS                        : 10,
            ROLLING_FRICTION_MULTIPLIER : 0.175,
            ROUGH_TERRAIN_MULTIPLIER    : 2,
            SKID_FRICTION_MULTIPLIER    : 0.25,
            ACCELERATION_FORCE          : 1600,
            BRAKE_FORCE                 : -500,
            TURNING_VELOCITY            : 80,
            SPINOUT_VELOCITY            : 250,
            JUMP_HEIGHT_MULTIPLIER      : 0.002,
            ROTATION_SNAP               : 10,
            CANNON_BALL_VELOCITY        : 1200,
            KICK_BACK_FORCE             : 8000,
        };
    }

    controlsLocked() {
        return (
            this.splashing ||
            this.falling ||
            this.victorySpinning ||
            this.spinningOut
        );
    }

    accelerate() {
        if (this.controlsLocked() || this.airborne) {
            return;
        }

        this.body.applyForce(
            rotateVector(this.body.rotation, [0, this.constants.ACCELERATION_FORCE]),
            0,
            0
        );
    }

    brake() {
        if (this.controlsLocked() || this.airborne) {
            return;
        }

        this.body.applyForce(
            rotateVector(
                this.body.rotation,
                [0, this.constants.BRAKE_FORCE * this.getMultiplierTotal('brake')]
            ),
            0,
            0
        );
    }

    turnRight() {
        if (this.controlsLocked()) {
            return;
        }

        this.body.rotateRight(this.constants.TURNING_VELOCITY);
    }

    turnLeft() {
        if (this.controlsLocked()) {
            return;
        }

        this.body.rotateLeft(this.constants.TURNING_VELOCITY);
    }

    removePowerups() {
        this.armedWithCannon = globalState.get('startWithCannons');
        this.stopHovering();
    }

    startHovering() {
        var hoverUp, hoverDown;

        if (this.hovering) {
            return;
        }

        this.hovering = true;
        this.addMultiplier('skid', 'hovering', 0.4);
        this.addMultiplier('brake', 'hovering', 0.5);

        // Do float-up-and-down animation
        hoverUp = () => {
            this.hoverTween = this.state.game.add.tween(this.scale)
                .to(
                    {x : 1.2, y: 1.2},
                    500,
                    Phaser.Easing.Quadratic.InOut,
                    true
                );
            this.hoverTween.onComplete.add(hoverDown);
        };

        hoverDown = () => {
            this.hoverTween = this.state.game.add.tween(this.scale)
                .to(
                    {x : 1.1, y: 1.1},
                    500,
                    Phaser.Easing.Quadratic.InOut,
                    true
                );
            this.hoverTween.onComplete.add(hoverUp);
        };

        hoverUp();
    }

    stopHovering() {
        if (! this.hovering) {
            return;
        }

        this.hovering = false;
        this.hoverTween.stop();
        this.scale.x = 1;
        this.scale.y = 1;
        this.removeMultiplier('skid', 'hovering');
        this.removeMultiplier('brake', 'hovering');
    }

    armWithCannon() {
        this.armedWithCannon = true;
    }

    // Straighten out if not turning
    applyRotationSnap() {
        if (this.body.angularVelocity === 0) {
            const rotationSnapDeviation = this.body.angle % this.constants.ROTATION_SNAP;

            if (rotationSnapDeviation) {
                if (rotationSnapDeviation <= (this.constants.ROTATION_SNAP / 2)) {
                    this.body.angle = (
                        this.constants.ROTATION_SNAP *
                        Math.floor(this.body.angle / this.constants.ROTATION_SNAP)
                    );
                } else {
                    this.body.angle = (
                        this.constants.ROTATION_SNAP *
                        Math.ceil(this.body.angle / this.constants.ROTATION_SNAP)
                    );
                }
            }
        }
    }

    getCarRefVelocity()
    {
        return rotateVector(
            -this.body.rotation,
            [this.body.velocity.x, this.body.velocity.y]
        );
    }

    doMultiplierTypeCheck(type) {
        if (['friction', 'brake', 'skid'].indexOf(type) === -1) {
            throw new Error('Unsupported multiplier type: ' + type);
        }
    }

    addMultiplier(type, key, value) {
        this.doMultiplierTypeCheck(type);

        this.multipliers[type][key] = value;

        return this;
    }

    removeMultiplier(type, key, value) {
        this.doMultiplierTypeCheck(type);

        delete this.multipliers[type][key];

        return this;
    }

    getMultiplierTotal(type) {
        this.doMultiplierTypeCheck(type);

        return _.reduce(
            this.multipliers[type],
            (total, element) => {
                return total * element;
            },
            1
        );
    }

    addFrictionMultiplier(key, value) {
        return this.addMultiplier('friction', key, value);
    }

    removeFrictionMultiplier(key) {
        return this.removeMultiplier('friction', key);
    }

    getFrictionMultiplierTotal() {
        return this.getMultiplierTotal('friction');
    }

    applyRollingFriction() {
        this.body.applyForce(
            rotateVector(
                this.body.rotation,
                [
                    0,
                    this.getCarRefVelocity()[1] *
                    this.constants.ROLLING_FRICTION_MULTIPLIER *
                    (this.onRoughTerrain ? this.constants.ROUGH_TERRAIN_MULTIPLIER : 1) *
                    this.getFrictionMultiplierTotal() *
                    this.body.mass
                ]
            ),
            0,
            0
        );
    }

    applySkidFriction() {
        this.body.applyForce(
            rotateVector(
                this.body.rotation,
                [
                    this.getCarRefVelocity()[0] *
                    this.constants.SKID_FRICTION_MULTIPLIER *
                    this.getFrictionMultiplierTotal() *
                    this.getMultiplierTotal('skid') *
                    this.body.mass,
                    0
                ]
            ),
            0,
            0
        );
    }

    applyForces() {
        this.applyRotationSnap();

        this.body.setZeroRotation();

        if (! this.airborne) {
            this.applyRollingFriction();

            this.applySkidFriction();
        }

        if (this.victorySpinning) {
            this.body.rotateRight(150);
        }

        if (this.spinningOut) {
            this.body.rotateLeft(this.constants.SPINOUT_VELOCITY);
        }
    }

    splash(splashTargetLocation) {
        this.splashing = true;
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.body.angle = 0;

        this.tint = 0xffffff;
        this.loadTexture('splash', 0);
        this.glassSprite.visible = false;
        this.body.x = splashTargetLocation.x;
        this.body.y = splashTargetLocation.y;
        this.animations.add('splash', [0, 1], 2, false);
        this.animations.play('splash');
        setTimeout(() => {
            this.doneSplashing();
        }, 1000);
    }

    fall(fallTargetLocation, easeToTarget) {
        this.falling = true;

        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        if (easeToTarget) {
            this.state.game.add.tween(this.body)
                .to(
                    {x : fallTargetLocation.x, y: fallTargetLocation.y},
                    500,
                    Phaser.Easing.Linear.None,
                    true
                );
        } else {
            this.body.x = fallTargetLocation.x;
            this.body.y = fallTargetLocation.y;
        }

        this.state.game.add.tween(this.scale)
            .to(
                {x : 0.1, y: 0.1},
                500,
                Phaser.Easing.Linear.None,
                true
            )
            .onComplete.add(this.doneFalling, this);
    }

    doneFalling() {
        this.falling = false;
        this.scale.x = 1;
        this.scale.y = 1;
        this.state.moveCarToLastActivatedMarker(this);
    }

    doneSplashing() {
        this.splashing = false;
        this.loadTexture(this.spriteKey);
        this.glassSprite.visible = true;
        this.tint = colors[global.state.colors[this.playerNumber]].hex;
        this.state.moveCarToLastActivatedMarker(this);
    }

    setVictorySpinning(value) {
        this.victorySpinning = value;
    }

    jump(jumpScale) {
        let speed, jumpHeight, timeToVertex;

        if (typeof(jumpScale) === 'undefined') {
            jumpScale = 1.0;
        }

        speed = getVectorMagnitude([this.body.velocity.x, this.body.velocity.y]);

        jumpHeight   = this.constants.JUMP_HEIGHT_MULTIPLIER * speed * Math.sqrt(jumpScale);
        timeToVertex = jumpHeight * 200 * Math.sqrt(jumpScale);

        if (jumpHeight > 1) {
            this.airborne = true;

            this.state.game.add.tween(this)
                .to({airborneHeight : jumpHeight - 1}, timeToVertex, Phaser.Easing.Quadratic.Out)
                .to({airborneHeight : 0}, timeToVertex, Phaser.Easing.Quadratic.In)
                .start()
                .onComplete.add(this.land, this);
        }
    }

    land() {
        this.airborne = false;
    }

    spinOut() {
        this.spinningOut = true;
        setTimeout(() => {
            this.spinningOut = false;
        }, 1000);
    };

    fire() {
        if (! this.armedWithCannon) {
            return;
        }

        // Adjust spawn point 90 degrees, otherwise projectile appears to the right of the car
        const xRotation = Math.cos(this.body.rotation - (90 * Math.PI / 180));
        const yRotation = Math.sin(this.body.rotation - (90 * Math.PI / 180));
        const spawnPoint = [
            this.x + (30 * xRotation),
            this.y + (30 * yRotation),
        ];

        const cannonBall = this.weaponFactory.getNew('cannon-ball', spawnPoint[0], spawnPoint[1]);
        cannonBall.addToCollisionGroup(this.state.collisionGroup);
        this.game.world.addChild(cannonBall);

        const velocity = rotateVector(this.body.rotation, [0, this.constants.CANNON_BALL_VELOCITY * -1]);
        cannonBall.body.velocity.x = velocity[0];
        cannonBall.body.velocity.y = velocity[1];
        cannonBall.shotBy = this.playerNumber;

        // Kick-back
        this.body.applyForce(
            rotateVector(
                this.body.rotation,
                [0, this.constants.KICK_BACK_FORCE * -1]
            ),
            0,
            0
        );
    }

    addToCollisionGroup(collisionGroup) {
        this.body.setCollisionGroup(collisionGroup);
        this.body.collides(collisionGroup);
    }
}

export default Car;
