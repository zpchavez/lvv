/* globals window */
import AbstractState from './abstract-state';
import React from 'react';
import CarFactory from 'app/classes/car-factory';
import ObstacleFactory from 'app/classes/obstacles/obstacle-factory';
import Track from 'app/classes/track';
import Tiled from 'phaser-tiled/src/browser';
import TrackSelector from 'app/components/track-selector';
import TrackLoader from 'app/classes/track-loader';
import Score from 'app/classes/score';
import Controls from 'app/classes/controls';

import _ from 'underscore';
import { rotateVector } from 'app/util';
import playerColorNames from 'app/player-color-names';
import globalState from 'app/global-state';
import OverallScoreState from './overall-score-state';
import PowerupFactory from 'app/classes/powerups/powerup-factory';
import rng from 'app/rng';
import colors from 'app/colors';

const NEXT_GAME_DELAY  = 5000;
const NEXT_ROUND_DELAY = 2500;

class RaceState extends AbstractState
{
    constructor(trackData, options) {
        super(...arguments);

        options = options || {};
        _(options).defaults({
            debug    : globalState.get('debug'),
            players  : globalState.get('players'),
            teams    : globalState.get('teams'),
            laps     : globalState.get('laps'),
            selector : globalState.get('selector'),
        });

        if (! globalState.get('score')) {
            globalState.setInitialScore(options.players, options.teams);
        }

        if (options.teams && options.players !== 4) {
            throw new Error('Invalid number of players for team mode');
        }

        this.trackData = trackData;

        this.debug = options.debug;

        this.victorySpinning  = false;
        this.carFactory       = new CarFactory(this, {teams : options.teams});
        this.obstacleFactory  = new ObstacleFactory(this);
        this.powerupFactory   = new PowerupFactory(this);
        this.track            = new Track(this);
        this.teams            = options.teams;
        this.score            = new Score(this, options.teams ? 2 : options.players);
        this.lapNumber        = 1;
        this.laps             = options.laps;
        this.raceOver         = false;
        this.playerCount      = options.teams ? 4 : options.players;
        this.suddenDeath      = false;
        this.eliminationStack = [];
        this.options          = options;
        // Set this ahead of time to prevent being able to accelerate early
        this.countingDown     = true;

        this.track.setDebug(this.debug);
    }

    preload() {
        super.preload();

        const cacheKey = Tiled.utils.cacheKey;

        this.showMessage('Get Ready!');

        this.game.add.plugin(Tiled);

        this.carFactory.loadAssets();
        this.powerupFactory.loadAssets();
        this.track.loadAssets();
        this.score.loadAssets();

        this.load.tiledmap(
            cacheKey('track', 'tiledmap'),
            null,
            this.trackData,
            Phaser.Tilemap.TILED_JSON
        );

        // Load tilesets
        this.trackData.tilesets.forEach((tileset) => {
            this.load.image(
                cacheKey('track', 'tileset', tileset.name),
                tileset.imageUrl
            );
        });

        // Load image layer assets
        this.trackData.layers.forEach((layer) => {
            if (layer.type === 'imagelayer') {
                this.load.image(
                    cacheKey('track', 'layer', layer.name),
                    layer.imageUrl
                );
            }
        });

        this.obstacleFactory.loadAssets(Object.keys(this.trackData.placedObjectClasses));
    }

    create() {
        super.create();

        if (this.options.selector) {
            this.showTrackSelectorOffCanvas();
        }

        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.restitution = 0.8;

        this.initTrack();
        this.createStartingPointVectors();
        this.postGameObjectPlacement();
        this.placePowerups();
        this.initPlayers();
        this.initScore();
        this.initInputs();
        this.showLapCounter();

        // Set initial camera position. For some reason, the camera
        // will still flash a different position (probably 0,0) at
        // the start of the race, but adding this at least seems to
        // make the camera jump to the real starting position instead
        // of panning to it.
        this.game.camera.setPosition(
            this.startingPoint[0] - (this.game.width / 2),
            this.startingPoint[1] - (this.game.height / 2)
        );

        this.game.add.graphics();

        setTimeout(this.countDown.bind(this));
    }

