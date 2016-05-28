/* globals window */
'use strict';

var Phaser           = require('phaser');
var React            = require('react');
var CarFactory       = require('../car-factory');
var ObstacleFactory  = require('../obstacles/obstacle-factory');
var Track            = require('../track');
var TrackSelector    = require('../../components/track-selector');
var TrackLoader      = require('../track-loader');
var Score            = require('../score');
var _                = require('underscore');
var util             = require('../../util');
var playerColorNames = require('../../player-color-names');
var settings         = require('../../settings');

var NEXT_GAME_DELAY  = 5000;
var NEXT_ROUND_DELAY = 2500;

var RaceState = function(trackData, options)
{
    options = options || {};
    _(options).defaults({
        debug       : settings.debug,
        players     : settings.players,
        teams       : settings.teams,
        laps        : settings.laps
    });

    if (options.teams && options.players !== 4) {
        throw new Error('Invalid number of players for team mode');
    }

    this.trackData = trackData;

    this.debug = options.debug;

    Phaser.State.apply(this, arguments);

    this.victorySpinning  = false;
    this.carFactory       = new CarFactory(this, {teams : options.teams});
    this.obstacleFactory  = new ObstacleFactory(this);
    this.track            = new Track(this);
    this.teams            = options.teams;
    this.score            = new Score(this, options.teams ? 2 : options.players);
    this.lapNumber        = 1;
    this.laps             = options.laps;
    this.raceOver         = false;
    this.playerCount      = options.teams ? 4 : options.players;
    this.suddenDeath      = false;
    this.eliminationStack = [];

    this.track.setDebug(this.debug);
};

RaceState.prototype = Object.create(Phaser.State.prototype);

RaceState.prototype.preload = function()
{
    var state = this,
        cacheKey = Phaser.Plugin.Tiled.utils.cacheKey;

    this.game.add.plugin(Phaser.Plugin.Tiled);

    this.carFactory.loadAssets();
    this.track.loadAssets();
    this.score.loadAssets();

    this.load.tiledmap(
        cacheKey('track', 'tiledmap'),
        null,
        this.trackData,
        Phaser.Tilemap.TILED_JSON
    );

    // Load tilesets
    this.trackData.tilesets.forEach(function (tileset) {
        state.load.image(
            cacheKey('track', 'tileset', tileset.name),
            tileset.imageUrl
        );
    });

    // Load image layer assets
    this.trackData.layers.forEach(function (layer) {
        if (layer.type === 'imagelayer') {
            state.load.image(
                cacheKey('track', 'layer', layer.name),
                layer.imageUrl
            );
        }
    });

    this.obstacleFactory.loadAssets(_.keys(this.trackData.placedObjectClasses));
};

RaceState.prototype.create = function()
{
    this.showTrackSelectorOffCanvas();

    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.game.physics.restitution = 0.8;

    this.initTrack();
    this.createStartingPointVectors();
    this.postGameObjectPlacement();
    this.initPlayers();
    this.initScore();
    this.initInputs();
    this.showLapCounter();

    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.input.onDown.add(this.toggleFullscreen, this);

    this.game.add.graphics();
};

RaceState.prototype.initTrack = function()
{
    this.map = this.game.add.tiledmap('track');

    // Now that world size is set, we can create the main collision group
    this.collisionGroup = this.game.physics.p2.createCollisionGroup();
    this.game.physics.p2.updateBoundsCollisionGroup();

    this.placeTrackMarkers();

    this.placeObstacles();
};

RaceState.prototype.createStartingPointVectors = function()
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

RaceState.prototype.initPlayers = function()
{
    var offsetVector, state = this;

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

        if (state.teams) {
            car.teamNumber = [0, 0, 1, 1][index];
        }

        car.body.angle = this.startingPoint[2];
        this.game.world.addChild(car);
        car.bringToTop();

        car.body.setCollisionGroup(this.collisionGroup);
        car.body.collides(this.collisionGroup);
    }, this);
};

RaceState.prototype.initScore = function()
{
    this.score.show();
};

RaceState.prototype.initInputs = function()
{
    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.pads = [];

    for (var i = 0; i < 4; i += 1) {
        this.pads.push(this.game.input.gamepad['pad' + (i + 1)]);
    }

    this.game.input.gamepad.start();
};

RaceState.prototype.placeTrackMarkers = function()
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

    this.track.setLapCompletedCallback(this.completeLap, this);
    this.track.setMarkerSkippedCallback(this.moveCarToLastActivatedMarker, this);
};

RaceState.prototype.placeObstacles = function()
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
        obstacle.addToCollisionGroup(state.collisionGroup);
        obstacle.add(state);
    });
};

RaceState.prototype.postGameObjectPlacement = function()
{
    this.game.world.callAll('postGameObjectPlacement', null);
};

