/* globals window */
'use strict';

var Phaser          = require('phaser');
var React           = require('react');
var CarFactory      = require('../car-factory');
var ObstacleFactory = require('../obstacles/obstacle-factory');
var Track           = require('../track');
var TrackSelector   = require('../../components/track-selector');
var TrackLoader     = require('../track-loader');
var Score           = require('../score');
var _               = require('underscore');
var util            = require('../../util');

var TrackLoaderState = function(trackData, playerCount, debug)
{
    this.trackData = trackData;

    this.debug = _(debug).isUndefined() ? false : debug;

    Phaser.State.apply(this, arguments);

    this.carFactory      = new CarFactory(this);
    this.obstacleFactory = new ObstacleFactory(this);
    this.track           = new Track(this);
    this.score           = new Score(this, playerCount);
    this.track.setDebug(this.debug);
    this.lapNumber = 1;
    this.playerCount = playerCount || 1;
};

TrackLoaderState.prototype = Object.create(Phaser.State.prototype);

TrackLoaderState.prototype.preload = function()
{
    var state = this;

    this.carFactory.loadAssets();
    this.track.loadAssets();
    this.score.loadAssets();

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
    this.createStartingPointVectors();
    this.initPlayers();
    this.initScore();
    this.initInputs();

    this.showLapCounter();

    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.input.onDown.add(this.toggleFullscreen, this);

    this.game.add.graphics();
};

TrackLoaderState.prototype.initTrack = function()
{
    var backgroundLayer, state = this;

    this.map = this.game.add.tilemap('track');

    this.trackData.tilesets.forEach(function (tileset) {
        state.map.addTilesetImage(tileset.name, tileset.name);
    });

    backgroundLayer = this.map.createLayer('background');
    backgroundLayer.resizeWorld();

    // Now that world size is set, we can create the main collision group
    this.collisionGroup = this.game.physics.p2.createCollisionGroup();
    this.game.physics.p2.updateBoundsCollisionGroup();

    this.placeTrackMarkers();

    this.placeObstacles();
};

TrackLoaderState.prototype.createStartingPointVectors = function()
{
    var xOffset = 20;
    var yOffset = 30;

    if (this.playerCount > 1) {
        if (this.playerCount === 2) {
            this.startingPointVectors = _.shuffle([
                [xOffset, 0],
                [-xOffset, 0]
            ]);
        } else {
            this.startingPointVectors = _.shuffle([
                [xOffset, yOffset],
                [-xOffset, yOffset],
                [-xOffset, -yOffset],
                [xOffset, -yOffset]
            ]);
        }
    } else {
        this.startingPointVectors = [[0,0]];
    }
};

TrackLoaderState.prototype.initPlayers = function()
{
    var offsetVector;

    this.cars = [];

    for (var i = 0; i < this.playerCount; i += 1) {
        offsetVector = util.rotateVector(this.startingPoint[2] * Math.PI / 180, this.startingPointVectors[i]);

        this.cars.push(this.carFactory.getNew(
            this.startingPoint[0] + offsetVector[0],
            this.startingPoint[1] + offsetVector[1],
            'player' + (i + 1)
        ));
    }

    _.each(this.cars, function(car, index) {
        car.playerNumber = index;
        car.body.angle = this.startingPoint[2];
        this.game.world.addChild(car);
        car.bringToTop();

        car.body.setCollisionGroup(this.collisionGroup);
        car.body.collides(this.collisionGroup);
    }, this);
};

TrackLoaderState.prototype.initScore = function()
{
    this.score.show();
};

TrackLoaderState.prototype.initInputs = function()
{
    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.pads = [];

    for (var i = 0; i < 4; i += 1) {
        this.pads.push(this.game.input.gamepad['pad' + (i + 1)]);
    }

    this.game.input.gamepad.start();
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
    var visibleCars;

    this.updateCamera();

    _.each(this.cars, function(car) {
        if (car.visible) {
            car.applyForces();

            this.track.enforce(car);

            this.handleDrops(car);
            this.handleRamps(car);
            this.handleRoughTerrain(car);

            // If playing multiplayer, eliminate cars that go off-screen
            if (this.playerCount > 1 && (
                car.x < this.game.camera.x ||
                car.x > (this.game.camera.x + this.game.camera.width) ||
                car.y < this.game.camera.y ||
                car.y > (this.game.camera.y + this.game.camera.height)))
            {
                car.visible = false;
            }
        }
    }, this);

    if (this.playerCount > 1) {
        visibleCars = _.where(this.cars, {visible : true});

        if (visibleCars.length === 1 && ! visibleCars[0].victorySpinning) {
            visibleCars[0].setVictorySpinning(true);

            if (this.playerCount === 2) {
                this.score.awardTwoPlayerPointToPlayer(visibleCars[0].playerNumber);
            }

            if (this.score.getWinner() === false) {
                window.setTimeout(_.bind(this.resetAllCarsToLastMarker, this), 2500);
            }
        }
    }

    this.handleInput();
};

TrackLoaderState.prototype.handleInput = function()
{
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

    if (this.playerCount > 1) {
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.W)) {
            this.cars[1].accelerate();
        } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            this.cars[1].brake();
        }

        if (this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            this.cars[1].turnRight();
        } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            this.cars[1].turnLeft();
        }
    }

    for (var i = 0; i < this.playerCount; i += 1) {
        if (this.pads[i].isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) ||
            this.pads[i].axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
            this.cars[i].turnLeft();
        } else if (this.pads[i].isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) ||
            this.pads[i].axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
            this.cars[i].turnRight();
        }

        if (this.pads[i].isDown(Phaser.Gamepad.XBOX360_A)) {
            this.cars[i].accelerate();
        }

        if (this.pads[i].isDown(Phaser.Gamepad.XBOX360_X)) {
            this.cars[i].brake();
        }
    }
};

