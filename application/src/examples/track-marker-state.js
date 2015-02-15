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

    this.game.camera.follow(this.car);
};

TrackMarkerState.prototype.addMarkers = function()
{
    var points, state = this;

    this.lastActivatedMarker   = 0;
    this.allowedSkippedMarkers = 0;

    points = [
        [this.game.world.centerX, this.game.world.centerY - 200, 0],
        [this.game.world.centerX, this.game.world.centerY - 600, 0],
        [this.game.world.centerX, this.game.world.centerY - 1000, 0],
        [this.game.world.centerX, this.game.world.centerY - 1400, 0],
        [this.game.world.centerX, this.game.world.centerY - 1800, 0],
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
        [this.game.world.centerX + 800, this.game.world.centerY + 400, 90],
        [this.game.world.centerX + 400, this.game.world.centerY + 400, 90]
    ];

    state.markers = [];

    state = this;
    _.each(points, function(point) {
        var marker = state.trackMarkerFactory.getNew(point[0], point[1], point[2]);
        state.markers.push(marker);
        state.game.world.addChild(marker);
    });
};

// An alternate way to check for overlap. Use with P2.setPostBroadphaseCallback
// Not sure yet which is better so leaving this code here for now.
TrackMarkerState.prototype.checkOverlap = function(body1, body2)
{
    var names = [], bodies = [], carIndex, markerIndex, markerBody;

    names.push(body1.name, body2.name);

    carIndex = names.indexOf('car');
    markerIndex = names.indexOf('marker');

    // If either body is not a car or marker, allow them to collide
    if (carIndex === -1 || markerIndex === -1) {
        return true;
    }

    bodies.push(body1, body2);
    markerBody = bodies[markerIndex];
    if (! markerBody.sprite.activated) {
        markerBody.sprite.activate();
    }

    return false;
};


TrackMarkerState.prototype.update = function()
{
    var state = this;

    state.car.applyForces();

    _.each(state.markers, function(marker, index) {
        if (marker.overlap(state.car)) {
            if (! marker.activated) {
                if ((index - state.lastActivatedMarker - 1) > state.allowedSkippedMarkers) {
                    state.car.body.x = state.markers[state.lastActivatedMarker].x;
                    state.car.body.y = state.markers[state.lastActivatedMarker].y;
                } else {
                    marker.activate();
                    state.lastActivatedMarker = index;
                }
            }
        }
    });

    if (state.cursors.up.isDown) {
        state.car.accelerate();
    } else if (state.cursors.down.isDown) {
        state.car.brake();
    }

    if (state.cursors.right.isDown) {
        state.car.turnRight();
    } else if (state.cursors.left.isDown) {
        state.car.turnLeft();
    }
};

module.exports = TrackMarkerState;
