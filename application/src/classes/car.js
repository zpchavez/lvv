'use strict';

var _                  = require('underscore');
var Phaser             = require('phaser');
var rotateVector       = require('../util').rotateVector;
var getVectorMagnitude = require('../util').getVectorMagnitude;
var settings = require('../settings');
var transformCallback;

var Car = function(state, x, y, key, weaponFactory)
{
    var centerOfMassParticle;

    Phaser.Sprite.apply(this, [state.game, x, y, key]);

    this.state = state;

    this.state.game.physics.p2.enable(this);

    centerOfMassParticle = this.body.addParticle(0, 0);
    centerOfMassParticle.centerOfMassFor = this;

    this.constants = this.getConstants();
    Object.freeze(this.constants);

    this.body.mass = this.constants.MASS;

    this.victorySpinning = false;
    this.falling         = false;
    this.disabled        = false;
    this.airborne        = false;
    this.airborneHeight  = 0;
    this.onRoughTerrain  = false;
    this.armedWithCannon = settings.startWithCannons;
    this.weaponFactory = weaponFactory;

    this.multipliers = {
        friction: {},
        skid: {},
        brake: {},
    };

    this.transformCallback        = transformCallback;
    this.transformCallbackContext = this;
};

Car.prototype = Object.create(Phaser.Sprite.prototype);

Car.prototype.getConstants = function()
{
    return {
        MASS                        : 10,
        ROLLING_FRICTION_MULTIPLIER : 0.175,
        ROUGH_TERRAIN_MULTIPLIER    : 2,
        SKID_FRICTION_MULTIPLIER    : 0.25,
        ACCELERATION_FORCE          : 1600,
        BRAKE_FORCE                 : -500,
        TURNING_VELOCITY            : 80,
        JUMP_HEIGHT_MULTIPLIER      : 0.002,
        ROTATION_SNAP               : 10,
        CANNON_BALL_VELOCITY        : 1200,
        KICK_BACK_FORCE             : 8000,
    };
};

Car.prototype.controlsLocked = function()
{
    return (
        this.falling ||
        this.victorySpinning ||
        this.disabled
    );
};

Car.prototype.accelerate = function()
{
    if (this.controlsLocked() || this.airborne) {
        return;
    }

    this.body.applyForce(
        rotateVector(this.body.rotation, [0, this.constants.ACCELERATION_FORCE]),
        this.body.x,
        this.body.y
    );
};

Car.prototype.brake = function()
{
    if (this.controlsLocked() || this.airborne) {
        return;
    }

    this.body.applyForce(
        rotateVector(
            this.body.rotation,
            [0, this.constants.BRAKE_FORCE * this.getMultiplierTotal('brake')]
        ),
        this.body.x,
        this.body.y
    );
};

Car.prototype.turnRight = function()
{
    if (this.controlsLocked()) {
        return;
    }

    this.body.rotateRight(this.constants.TURNING_VELOCITY);
};


Car.prototype.turnLeft = function()
{
    if (this.controlsLocked()) {
        return;
    }

    this.body.rotateLeft(this.constants.TURNING_VELOCITY);
};

Car.prototype.removePowerups = function()
{
    this.armedWithCannon = settings.startWithCannons;
    this.stopHovering();
};

Car.prototype.startHovering = function()
{
    var hoverUp, hoverDown;

    if (this.hovering) {
        return;
    }

    this.hovering = true;
    this.addMultiplier('skid', 'hovering', 0.4);
    this.addMultiplier('brake', 'hovering', 0.5);

    // Do float-up-and-down animation
    hoverUp = function() {
        this.hoverTween = this.state.game.add.tween(this.scale)
            .to(
                {x : 1.2, y: 1.2},
                500,
                Phaser.Easing.Quadratic.InOut,
                true
            );
        this.hoverTween.onComplete.add(hoverDown);
    }.bind(this);

    hoverDown = function() {
        this.hoverTween = this.state.game.add.tween(this.scale)
            .to(
                {x : 1.1, y: 1.1},
                500,
                Phaser.Easing.Quadratic.InOut,
                true
            );
        this.hoverTween.onComplete.add(hoverUp);
    }.bind(this);

    hoverUp();
};

Car.prototype.stopHovering = function()
{
    if (! this.hovering) {
        return;
    }

    this.hovering = false;
    this.hoverTween.stop();
    this.scale.x = 1;
    this.scale.y = 1;
    this.removeMultiplier('skid', 'hovering');
    this.removeMultiplier('brake', 'hovering');
};

