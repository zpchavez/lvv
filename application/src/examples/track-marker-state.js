'use strict';

var Phaser     = require('phaser');
var CarFactory = require('../objects/car-factory');
var Track      = require('../objects/track');

var TrackMarkerState = function()
{
    Phaser.State.apply(this, arguments);

    this.carFactory = new CarFactory(this);
    this.track      = new Track(this);

    this.lapNumber = 1;
};

TrackMarkerState.prototype = Object.create(Phaser.State.prototype);

TrackMarkerState.prototype.preload = function()
{
    this.carFactory.loadAssets();
    this.track.loadAssets();

    this.load.image('dirt', 'assets/img/dirt.png');
    this.load.image('box-black', 'assets/img/black-box.png');
    this.load.image('box-gray', 'assets/img/gray-box.png');
    this.load.image('red-circle', 'assets/img/red-circle.png');
};

TrackMarkerState.prototype.create = function()
{
    this.add.tileSprite(0, 0, 6000, 6000, 'dirt');
    this.game.world.setBounds(0, 0, 6000, 6000);

    this.game.physics.startSystem(Phaser.Physics.P2JS);

    this.game.physics.restitution = 0.8;

    this.collisionGroup = this.game.physics.p2.createCollisionGroup();

    this.game.physics.p2.updateBoundsCollisionGroup();

    this.car = this.carFactory.getNew(this.game.world.centerX, this.game.world.centerY, 'car');
    this.game.world.addChild(this.car);

    this.defineTrack();

    // Keep car from going under markers
    this.car.bringToTop();

    this.car.body.setCollisionGroup(this.collisionGroup);
    this.car.body.collides(this.collisionGroup);

    this.cursors  = this.game.input.keyboard.createCursorKeys();
    this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR ]);

    this.showLapCounter();

    this.game.camera.follow(this.car);
};

TrackMarkerState.prototype.showLapCounter = function()
{
    this.lapDisplay = this.game.add.text(
        30,
        20,
        'Lap ' + this.lapNumber,
        {
            font: "22px Arial",
            fill: "#ffffff"
        }
    );
    this.lapDisplay.fixedToCamera = true;
};

TrackMarkerState.prototype.incrementLapCounter = function()
{
    this.lapNumber += 1;
    this.lapDisplay.setText('Lap ' + this.lapNumber);
};

TrackMarkerState.prototype.defineTrack = function()
{
    var data = {};

    data.markers = [
        [this.game.world.centerX, this.game.world.centerY - 200, 0],
        [this.game.world.centerX, this.game.world.centerY - 600, 0],
        [this.game.world.centerX, this.game.world.centerY - 1000, 0],
        [this.game.world.centerX, this.game.world.centerY - 1400, 0],
        [this.game.world.centerX + 400, this.game.world.centerY - 2400, 90],
        [this.game.world.centerX + 800, this.game.world.centerY - 2400, 90],
        [this.game.world.centerX + 1200, this.game.world.centerY - 2400, 90],
        [this.game.world.centerX + 1600, this.game.world.centerY - 2400, 90],
        [this.game.world.centerX + 2000, this.game.world.centerY - 2400, 90],
        [this.game.world.centerX + 2500, this.game.world.centerY - 1800, 180],
        [this.game.world.centerX + 2500, this.game.world.centerY - 1400, 180],
        [this.game.world.centerX + 2500, this.game.world.centerY - 1000, 180],
        [this.game.world.centerX + 2500, this.game.world.centerY - 600, 180],
        [this.game.world.centerX + 2500, this.game.world.centerY - 200, 180],
        [this.game.world.centerX + 2000, this.game.world.centerY + 400, 270],
        [this.game.world.centerX + 1600, this.game.world.centerY + 400, 270],
        [this.game.world.centerX + 1200, this.game.world.centerY + 400, 270],
        [this.game.world.centerX + 800, this.game.world.centerY + 400, 270]
    ];

    data.finishLine = [this.game.world.centerX, this.game.world.centerY, 0];

    this.track.loadFromObject(data);

    this.track.setLapCompletedCallback(this.incrementLapCounter, this);
    this.track.setMarkerSkippedCallback(this.moveCarToLastActivatedMarker, this);
};

TrackMarkerState.prototype.moveCarToLastActivatedMarker = function()
{
    // Negative one means the finish line
    if (this.track.lastActivatedMarker === -1) {
        this.car.body.reset(
            this.track.finish.x,
            this.track.finish.y
        );
        this.car.body.angle = this.track.finish.angle;
        return;
    }

    this.car.body.reset(
        this.track.markers[this.track.lastActivatedMarker].x,
        this.track.markers[this.track.lastActivatedMarker].y
    );
    this.car.body.angle = this.track.markers[this.track.lastActivatedMarker].angle;
};

TrackMarkerState.prototype.update = function()
{
    this.car.applyForces();

    this.track.enforce(this.car);

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

module.exports = TrackMarkerState;
