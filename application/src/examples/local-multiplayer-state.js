/* globals window */
'use strict';

var Phaser          = require('phaser');
var React           = require('react');
var CarFactory      = require('../objects/car-factory');
var ObstacleFactory = require('../objects/obstacles/obstacle-factory');
var Track           = require('../objects/track');
var TrackSelector   = require('../components/track-selector');
var TrackLoader     = require('../objects/track-loader');
var _               = require('underscore');

var TrackLoaderState = function(trackData, debug)
{
    this.trackData = trackData;

    this.debug = _(debug).isUndefined() ? false : debug;

    Phaser.State.apply(this, arguments);

    this.carFactory      = new CarFactory(this);
    this.obstacleFactory = new ObstacleFactory(this);
    this.track           = new Track(this);
    this.track.setDebug(this.debug);
    this.lapNumber = 1;
    this.playerCount = 1;
};

TrackLoaderState.prototype = Object.create(Phaser.State.prototype);

TrackLoaderState.prototype.preload = function()
{
    var state = this;

    this.carFactory.loadAssets();
    this.track.loadAssets();

    this.load.tilemap(
        'track',
        null,
        this.trackData,
        Phaser.Tilemap.TILED_JSON
    );

    // Load tilesets
    this.trackData.tilesets.forEach(function (tileset) {
        state.load.image(
            'tiles',
            tileset.imagePath
        );
    });

    this.obstacleFactory.loadAssets(_.keys(this.trackData.placedObjectClasses));
};

TrackLoaderState.prototype.create = function()
{
    var state = this;

    this.showTrackSelectorOffCanvas();

    this.map = this.game.add.tilemap('track');

    this.trackData.tilesets.forEach(function (tileset) {
        state.map.addTilesetImage(tileset.name, 'tiles');
    });

    this.layer = this.map.createLayer('background');

    this.layer.resizeWorld();

    this.game.add.graphics();

    this.placeTrackMarkers();

    this.game.physics.startSystem(Phaser.Physics.P2JS);

    this.game.physics.restitution = 0.8;

    this.collisionGroup = this.game.physics.p2.createCollisionGroup();

    this.game.physics.p2.updateBoundsCollisionGroup();

    this.cars = [];

    for (var i = 0; i < this.playerCount; i++) {
        this.cars.push(this.carFactory.getNew(this.startingPoint[0] + 60 * i, this.startingPoint[1], 'car'))
    };

    _.each(this.cars, function(car) {
        this.game.world.addChild(car);
        car.bringToTop();

        car.body.setCollisionGroup(this.collisionGroup);
        car.body.collides(this.collisionGroup);
    }, this);

    this.placeObstacles();

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.pads = [];

    for (var i = 0; i < 4; i++) {
        this.pads.push(this.game.input.gamepad['pad' + (i + 1)]);
    };

    this.game.input.gamepad.start();

    this.showLapCounter();
};

TrackLoaderState.prototype.placeTrackMarkers = function()
{
    var data, trackLayer, state = this;

    data = {
        markers : []
    };

    trackLayer = _.findWhere(this.trackData.layers, {name : 'track'});

    if (! trackLayer) {
        return;
    }

    _(trackLayer.objects).each(function (object) {
        if (object.name === 'finish-line') {
            data.finishLine = [
                object.x,
                object.y,
                object.rotation,
                object.width
            ];

            state.startingPoint = [object.x, object.y];
        } else {
            data.markers[object.properties.index] = [
                object.x,
                object.y,
                object.rotation,
                object.width
            ];
        }
    });

    this.track.loadFromObject(data);

    this.track.setLapCompletedCallback(this.incrementLapCounter, this);
    this.track.setMarkerSkippedCallback(this.moveCarToLastActivatedMarker, this);
};

TrackLoaderState.prototype.placeObstacles = function()
{
    var obstacles = [], obstaclesLayer, state = this;

    obstaclesLayer = _.findWhere(this.trackData.layers, {name : 'obstacles'});

    if (! obstaclesLayer) {
        return;
    }

    obstaclesLayer.objects.forEach(function(obstacle) {
        obstacles.push(state.obstacleFactory.getNew(
            obstacle.type,
            obstacle.x,
            obstacle.y,
            obstacle.rotation
        ));
    });

    obstacles.forEach(function(obstacle) {
        obstacle.body.setCollisionGroup(state.collisionGroup);
        obstacle.body.collides(state.collisionGroup);
        state.add.existing(obstacle);
    });
};

