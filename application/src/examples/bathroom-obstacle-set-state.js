'use strict';

var Phaser          = require('phaser');
var _               = require('underscore');
var CarFactory      = require('../objects/car-factory');
var ObstacleFactory = require('../objects/obstacles/obstacle-factory');

var makeObstacles = function(context) {
    var toothbrush = context.obstacleFactory.getNew('Toothbrush',
        500,
        700,
        0
    );
    toothbrush.body.setCollisionGroup(context.collisionGroup);
    toothbrush.body.collides(context.collisionGroup);
    context.add.existing(toothbrush);

    var comb = context.obstacleFactory.getNew('Comb',
        100,
        315,
        90
    );
    comb.body.setCollisionGroup(context.collisionGroup);
    comb.body.collides(context.collisionGroup);
    context.add.existing(comb);
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
       'Toothbrush',
       'Comb'
    ]);
    this.carFactory.loadAssets();

    this.load.image('dirt', 'assets/img/dirt.png');
};

CarDrivingState.prototype.create = function()
{
    this.add.tileSprite(0, 0, 1200, 800, 'dirt');
    this.game.world.setBounds(0, 0, 1200, 800);

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
};

module.exports = CarDrivingState;
