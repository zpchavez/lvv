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
            tileset.name,
            tileset.imagePath
        );
    });

    this.obstacleFactory.loadAssets(_.keys(this.trackData.placedObjectClasses));
};

TrackLoaderState.prototype.create = function()
{
    this.showTrackSelectorOffCanvas();

    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.game.physics.restitution = 0.8;

    this.initTrack();

    this.initPlayers();

    this.showLapCounter();

    this.game.camera.follow(this.car);

    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.input.onDown.add(this.toggleFullscreen, this);

    this.game.add.graphics();
};

TrackLoaderState.prototype.initTrack = function()
{
    var state = this;

    this.map = this.game.add.tilemap('track');

    this.trackData.tilesets.forEach(function (tileset) {
        state.map.addTilesetImage(tileset.name, tileset.name);
    });

    this.layer = this.map.createLayer('background');

    this.layer.resizeWorld();

    // Now that world size is set, we can create the main collision group
    this.collisionGroup = this.game.physics.p2.createCollisionGroup();
    this.game.physics.p2.updateBoundsCollisionGroup();

    this.placeTrackMarkers();

    this.placeObstacles();
};

TrackLoaderState.prototype.initPlayers = function()
{
    this.car = this.carFactory.getNew(this.startingPoint[0], this.startingPoint[1], 'car');
    this.car.body.angle = this.startingPoint[2];
    this.game.world.addChild(this.car);

    this.car.bringToTop();

    this.car.body.setCollisionGroup(this.collisionGroup);
    this.car.body.collides(this.collisionGroup);

    this.cursors = this.game.input.keyboard.createCursorKeys();
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

            state.startingPoint = [object.x, object.y, object.rotation];
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

TrackLoaderState.prototype.moveCarToLastActivatedMarker = function()
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

TrackLoaderState.prototype.showTrackSelectorOffCanvas = function()
{
    React.render(
        React.createElement(TrackSelector, {
            phaserLoader      : this.load,
            onSelectTrack     : this.selectTrack.bind(this),
            onChangeDebugMode : this.changeDebugMode.bind(this)
        }),
        window.document.getElementById('content')
    );
};

TrackLoaderState.prototype.toggleFullscreen = function()
{
    if (this.game.scale.isFullScreen) {
        this.game.scale.stopFullScreen();
    } else {
        this.game.scale.startFullScreen(false);
    }
};

module.exports = TrackLoaderState;
