/* globals window */
'use strict';

var Phaser        = require('phaser');
var CarFactory    = require('../objects/car-factory');
var Track         = require('../objects/track');
var React         = require('react');
var TrackSelector = require('../components/track-selector');
var _             = require('underscore');

var TrackLoaderState = function(trackData, debug)
{
    this.trackData = trackData || require('../../assets/tilemaps/maps/square-loop');

    this.debug = _(debug).isUndefined() ? false : debug;

    Phaser.State.apply(this, arguments);

    this.carFactory = new CarFactory(this);
    this.track      = new Track(this);
    this.track.setDebug(this.debug);

    this.lapNumber = 1;

    this.showTrackSelectorOffCanvas();
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
            tileset.properties.path
        );
    });
};

TrackLoaderState.prototype.create = function()
{
    var state = this;

    this.map = this.game.add.tilemap('track');

    this.trackData.tilesets.forEach(function (tileset) {
        state.map.addTilesetImage(tileset.name, tileset.name);
    });

    this.layer = this.map.createLayer('background');

    this.layer.resizeWorld();

    this.game.add.graphics();

    this.placeTrackMarkers();

    this.game.physics.startSystem(Phaser.Physics.P2JS);

    this.game.physics.restitution = 0.8;

    this.collisionGroup = this.game.physics.p2.createCollisionGroup();

    this.game.physics.p2.updateBoundsCollisionGroup();

    this.car = this.carFactory.getNew(this.startingPoint[0], this.startingPoint[1], 'car');
    this.game.world.addChild(this.car);

    this.car.bringToTop();

    this.car.body.setCollisionGroup(this.collisionGroup);
    this.car.body.collides(this.collisionGroup);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.showLapCounter();

    this.game.camera.follow(this.car);
};

TrackLoaderState.prototype.placeTrackMarkers = function()
{
    var data, trackLayer, state = this;

    data = {
        markers : []
    };

    this.trackData.layers.forEach(function (layer) {
        if (layer.name === 'track') {
            trackLayer = layer;
        }
    });

    if (! trackLayer) {
        return;
    }

    _(trackLayer.objects).each(function (object) {
        var x, y;
        // Positions from file are the edge of the marker, but we
        // need the center.
        switch (object.rotation) {
            case 0 :
                x = object.x + (object.width / 2);
                y = object.y;
                break;
            case 90 :
                x = object.x;
                y = object.y + (object.width / 2);
                break;
            case 180 :
                x = object.x - (object.width / 2);
                y = object.y;
                break;
            case 270 :
                x = object.x;
                y = object.y - (object.width / 2);
                break;
            default :
                throw new Error('Unsupported marker angle:' + object.rotation);
        }

        if (object.name === 'finish-line') {
            data.finishLine = [
                x,
                y,
                object.rotation,
                object.width
            ];

            state.startingPoint = [x, y];
        } else {
            data.markers[object.properties.index] = [
                x,
                y,
                object.rotation,
                object.width
            ];
        }
    });

    this.track.loadFromObject(data);

    this.track.setLapCompletedCallback(this.incrementLapCounter, this);
    this.track.setMarkerSkippedCallback(this.moveCarToLastActivatedMarker, this);
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

TrackLoaderState.prototype.selectTrack = function(trackData)
{
    this.game.state.add('track-loader', new TrackLoaderState(trackData, this.debug), true);
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
            onSelectTrack     : this.selectTrack.bind(this),
            onChangeDebugMode : this.changeDebugMode.bind(this)
        }),
        window.document.getElementById('content')
    );
};

module.exports = TrackLoaderState;