TrackLoaderState.prototype.updateCamera = function()
{
    var BUFFER_VALUE           = 100,
        averagePlayerPosition  = [0,0],
        carCount               = 0,
        nextMarker             = this.track.getNextMarker(),
        closestCar,
        closestSquaredDistance = Infinity,
        squaredDistance;

    for (var i = 0; i < this.playerCount; i += 1) {
        if (this.cars[i].visible) {
            averagePlayerPosition[0] += this.cars[i].x;
            averagePlayerPosition[1] += this.cars[i].y;
            carCount += 1;
        }

        squaredDistance = (
            Math.pow(this.cars[i].x - nextMarker.x, 2) +
            Math.pow(this.cars[i].y - nextMarker.y, 2)
        );

        if (squaredDistance < closestSquaredDistance) {
            closestSquaredDistance = squaredDistance;
            closestCar             = {
                x : this.cars[i].x,
                y : this.cars[i].y
            };
        }
    }

    if (carCount > 0) {
        averagePlayerPosition[0] /= carCount;
        averagePlayerPosition[1] /= carCount;
    } else {
        averagePlayerPosition[0] = this.track.getLastActivatedMarker().x;
        averagePlayerPosition[1] = this.track.getLastActivatedMarker().y;
    }



    this.easeCamera(averagePlayerPosition[0], averagePlayerPosition[1]);

    // Nudge camera position to always include car closest to the next checkpoint
    if ((this.game.camera.x + BUFFER_VALUE) > closestCar.x) {
        this.game.camera.x = closestCar.x - BUFFER_VALUE;
    } else if ((this.game.camera.x + this.game.camera.width - BUFFER_VALUE) < closestCar.x) {
        this.game.camera.x = closestCar.x - this.game.camera.width + BUFFER_VALUE;
    }

    if ((this.game.camera.y + BUFFER_VALUE) > closestCar.y) {
        this.game.camera.y = closestCar.y - BUFFER_VALUE;
    } else if ((this.game.camera.y + this.game.camera.height - BUFFER_VALUE) < closestCar.y) {
        this.game.camera.y = closestCar.y - this.game.camera.height + BUFFER_VALUE;
    }
};

TrackLoaderState.prototype.handleDrops = function(car)
{
    if (this.map.getLayerIndex('drops')) {
        if (car.falling || car.airborne) {
            return;
        }

        if (this.map.getTileWorldXY(car.x, car.y, 32, 32, 'drops')) {
            car.fall({
                // This determines the center of the pit tile the car is above
                x : Math.floor(car.x / 32) * 32 + 16,
                y : Math.floor(car.y / 32) * 32 + 16
            });
        }
    }
};

TrackLoaderState.prototype.handleRamps = function(car)
{
    if (this.map.getLayerIndex('ramps')) {
        if (car.falling || car.airborne) {
            return;
        }

        if (this.map.getTileWorldXY(car.x, car.y, 32, 32, 'ramps')) {
            car.onRamp = true;
        } else if (car.onRamp) { // If a car has just left a ramp tile, then call jump
            car.onRamp = false;
            car.jump();
        }
    }
};

TrackLoaderState.prototype.handleRoughTerrain = function(car)
{
    if (this.map.getLayerIndex('rough')) {
        if (car.airborne) {
            return;
        }

        if (this.map.getTileWorldXY(car.x, car.y, 32, 32, 'rough')) {
            car.onRoughTerrain = true;
        } else {
            car.onRoughTerrain = false;
        }
    }
};

// Move camera towards a target point instead of directly to it for a less abrupt transition
TrackLoaderState.prototype.easeCamera = function(x, y)
{
    var currentCenter,
        differenceVector,
        easingMultiplier = 0.2;

    currentCenter = [
        this.game.camera.x + this.game.camera.width / 2,
        this.game.camera.y + this.game.camera.height / 2
    ];

    differenceVector = [
        x - currentCenter[0],
        y - currentCenter[1]
    ];

    this.game.camera.focusOnXY(
        currentCenter[0] + differenceVector[0] * easingMultiplier,
        currentCenter[1] + differenceVector[1] * easingMultiplier
    );
};

TrackLoaderState.prototype.moveCarToLastActivatedMarker = function(car)
{
    var carIndex, offsetVector, lastActivatedMarker;

    carIndex = _.indexOf(this.cars, car);
    if (carIndex !== -1) {
        offsetVector = this.startingPointVectors[carIndex];
    } else {
        offsetVector = [0,0];
    }

    lastActivatedMarker = this.track.getLastActivatedMarker();

    offsetVector = util.rotateVector(
        lastActivatedMarker.angle * Math.PI / 180,
        offsetVector
    );

    car.reset(
        lastActivatedMarker.x + offsetVector[0],
        lastActivatedMarker.y + offsetVector[1]
    );

    car.body.angle = lastActivatedMarker.angle;
};

TrackLoaderState.prototype.resetAllCarsToLastMarker = function()
{
    _.each(this.cars, function(car, i) {
        car.visible = true;
        car.setVictorySpinning(false);
        this.moveCarToLastActivatedMarker(car);
    }, this);

    this.updateCamera();
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
        state.game.state.add('track-loader', new TrackLoaderState(data, state.playerCount, state.debug), true);
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
        car.destroy();
    });

    this.createStartingPointVectors();
    this.initPlayers();

    this.score.reset(this.playerCount);
    this.score.show();
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

TrackLoaderState.prototype.toggleFullscreen = function()
{
    if (this.game.scale.isFullScreen) {
        this.game.scale.stopFullScreen();
    } else {
        this.game.scale.startFullScreen(false);
    }
};

module.exports = TrackLoaderState;