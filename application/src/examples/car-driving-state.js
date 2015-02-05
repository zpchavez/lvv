'use strict';

var Phaser = require('phaser');
var _      = require('underscore');

var CarDrivingState = function()
{
    Phaser.State.apply(this, arguments);
}

CarDrivingState.prototype = Object.create(Phaser.State.prototype);

CarDrivingState.prototype.preload = function()
{
    this.load.image('dirt', 'assets/img/dirt.png');
    this.load.image('car', 'assets/img/bluebox.png');
    this.load.image('box-black', 'assets/img/black-box.png');
    this.load.image('box-gray', 'assets/img/gray-box.png');
    this.load.image('box-brown', 'assets/img/brown-box.png');
};

CarDrivingState.prototype.create = function()
{
    this.add.tileSprite(0, 0, 1920, 1920, 'dirt');
    this.game.world.setBounds(0, 0, 1920, 1920);

    this.game.physics.startSystem(Phaser.Physics.P2JS);

    this.game.physics.restitution = 0.8;

    this.collisionGroup = this.game.physics.p2.createCollisionGroup();

    this.game.physics.p2.updateBoundsCollisionGroup();

    this.car = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'car');
    this.game.physics.p2.enable(this.car);
    this.car.body.setCollisionGroup(this.collisionGroup);
    this.car.body.collides(this.collisionGroup);

    makeBoxes(this);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.game.camera.follow(this.car);
}

CarDrivingState.prototype.update = function()
{
    this.car.body.setZeroRotation();

    var carRefVelocity = rotateVector(-this.car.body.rotation, [this.car.body.velocity.x, this.car.body.velocity.y]);

    // apply rolling friction
    this.car.body.applyForce(
        rotateVector(this.car.body.rotation, [0, carRefVelocity[1] * 0.1]),
        this.car.body.x,
        this.car.body.y
    );

    // apply skid friction
    this.car.body.applyForce(
        rotateVector(this.car.body.rotation, [carRefVelocity[0] * 0.2, 0]),
        this.car.body.x,
        this.car.body.y
    );


    if (this.cursors.up.isDown) {
        this.car.body.applyForce(
            rotateVector(this.car.body.rotation, [0, 120]),
            this.car.body.x,
            this.car.body.y
        );
    } else if (this.cursors.down.isDown) {
        this.car.body.applyForce(
            rotateVector(this.car.body.rotation, [0, -50]),
            this.car.body.x,
            this.car.body.y
        );
    }

    if (this.cursors.right.isDown) {
        this.car.body.rotateRight(80);
    } else if (this.cursors.left.isDown) {
        this.car.body.rotateLeft(80);
    }

    _.each(this.boxes, function(box){
        box.body.applyForce(
            [
                box.body.velocity.x * 0.2,
                box.body.velocity.y * 0.2
            ],
            box.body.x,
            box.body.y
        );
    });
}

var rotateVector = function(rotation, vector) {
    return [
        vector[0] * Math.cos(rotation) - vector[1] * Math.sin(rotation),
        vector[0] * Math.sin(rotation) + vector[1] * Math.cos(rotation)
    ];
}

var makeBoxes = function(context) {
    var box;

    context.boxes = [];

    box = context.add.sprite(400, 400, 'box-gray');
    context.game.physics.p2.enable(box);
    box.body.setCollisionGroup(context.collisionGroup);
    box.body.collides(context.collisionGroup);

    context.boxes.push(box);
}

module.exports = CarDrivingState;