    countDown() {
        this.countingDown = true;
        var font = '64px Arial';
        this.showMessage(
            '3',
            { showFor: 1000, font: font }
        ).then(this.showMessage.bind(
            this,
            '2',
            { showFor: 1000, font: font }
        )).then(this.showMessage.bind(
            this,
            '1',
            { showFor: 1000, font: font }
        )).then(function() {
            this.countingDown = false;
            this.showMessage('GO!', { showFor: 2000, font: font });
        }.bind(this));
    }

    countDownQuickly() {
        this.countingDown = true;
        var font = '64px Arial';
        this.showMessage(
            'Ready',
            { showFor: 1000, font: font }
        ).then(() => {
            this.countingDown = false;
            this.showMessage(
                'Go!',
                { showFor: 1000, font: font }
            );
        });
    }

    initTrack() {
        this.map = this.game.add.tiledmap('track');

        // Now that world size is set, we can create the main collision group
        this.collisionGroup = this.game.physics.p2.createCollisionGroup();
        this.game.physics.p2.updateBoundsCollisionGroup();

        this.placeTrackMarkers();

        this.placeObstacles();
    }

    createStartingPointVectors() {
        const offset = 40;
        const vectorTemplate = [
            0,
            // Adjust Y value so cars start *behind* the starting line
            (this.startingPoint[2] === 180 || this.startingPoint[2] === 90) ? 30 : 60
        ];

        let vectors = [];
        if (this.playerCount === 1) {
            vectors = [vectorTemplate.slice()];
        } else if (this.playerCount === 2) {
            vectors = [
                vectorTemplate.slice(),
                vectorTemplate.slice(),
            ];
            vectors[0][0] = -(offset / 2);
            vectors[1][0] = offset / 2;
        } else if (this.playerCount === 3) {
            vectors.push(
                vectorTemplate.slice(),
                vectorTemplate.slice(),
                vectorTemplate.slice()
            );
            vectors[1][0] = offset;
            vectors[2][0] = -offset;
        } else if (this.playerCount === 4) {
            vectors.push(
                vectorTemplate.slice(),
                vectorTemplate.slice(),
                vectorTemplate.slice(),
                vectorTemplate.slice()
            );
            vectors[0][0] = -offset - (offset / 2);
            vectors[1][0] = -(offset / 2);
            vectors[2][0] = offset / 2;
            vectors[3][0] = offset + (offset / 2);
        }
        this.startingPointVectors = _.shuffle(vectors);
    }

    initPlayers() {
        let offsetVector;

        this.cars = [];

        for (let i = 0; i < this.playerCount; i += 1) {
            offsetVector = rotateVector(this.startingPoint[2] * Math.PI / 180, this.startingPointVectors[i]);

            this.cars.push(this.carFactory.getNew(
                this.startingPoint[0] + offsetVector[0],
                this.startingPoint[1] + offsetVector[1],
                i
            ));
        }

        this.cars.forEach((car, index) => {
            car.playerNumber = index;

            if (this.teams) {
                car.teamNumber = [0, 0, 1, 1][index];
            }

            car.body.angle = this.startingPoint[2];
            this.game.world.addChild(car);
            car.bringToTop();

            car.addToCollisionGroup(this.collisionGroup);
        }, this);
    }

    initScore() {
        this.score.show();
    }

    initInputs() {
        this.controls = new Controls(this.game);

        for (let i = 0; i < this.playerCount; i += 1) {
            this.controls.onDown(i, 'SPECIAL1', this.cars[i].fire.bind(this.cars[i]))
        }
    }

