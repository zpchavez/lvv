'use strict';

var Phaser          = require('phaser');
var _               = require('underscore');
var CarFactory      = require('../objects/car-factory');
var ObstacleFactory = require('../objects/obstacles/obstacle-factory');

var makeObstacles = function(context) {
    context.boxes = [];

    for (var i = 0; i < 10; i += 1) {
        for (var j = 0; j < 10; j += 1) {
            var greyBox = context.obstacleFactory.getNew('DynamicBox',
                100 + 80 * i,
                100 + 75 * j + i * 3,
                context.collisionGroup
            );
            greyBox.body.collides(context.collisionGroup);
            context.add.existing(greyBox);
        }
    }

    for (var x = 0; x < 60; x += 1) {
        for (var y = 0; y < 2; y += 1) {
            var blackBox = context.add.sprite(1200 + 300 * y, 100 + 100 * x, 'box-black');
            context.game.physics.p2.enable(blackBox);
            blackBox.body.setCollisionGroup(context.collisionGroup);
            blackBox.body.collides(context.collisionGroup);
            blackBox.body.dynamic = false;

            context.boxes.push(blackBox);
        }
    }

    var ball = context.obstacleFactory.getNew('ClownNose',
        850,
        1400,
        context.collisionGroup
    );
    ball.body.collides(context.collisionGroup);
    context.add.existing(ball);
};

var CarDrivingState = function()
{
    Phaser.State.apply(this, arguments);

    this.obstacleFactory = new ObstacleFactory(this);
    this.carFactory      = new CarFactory(this);
};

CarDrivingState.prototype = Object.create(Phaser.State.prototype);

CarDrivingState.prototype.preload = function()
{
    this.obstacleFactory.loadAssets([
        'ClownNose',
        'DynamicBox'
    ]);
    this.carFactory.loadAssets();

    this.load.image('dirt', 'assets/img/dirt.png');
    this.load.image('box-black', 'assets/img/black-box.png');
};

CarDrivingState.prototype.create = function()
{
    this.add.tileSprite(0, 0, 1920, 1920, 'dirt');
    this.game.world.setBounds(0, 0, 1920, 1920);

    this.game.physics.startSystem(Phaser.Physics.P2JS);

    this.game.physics.restitution = 0.8;

    this.collisionGroup = this.game.physics.p2.createCollisionGroup();

    this.game.physics.p2.updateBoundsCollisionGroup();

    this.car = this.carFactory.getNew(this.game.world.centerX, this.game.world.centerY, 'car');
    this.game.world.addChild(this.car);

    this.car.body.setCollisionGroup(this.collisionGroup);
    this.car.body.collides(this.collisionGroup);

    makeObstacles(this);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.game.camera.follow(this.car);
};

CarDrivingState.prototype.update = function()
{
    this.car.applyForces();

    if (this.cursors.up.isDown) {
        this.car.accelerate();
    } else if (this.cursors.down.isDown) {
        this.car.brake();
    }

    if (this.cursors.right.isDown) {
        this.car.turnRight();
    } else if (this.cursors.left.isDown) {
        this.car.turnLeft();
    }

    _.each(this.boxes, function(box) {
        if (box.body.dynamic) {
            box.body.applyForce(
                [
                    box.body.velocity.x * 0.2 * box.body.mass,
                    box.body.velocity.y * 0.2 * box.body.mass
                ],
                box.body.x,
                box.body.y
            );
        }

    });
};

module.exports = CarDrivingState;
