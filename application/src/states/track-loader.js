'use strict';

var Phaser     = require('phaser');
var CarFactory = require('../objects/car-factory');

var TrackLoaderState = function()
{
    Phaser.State.apply(this, arguments);

    this.carFactory = new CarFactory(this);
};

TrackLoaderState.prototype = Object.create(Phaser.State.prototype);

TrackLoaderState.prototype.preload = function()
{
    this.carFactory.loadAssets();

    this.load.tilemap('desert', 'assets/tilemaps/maps/desert.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('tiles', 'assets/tilemaps/tiles/tmw_desert_spacing.png');
};

TrackLoaderState.prototype.create = function()
{
    this.map = this.game.add.tilemap('desert');
    this.map.addTilesetImage('Desert', 'tiles');
    this.layer = this.map.createLayer('Ground');
    this.layer.resizeWorld();
    this.marker = this.game.add.graphics();

    this.game.physics.startSystem(Phaser.Physics.P2JS);

    this.game.physics.restitution = 0.8;

    this.collisionGroup = this.game.physics.p2.createCollisionGroup();

    this.game.physics.p2.updateBoundsCollisionGroup();

    this.car = this.carFactory.getNew(this.game.world.centerX, this.game.world.centerY, 'car');
    this.game.world.addChild(this.car);

    this.car.bringToTop();

    this.car.body.setCollisionGroup(this.collisionGroup);
    this.car.body.collides(this.collisionGroup);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.game.camera.follow(this.car);
};

TrackLoaderState.prototype.update = function()
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

module.exports = TrackLoaderState;