RaceState.prototype.update = function()
{
    this.updateCamera();

    this.eliminateOffCameraPlayers();

    if (this.raceOver) {
        return;
    }

    this.awardPoints();

    this.handleInput();
};

RaceState.prototype.eliminateOffCameraPlayers = function()
{
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
                if (! this.teams && this.playerCount > 2) {
                    this.eliminationStack.push(car.playerNumber);
                }
            }
        }
    }, this);
};

RaceState.prototype.awardPoints = function()
{
    var visibleCars, winningCar;

    if (this.playerCount === 1 || this.victorySpinning) {
        return;
    }

    visibleCars = _.where(this.cars, {visible : true});

    if (this.teams && visibleCars.length === 2 && visibleCars[0].teamNumber === visibleCars[1].teamNumber) {
        visibleCars[0].setVictorySpinning(true);
        visibleCars[1].setVictorySpinning(true);
        winningCar = visibleCars[0];
    } else if (visibleCars.length === 1) {
        visibleCars[0].setVictorySpinning(true);
        winningCar = visibleCars[0];
    }

    if (winningCar) {
        this.victorySpinning = true;

        if (this.playerCount === 2) {
            this.score.awardTwoPlayerPointToPlayer(winningCar.playerNumber);
        } else if (this.teams) {
            this.score.awardTwoPlayerPointToPlayer(winningCar.teamNumber);
        } else {
            this.eliminationStack.push(winningCar.playerNumber);
            this.score.awardPointsForFreeForAll(this.eliminationStack);
        }

        if (this.score.getWinner() === false && ! this.suddenDeath) {
            // Start next round if no overall winner
            this.eliminationStack = [];
            window.setTimeout(_.bind(this.resetAllCarsToLastMarker, this), NEXT_ROUND_DELAY);
        } else {
            this.showWinnerMessage();
            window.setTimeout(_.bind(this.regenerate, this), NEXT_GAME_DELAY);
        }
    }
};

RaceState.prototype.handleInput = function()
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