TrackLoaderState.prototype.update = function()
{
    var averagePlayerPosition = [0,0];

    _.each(this.cars, function(car) {
        car.applyForces();
        this.track.enforce(car);
    }, this);

    if (this.cursors.up.isDown) {
        this.cars[0].accelerate();
    } else if (this.cursors.down.isDown) {
        this.cars[0].brake();
    }

    if (this.cursors.right.isDown) {
        this.cars[0].turnRight();
    } else if (this.cursors.left.isDown) {
        this.cars[0].turnLeft();
    }

    for (var i = 0; i < this.playerCount; i++) {
        if (this.pads[i].isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) ||
            this.pads[i].axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
            this.cars[i].turnLeft();
            console.log('turning left');
        } else if (this.pads[i].isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) ||
            this.pads[i].axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
            this.cars[i].turnRight();
            console.log('turning right');
        }

        if (this.pads[i].isDown(Phaser.Gamepad.XBOX360_A)) {
            this.cars[i].accelerate();
        }

        if (this.pads[i].isDown(Phaser.Gamepad.XBOX360_X)) {
            this.cars[i].brake();
        }

        averagePlayerPosition[0] += this.cars[i].x;
        averagePlayerPosition[1] += this.cars[i].y;
    };

    averagePlayerPosition[0] /= this.playerCount;
    averagePlayerPosition[1] /= this.playerCount;

    this.game.camera.focusOnXY(averagePlayerPosition[0], averagePlayerPosition[1]);
};

TrackLoaderState.prototype.moveCarToLastActivatedMarker = function(car)
{
    // Negative one means the finish line
    if (this.track.lastActivatedMarker === -1) {
        car.body.reset(
            this.track.finish.x,
            this.track.finish.y
        );
        car.body.angle = this.track.finish.angle;
        return;
    }

    car.body.reset(
        this.track.markers[this.track.lastActivatedMarker].x,
        this.track.markers[this.track.lastActivatedMarker].y
    );
    car.body.angle = this.track.markers[this.track.lastActivatedMarker].angle;
};

TrackLoaderState.prototype.showLapCounter = function()
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

TrackLoaderState.prototype.incrementLapCounter = function()
{
    this.lapNumber += 1;
    this.lapDisplay.setText('Lap ' + this.lapNumber);
};

TrackLoaderState.prototype.selectTrack = function(trackTheme, trackName)
{
    var callback, trackLoader, state = this;

    callback = function(data) {
        state.game.state.add('track-loader', new TrackLoaderState(data, state.debug), true);
    };

    trackLoader = new TrackLoader(this.load);

    trackLoader.load(trackTheme, trackName, callback);
};

TrackLoaderState.prototype.changeDebugMode = function(value)
{
    if (value) {
        this.track.enableDebug();
        this.debug = true;
    } else {
        this.track.disableDebug();
        this.debug = false;
    }
};

TrackLoaderState.prototype.changeNumberOfPlayers = function(value)
{
    this.playerCount = value;

    _.each(this.cars, function(car) {
        car.destroy()
    });

    this.cars = [];

    for (var i = 0; i < this.playerCount; i++) {
        this.cars.push(this.carFactory.getNew(this.startingPoint[0] + 60 * i, this.startingPoint[1], 'car'))
    };

    _.each(this.cars, function(car) {
        this.game.world.addChild(car);
        car.bringToTop();

        car.body.setCollisionGroup(this.collisionGroup);
        car.body.collides(this.collisionGroup);
    }, this);
};

TrackLoaderState.prototype.showTrackSelectorOffCanvas = function()
{
    React.render(
        React.createElement(TrackSelector, {
            phaserLoader            : this.load,
            onSelectTrack           : this.selectTrack.bind(this),
            onChangeDebugMode       : this.changeDebugMode.bind(this),
            onChangeNumberOfPlayers : this.changeNumberOfPlayers.bind(this)
        }),
        window.document.getElementById('content')
    );
};

module.exports = TrackLoaderState;