    placeTrackMarkers() {
        let data, trackLayer;

        data = {
            markers : []
        };

        trackLayer = _.findWhere(this.trackData.layers, {name : 'track'});

        if (! trackLayer) {
            return;
        }

        trackLayer.objects.forEach((object) => {
            if (object.name === 'finish-line') {
                data.finishLine = [
                    object.x,
                    object.y,
                    object.rotation,
                    object.width
                ];

                this.startingPoint = [object.x, object.y, object.rotation];
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
    }

    placeObstacles() {
        let obstacles = [], obstaclesLayer;

        obstaclesLayer = _.findWhere(this.trackData.layers, {name : 'obstacles'});

        if (! obstaclesLayer) {
            return;
        }

        obstaclesLayer.objects.forEach((obstacle) => {
            obstacles.push(this.obstacleFactory.getNew(
                obstacle.type,
                obstacle.x,
                obstacle.y,
                obstacle.rotation
            ));
        });

        obstacles.forEach((obstacle) => {
            obstacle.addToCollisionGroup(this.collisionGroup);
            obstacle.add(this);
        });
        this.obstacles = obstacles;
    }

    postGameObjectPlacement() {
        this.game.world.callAll('postGameObjectPlacement', null);
    }

    placePowerups() {
        if (! this.trackData.possiblePowerupPoints) {
            return;
        }

        const targetPowerupCount = this.playerCount * 5;

        if (! this.powerups) {
            this.powerups = {}
        }

        // Remove collected powerups
        const omitted = [];
        Object.keys(this.powerups).forEach((index) => {
            if (this.powerups[index].game === null) {
                omitted.push(index);
            }
        });
        this.powerups = _.omit(this.powerups, omitted);

        var currentPowerupCount = Object.keys(this.powerups).length;

        for (let i = currentPowerupCount; i < targetPowerupCount; i += 1) {
            let pointIndex, point;
            do {
                pointIndex = rng.getIntBetween(0, this.trackData.possiblePowerupPoints.length - 1);
            } while(Object.keys(this.powerups).indexOf(pointIndex) !== -1)

            point = this.trackData.possiblePowerupPoints[pointIndex];
            this.powerups[pointIndex] = (
                this.game.world.addChild(
                    this.powerupFactory.getNew(
                        rng.pickValueFromArray(['hover', 'cannon']),
                        point[0],
                        point[1]
                    )
                )
            )
            this.powerups[pointIndex].addToCollisionGroup(this.collisionGroup);
        }
    }

    update() {
        // If all cars are invisible, reset to last marker. This fixes
        // a bug where the game would be stuck if both remaining players
        // were eliminated at the exact same time. This maybe isn't the
        // best solution since no points are awarded. Everyone just gets a do-over.
        if (_.every(this.cars, (car) => {return ! car.visible;})) {
            this.resetAllCarsToLastMarker();
        }

        this.updateCamera();

        this.eliminateOffCameraPlayers();

        if (this.raceOver) {
            return;
        }

        this.awardPoints();

        this.handleInput();
    }

    shutdown() {
        for (let i = 1; i < 5; i += 1) {
            this.game.input.gamepad['pad' + i].onDownCallback = null;
        }
    }

    eliminateOffCameraPlayers() {
        this.cars.forEach((car) => {
            if (car.visible) {
                car.applyForces();

                this.track.enforce(car);

                this.handleWater(car);
                this.handleDrops(car);
                this.handleRamps(car);
                this.handleRoughTerrain(car);

                // If playing multiplayer, eliminate cars that go off-screen
                if (this.playerCount > 1 &&
                    (
                        // car.inWorld is false at unexpected times, so doing this:
                        (
                            car.x < 0 ||
                            car.x > this.game.world.width ||
                            car.y < 0 ||
                            car.y > this.game.world.height
                        ) ||
                        // car.inCamera is false at unexpected times, so doing this:
                        (
                            car.x < this.game.camera.x ||
                            car.x > (this.game.camera.x + this.game.camera.width) ||
                            car.y < this.game.camera.y ||
                            car.y > (this.game.camera.y + this.game.camera.height)
                        )
                    )
                ) {
                    car.visible = false;
                    if (
                        ! this.teams &&
                        this.playerCount > 2 &&
                        this.eliminationStack.indexOf(car.playerNumber) === -1
                    ) {
                        this.eliminationStack.push(car.playerNumber);
                    }
                }
            }
        });
    };

    awardPoints() {
        let visibleCars, winningCar;

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
                this.score.awardPointToTeam(winningCar.playerNumber);
            } else {
                if (this.eliminationStack.indexOf(winningCar.playerNumber) === -1) {
                    this.eliminationStack.push(winningCar.playerNumber);
                }
                this.score.awardPointsForFreeForAll(this.eliminationStack);
            }

            if (this.score.getWinner() === false && ! this.suddenDeath) {
                // Start next round if no overall winner
                this.eliminationStack = [];
                window.setTimeout(this.resetAllCarsToLastMarker.bind(this), NEXT_ROUND_DELAY);
            } else {
                this.showWinnerMessage();
                window.setTimeout(this.nextRace.bind(this), NEXT_GAME_DELAY);
            }
        }
    }

    handleInput() {
        if (this.countingDown) {
            return;
        }

        for (let i = 0; i < this.playerCount; i += 1) {
            if (this.controls.isDown(i, 'ACCEL')) {
                this.cars[i].accelerate();
            }
            if (this.controls.isDown(i, 'BRAKE')) {
                this.cars[i].brake();
            }
            if (this.controls.isDown(i, 'RIGHT')) {
                this.cars[i].turnRight();
            }
            if (this.controls.isDown(i, 'LEFT')) {
                this.cars[i].turnLeft();
            }
        }
    }

    updateCamera() {
        const BUFFER_VALUE = 100,
            averagePlayerPosition = [0,0],
            nextMarker = this.track.getNextMarker();

        let carCount = 0,
            closestCar,
            squaredDistance,
            closestSquaredDistance = Infinity;

        for (let i = 0; i < this.playerCount; i += 1) {
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
                    closestCar = {
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
    }

    handleWater(car) {
        const width = this.map.scaledTileWidth,
            height = this.map.scaledTileHeight;

        if (this.map.getTilelayerIndex('water') !== -1) {
            if (! (car.splashing || car.falling || car.airborne || car.onRamp || car.victorySpinning || car.hovering)) {
                if (this.map.getTileWorldXY(car.x, car.y, width, height, 'water')) {
                    car.splash({
                        x : Math.floor(car.x / width) * width + (width / 2),
                        y : Math.floor(car.y / height) * height + (height / 2)
                    });
                }
            }

            // Obstacles splash too
            this.obstacles.forEach((obstacle) => {
                if (
                    ! obstacle.splashing &&
                    this.map.getTileWorldXY(obstacle.x, obstacle.y, width, height, 'water')
                ) {
                    obstacle.splash({
                        x : Math.floor(obstacle.x / width) * width + (width / 2),
                        y : Math.floor(obstacle.y / height) * height + (height / 2)
                    });
                }
            });
        }
    }

    handleDrops(car)
    {
        const width = this.map.scaledTileWidth,
            height = this.map.scaledTileHeight;

        if (this.map.getTilelayerIndex('drops') !== -1) {
            if (! (car.falling || car.airborne || car.onRamp || car.victorySpinning || car.hovering)) {
                if (this.map.getTileWorldXY(car.x, car.y, width, height, 'drops')) {
                    car.fall({
                        // This determines the center of the pit tile the car is above
                        x : Math.floor(car.x / width) * width + (width / 2),
                        y : Math.floor(car.y / height) * height + (height / 2)
                    });
                }
            }

            // Obstacles fall too
            this.obstacles.forEach((obstacle) => {
                if (
                    ! obstacle.falling &&
                    this.map.getTileWorldXY(obstacle.x, obstacle.y, width, height, 'drops')
                ) {
                    obstacle.fall({
                        // This determines the center of the pit tile the obstacle is above
                        x : Math.floor(obstacle.x / width) * width + (width / 2),
                        y : Math.floor(obstacle.y / height) * height + (height / 2)
                    });
                }
            });
        }
    }

    handleRamps(car) {
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
    }

    handleRoughTerrain(car) {
        if (this.map.getTilelayerIndex('rough') !== -1) {
            if (car.airborne || car.hovering) {
                return;
            }

            if (this.map.getTileWorldXY(car.x, car.y, 32, 32, 'rough')) {
                car.onRoughTerrain = true;
            } else {
                car.onRoughTerrain = false;
            }
        }
    }

    // Move camera towards a target point instead of directly to it for a less abrupt transition
    easeCamera(x, y) {
        const easingMultiplier = 0.2;

        const currentCenter = [
            this.game.camera.x + this.game.camera.width / 2,
            this.game.camera.y + this.game.camera.height / 2
        ];

        const differenceVector = [
            x - currentCenter[0],
            y - currentCenter[1]
        ];

        this.game.camera.focusOnXY(
            currentCenter[0] + differenceVector[0] * easingMultiplier,
            currentCenter[1] + differenceVector[1] * easingMultiplier
        );
    }

    moveCarToLastActivatedMarker(car) {
        if (this.victorySpinning) {
            return;
        }

        const carIndex = _.indexOf(this.cars, car);
        let offsetVector;
        if (carIndex !== -1) {
            offsetVector = this.startingPointVectors[carIndex];
        } else {
            offsetVector = [0,0];
        }

        const lastActivatedMarker = this.track.getLastActivatedMarker();

        offsetVector = rotateVector(
            lastActivatedMarker.angle * Math.PI / 180,
            offsetVector
        );

        car.reset(
            lastActivatedMarker.x + offsetVector[0],
            lastActivatedMarker.y + offsetVector[1]
        );

        car.body.angle = lastActivatedMarker.angle;
    }

    resetAllCarsToLastMarker() {
        this.victorySpinning = false;

        this.cars.forEach((car, i) => {
            car.visible = true;
            car.setVictorySpinning(false);
            car.removePowerups();
            this.moveCarToLastActivatedMarker(car);
        });

        this.updateCamera();

        this.countDownQuickly();
    }

    showLapCounter() {
        this.lapDisplay = this.game.add.text(
            30,
            20,
            'Lap ' + this.lapNumber,
            {
                font : "22px Arial",
                fill : "#ffffff",
                stroke : '#000000',
                strokeThickness : 3
            }
        );
        this.lapDisplay.fixedToCamera = true;
    }

    showWinnerMessage() {
        const winningPlayerOrTeamNumber = this.score.getWinner() || this.score.getLeaders()[0];

        let color;
        if (this.teams) {
            color = winningPlayerOrTeamNumber === 0 ? 'BLUE' : 'RED';
        } else {
            color = colors[globalState.get('colors')[winningPlayerOrTeamNumber]].name.toUpperCase();
        }

        this.showMessage(
            color + ' WINS!',
            {showFor : NEXT_GAME_DELAY}
        );
    }

    showMessage(text, options) {
        options = options || {};

        _(options).defaults({
            showFor         : 3000,
            font            : '42px Arial',
            fill            : '#ffffff',
            stroke          : '#000000',
            strokeThickness : 5
        });

        const message = this.game.add.text(
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
        message.fixedToCamera = true;
        message.anchor.setTo(0.5, 0.5);

        if (options.showFor) {
            return new Promise((resolve) => {
                window.setTimeout(
                    () => {
                        message.destroy();
                        resolve();
                    },
                    options.showFor
                );
            });
        }
    }

    completeLap() {
        const leadingCars = [];

        if (this.lapNumber === this.laps) {
            const leaderNumbers = this.score.getLeaders();

            // Eliminate non-leaders
            this.cars.map((car) => {
                if (_(leaderNumbers).contains(this.teams ? car.teamNumber : car.playerNumber)) {
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
            window.setTimeout(this.nextRace.bind(this), NEXT_GAME_DELAY);
        } else {
            this.lapNumber += 1;
            this.lapDisplay.setText('Lap ' + this.lapNumber);
            this.placePowerups();
        }
    }

    selectTrack(trackTheme, trackName) {
        const callback = (data) => {
            this.game.state.add(
                'track-loader',
                new RaceState(
                    data,
                    {
                        playerCount : this.playerCount,
                        debug       : this.debug,
                        teams       : this.teams,
                        laps        : this.laps
                    }
                ),
                true
            );
            this.shutdown();
        };

        const trackLoader = new TrackLoader(this.load);

        trackLoader.load(trackTheme, trackName, callback);
    }

    changeDebugMode(value) {
        if (value) {
            this.track.enableDebug();
            this.debug = true;
        } else {
            this.track.disableDebug();
            this.debug = false;
        }
    }

    changeNumberOfPlayers(value, teams) {
        teams = _(teams).isUndefined() ? false : teams;

        this.playerCount = value;
        this.teams       = teams;

        this.reload();
    }

    setLaps(laps) {
        this.laps = laps;
    }

    reload() {
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
    }

    nextRace() {
        if (this.trackSelector) {
            this.selectTrack(
                this.trackSelector.state.selectedTheme,
                this.trackSelector.state.selectedTrack
            );
        } else {
            this.game.state.add(
                'loading',
                new OverallScoreState(this.score.getWinner()),
                true
            );
        }
    }

    showTrackSelectorOffCanvas() {
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
    }
}

export default RaceState;