RaceState.prototype.updateCamera = function()
{
    var BUFFER_VALUE           = 100,
        averagePlayerPosition  = [0,0],
        carCount               = 0,
        nextMarker             = this.track.getNextMarker(),
        closestCar,
        closestSquaredDistance = Infinity,
        squaredDistance;

    for (var i = 0; i < this.playerCount; i += 1) {
        if (this.cars[i].visible && ! this.cars[i].falling) {
            averagePlayerPosition[0] += this.cars[i].x;
            averagePlayerPosition[1] += this.cars[i].y;
            carCount += 1;

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
    }

    // Divide-by-zero safeguard
    if (carCount === 0) {
        return;
    }

    averagePlayerPosition[0] /= carCount;
    averagePlayerPosition[1] /= carCount;

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

RaceState.prototype.handleDrops = function(car)
{
    var width  = this.map.scaledTileWidth,
        height = this.map.scaledTileHeight;

    if (this.map.getTilelayerIndex('drops') !== -1) {
        if (car.falling || car.airborne || car.onRamp) {
            return;
        }

        if (this.map.getTileWorldXY(car.x, car.y, width, height, 'drops')) {
            car.fall({
                // This determines the center of the pit tile the car is above
                x : Math.floor(car.x / width) * width + (width / 2),
                y : Math.floor(car.y / height) * height + (height / 2)
            });
        }
    }
};

RaceState.prototype.handleRamps = function(car)
{
    if (this.map.getTilelayerIndex('ramps') !== -1) {
        if (car.falling || car.airborne) {
            return;
        }

        if (this.map.getTileWorldXY(car.x, car.y, 32, 32, 'ramps')) {
            car.onRamp = true;
        } else if (car.onRamp) {
            // If a car has just left a ramp tile, then call jump
            car.onRamp = false;
            car.jump();
        }
    }
};

RaceState.prototype.handleRoughTerrain = function(car)
{
    if (this.map.getTilelayerIndex('rough') !== -1) {
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
RaceState.prototype.easeCamera = function(x, y)
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

RaceState.prototype.moveCarToLastActivatedMarker = function(car)
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

RaceState.prototype.resetAllCarsToLastMarker = function()
{
    this.victorySpinning = false;

    _.each(this.cars, function(car, i) {
        car.visible = true;
        car.setVictorySpinning(false);
        this.moveCarToLastActivatedMarker(car);
    }, this);

    this.updateCamera();
};

RaceState.prototype.showLapCounter = function()
{
    this.lapDisplay = this.game.add.text(
        30,
        20,
        'Lap ' + this.lapNumber,
        {
            font            : "22px Arial",
            fill            : "#ffffff",
            stroke          : '#000000',
            strokeThickness : 3
        }
    );
    this.lapDisplay.fixedToCamera = true;
};

RaceState.prototype.showWinnerMessage = function()
{
    var winningPlayerOrTeamNumber = this.score.getWinner() || this.score.getLeaders()[0];

    this.showMessage(
        playerColorNames[winningPlayerOrTeamNumber]
            .toUpperCase()
            .concat(' WINS!'),
        {showFor : NEXT_GAME_DELAY}
    );
};

RaceState.prototype.showMessage = function(text, options)
{
    options = options || {};

    _(options).defaults({
        showFor         : 3000,
        font            : '42px Arial',
        fill            : '#ffffff',
        stroke          : '#000000',
        strokeThickness : 5
    });

    this.message = this.game.add.text(
        this.game.width / 2,
        this.game.height / 2,
        text,
        {
            font            : options.font,
            fill            : options.fill,
            stroke          : options.stroke,
            strokeThickness : options.strokeThickness
        }
    );
    this.message.fixedToCamera = true;
    this.message.anchor.setTo(0.5, 0.5);

    if (options.showFor) {
        window.setTimeout(
            this.message.destroy.bind(this.message),
            options.showFor
        );
    }
};

RaceState.prototype.completeLap = function()
{
    var leaderNumbers, leadingCars = [], state = this;

    if (this.lapNumber === this.laps) {
        leaderNumbers = this.score.getLeaders();

        // Eliminate non-leaders
        this.cars.map(function (car) {
            if (_(leaderNumbers).contains(state.teams ? car.teamNumber : car.playerNumber)) {
                leadingCars.push(car);
            } else {
                car.visible = false;
            }
        });

        if (leadingCars.length === 1) {
            leadingCars[0].setVictorySpinning(true);
            this.raceOver = true;
        } else if (leadingCars.length === 2 && this.teams && leadingCars[0].teamNumber === leadingCars[1].teamNumber) {
            leadingCars[0].setVictorySpinning(true);
            leadingCars[1].setVictorySpinning(true);
            this.raceOver = true;
        } else if (this.playerCount > 1) {
            this.suddenDeath = true;
            this.showMessage('Showdown!');
        }
    }

    if (this.raceOver) {
        this.showWinnerMessage();
        window.setTimeout(_.bind(this.regenerate, this), NEXT_GAME_DELAY);
    } else {
        this.lapNumber += 1;
        this.lapDisplay.setText('Lap ' + this.lapNumber);
    }
};

RaceState.prototype.selectTrack = function(trackTheme, trackName)
{
    var callback, trackLoader, state = this;

    callback = function(data) {
        state.game.state.add(
            'track-loader',
            new RaceState(
                data,
                {
                    playerCount : state.playerCount,
                    debug       : state.debug,
                    teams       : state.teams,
                    laps        : state.laps
                }
            ),
            true
        );

        state.shutdown();
    };

    trackLoader = new TrackLoader(this.load);

    trackLoader.load(trackTheme, trackName, callback);
};

RaceState.prototype.changeDebugMode = function(value)
{
    if (value) {
        this.track.enableDebug();
        this.debug = true;
    } else {
        this.track.disableDebug();
        this.debug = false;
    }
};

RaceState.prototype.changeNumberOfPlayers = function(value, teams)
{
    teams = _(teams).isUndefined() ? false : teams;

    this.playerCount = value;
    this.teams       = teams;

    this.reload();
};

RaceState.prototype.setLaps = function(laps)
{
    this.laps = laps;
};

RaceState.prototype.reload = function()
{
    this.game.state.add(
        'track-loader',
        new RaceState(
            this.trackData,
            {
                players : this.playerCount,
                debug   : this.debug,
                teams   : this.teams,
                laps    : this.laps
            }
        ),
        true
    );

    this.shutdown();
};

RaceState.prototype.regenerate = function()
{
    this.selectTrack(
        this.trackSelector.state.selectedTheme,
        this.trackSelector.state.selectedTrack
    );
};

RaceState.prototype.showTrackSelectorOffCanvas = function()
{
    this.trackSelector = React.render(
        React.createElement(TrackSelector, {
            phaserLoader            : this.load,
            onSelectTrack           : this.selectTrack.bind(this),
            onChangeDebugMode       : this.changeDebugMode.bind(this),
            onChangeNumberOfPlayers : this.changeNumberOfPlayers.bind(this),
            onSelectLaps            : this.setLaps.bind(this),
            initialPlayers          : this.teams ? 'teams' : this.playerCount,
            initialDebug            : this.debug,
            initialLaps             : this.laps
        }),
        window.document.getElementById('content')
    );
};

RaceState.prototype.toggleFullscreen = function()
{
    if (this.game.scale.isFullScreen) {
        this.game.scale.stopFullScreen();
    } else {
        this.game.scale.startFullScreen(false);
    }
};

module.exports = RaceState;