Car.prototype.armWithCannon = function()
{
    this.armedWithCannon = true;
};

// Straighten out if not turning
Car.prototype.applyRotationSnap = function()
{
    var rotationSnapDeviation;

    if (this.body.angularVelocity === 0) {
        rotationSnapDeviation = this.body.angle % this.constants.ROTATION_SNAP;

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
};

Car.prototype.getCarRefVelocity = function()
{
    return rotateVector(
        -this.body.rotation,
        [this.body.velocity.x, this.body.velocity.y]
    );
};

Car.prototype.doMultiplierTypeCheck = function(type)
{
    if (['friction', 'brake', 'skid'].indexOf(type) === -1) {
        throw new Error('Unsupported multiplier type: ' + type);
    }
};

Car.prototype.addMultiplier = function(type, key, value)
{
    this.doMultiplierTypeCheck(type);

    this.multipliers[type][key] = value;

    return this;
};

Car.prototype.removeMultiplier = function(type, key, value)
{
    this.doMultiplierTypeCheck(type);

    delete this.multipliers[type][key];

    return this;
};

Car.prototype.getMultiplierTotal = function(type)
{
    this.doMultiplierTypeCheck(type);

    return _.reduce(
        this.multipliers[type],
        function(total, element) {
            return total * element;
        },
        1
    );
};

Car.prototype.addFrictionMultiplier = function(key, value)
{
    return this.addMultiplier('friction', key, value);
};

Car.prototype.removeFrictionMultiplier = function(key)
{
    return this.removeMultiplier('friction', key);
};

Car.prototype.getFrictionMultiplierTotal = function()
{
    return this.getMultiplierTotal('friction');
};

Car.prototype.applyRollingFriction = function()
{
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
        this.body.x,
        this.body.y
    );
};

Car.prototype.applySkidFriction = function()
{
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
        this.body.x,
        this.body.y
    );
};

Car.prototype.applyForces = function()
{
    this.applyRotationSnap();

    this.body.setZeroRotation();

    if (! this.airborne) {
        this.applyRollingFriction();

        this.applySkidFriction();
    }

    if (this.victorySpinning) {
        this.body.rotateRight(150);
    }
};

transformCallback = function(worldTransform, parentTransform)
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

Car.prototype.fall = function(fallTargetLocation, easeToTarget)
{
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
};

Car.prototype.doneFalling = function()
{
    this.falling = false;
    this.scale.x = 1;
    this.scale.y = 1;
    this.state.moveCarToLastActivatedMarker(this);
};

Car.prototype.setVictorySpinning = function(value)
{
    this.victorySpinning = value;
};

Car.prototype.jump = function(jumpScale)
{
    var speed, jumpHeight, timeToVertex;

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
};

Car.prototype.land = function()
{
    this.airborne = false;
};

Car.prototype.fire = function()
{
    if (! this.armedWithCannon) {
        return;
    }

    // Adjust spawn point 90 degrees, otherwise projectile appears to the right of the car
    var xRotation = Math.cos(this.body.rotation - (90 * Math.PI / 180));
    var yRotation = Math.sin(this.body.rotation - (90 * Math.PI / 180));
    var spawnPoint = [
        this.x + (30 * xRotation),
        this.y + (30 * yRotation),
    ];

    var cannonBall = this.weaponFactory.getNew('cannon-ball', spawnPoint[0], spawnPoint[1]);
    cannonBall.addToCollisionGroup(this.state.collisionGroup);
    this.game.world.addChild(cannonBall);

    var velocity = rotateVector(this.body.rotation, [0, this.constants.CANNON_BALL_VELOCITY * -1]);
    cannonBall.body.velocity.x = velocity[0];
    cannonBall.body.velocity.y = velocity[1];
    cannonBall.shotBy = this.playerNumber;

    // Kick-back
    this.body.applyForce(
        rotateVector(
            this.body.rotation,
            [0, this.constants.KICK_BACK_FORCE * -1]
        ),
        this.body.x,
        this.body.y
    );
};

Car.prototype.addToCollisionGroup = function(collisionGroup)
{
    this.body.setCollisionGroup(collisionGroup);
    this.body.collides(collisionGroup);
};

module.exports = Car;
