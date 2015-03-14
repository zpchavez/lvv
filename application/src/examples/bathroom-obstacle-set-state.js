'use strict';

var Phaser          = require('phaser');
var _               = require('underscore');
var CarFactory      = require('../objects/car-factory');
var ObstacleFactory = require('../objects/obstacles/obstacle-factory');

var makeObstacles = function(context) {
    var obstacles = [];

    obstacles.push(context.obstacleFactory.getNew('Toothbrush', 450, 800, 0));

    obstacles.push(context.obstacleFactory.getNew('Comb', 100, 315, 90));

    obstacles.push(context.obstacleFactory.getNew('Floss', 1000, 580, 45));

    obstacles.push(context.obstacleFactory.getNew('AspirinBottle', 850, 220, 270));

    obstacles.push(context.obstacleFactory.getNew('AspirinPill', 550, 210, Math.random() * 180));
    obstacles.push(context.obstacleFactory.getNew('AspirinPill', 250, 180, Math.random() * 180));
    obstacles.push(context.obstacleFactory.getNew('AspirinPill', 292, 190, Math.random() * 180));
    obstacles.push(context.obstacleFactory.getNew('AspirinPill', 429, 195, Math.random() * 180));
    obstacles.push(context.obstacleFactory.getNew('AspirinPill', 310, 222, Math.random() * 180));
    obstacles.push(context.obstacleFactory.getNew('AspirinPill', 460, 240, Math.random() * 180));
    obstacles.push(context.obstacleFactory.getNew('AspirinPill', 510, 270, Math.random() * 180));
    obstacles.push(context.obstacleFactory.getNew('AspirinPill', 240, 310, Math.random() * 180));
    obstacles.push(context.obstacleFactory.getNew('AspirinPill', 320, 340, Math.random() * 180));
    obstacles.push(context.obstacleFactory.getNew('AspirinPill', 435, 355, Math.random() * 180));
    obstacles.push(context.obstacleFactory.getNew('AspirinPill', 520, 375, Math.random() * 180));
    obstacles.push(context.obstacleFactory.getNew('AspirinPill', 475, 250, Math.random() * 180));
    obstacles.push(context.obstacleFactory.getNew('AspirinPill', 510, 260, Math.random() * 180));

    obstacles.push(context.obstacleFactory.getNew('Razor', 490, 600, 90));

    _.each(obstacles, function(obstacle) {
        obstacle.body.setCollisionGroup(context.collisionGroup);
        obstacle.body.collides(context.collisionGroup);
        context.add.existing(obstacle);
    });
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
       'AspirinBottle',
       'AspirinPill',
       'Toothbrush',
       'Comb',
       'Floss',
       'Razor'
    ]);
    this.carFactory.loadAssets();

    this.load.image('dirt', 'assets/img/dirt.png');
};

CarDrivingState.prototype.create = function()
{
    this.add.tileSprite(0, 0, 1200, 900, 'dirt');
    this.game.world.setBounds(0, 0, 1200, 900);

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
