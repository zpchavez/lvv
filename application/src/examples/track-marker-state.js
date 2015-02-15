'use strict';

var Phaser             = require('phaser');
var CarFactory         = require('../objects/car-factory');
var TrackMarkerFactory = require('../objects/track-marker-factory.js');
var _                  = require('underscore');

var TrackMarkerState = function()
{
    Phaser.State.apply(this, arguments);

    this.carFactory         = new CarFactory(this);
    this.trackMarkerFactory = new TrackMarkerFactory(this);

    this.lapNumber = 1;
};

TrackMarkerState.prototype = Object.create(Phaser.State.prototype);

TrackMarkerState.prototype.preload = function()
{
    this.carFactory.loadAssets();
    this.trackMarkerFactory.loadAssets();

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

    this.addMarkers();

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

TrackMarkerState.prototype.deactivateMarkers = function()
{
    for (var i = 0; i < this.markers.length - 1; i += 1) {
        this.markers[i].deactivate();
    }
};

TrackMarkerState.prototype.addMarkers = function()
{
    var points, finishLine, state = this;

    this.allowedSkippedMarkers = 0;

    points = [
        [this.game.world.centerX, this.game.world.centerY - 200, 0],
        [this.game.world.centerX, this.game.world.centerY - 600, 0],
        [this.game.world.centerX, this.game.world.centerY - 1000, 0],
        [this.game.world.centerX, this.game.world.centerY - 1400, 0],
        [this.game.world.centerX + 400, this.game.world.centerY - 2400, 90],
        [this.game.world.centerX + 800, this.game.world.centerY - 2400, 90],
        [this.game.world.centerX + 1200, this.game.world.centerY - 2400, 90],
        [this.game.world.centerX + 1600, this.game.world.centerY - 2400, 90],
        [this.game.world.centerX + 2000, this.game.world.centerY - 2400, 90],
        [this.game.world.centerX + 2500, this.game.world.centerY - 1800, 0],
        [this.game.world.centerX + 2500, this.game.world.centerY - 1400, 0],
        [this.game.world.centerX + 2500, this.game.world.centerY - 1000, 0],
        [this.game.world.centerX + 2500, this.game.world.centerY - 600, 0],
        [this.game.world.centerX + 2500, this.game.world.centerY - 200, 0],
        [this.game.world.centerX + 2000, this.game.world.centerY + 400, 90],
        [this.game.world.centerX + 1600, this.game.world.centerY + 400, 90],
        [this.game.world.centerX + 1200, this.game.world.centerY + 400, 90],
        [this.game.world.centerX + 800, this.game.world.centerY + 400, 90]
    ];

    state.markers = [];

    state = this;
    _.each(points, function(point) {
        var marker = state.trackMarkerFactory.createMarker(point[0], point[1], point[2]);
        state.markers.push(marker);
        state.game.world.addChild(marker);
    });

    finishLine = state.trackMarkerFactory.createFinishLine(
        this.game.world.centerX,
        this.game.world.centerY,
        0
    );
    state.game.world.addChild(finishLine);
    state.markers.push(finishLine);

    this.lastActivatedMarker = -1; // -1 means the finish line
};

TrackMarkerState.prototype.moveCarToLastActivatedMarker = function()
{
    // Negative one means the finish line
    if (this.lastActivatedMarker === -1) {
        this.car.body.reset(
            this.markers[this.markers.length - 1].x,
            this.markers[this.markers.length - 1].y
        );
        return;
    }

    this.car.body.reset(
        this.markers[this.lastActivatedMarker].x,
        this.markers[this.lastActivatedMarker].y
    );
};

TrackMarkerState.prototype.update = function()
{
    this.car.applyForces();

    this.enforceTrack();

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

TrackMarkerState.prototype.enforceTrack = function()
{
    var state = this;

    _.each(state.markers, function(marker, index) {
        if (marker.overlap(state.car)) {
            if (marker.activated) {
                return;
            }

            if (marker.isFinishLine && state.lastActivatedMarker === state.markers.length - 2) {
                state.incrementLapCounter();
                state.deactivateMarkers();
                state.lastActivatedMarker = -1;
            } else if (marker.isFinishLine && state.lastActivatedMarker === -1) {
                return;
            } else if ((index - state.lastActivatedMarker - 1) <= state.allowedSkippedMarkers) {
                marker.activate();
                state.lastActivatedMarker = index;
            } else {
                state.moveCarToLastActivatedMarker();
            }
        }
    });
};

module.exports = TrackMarkerState;
