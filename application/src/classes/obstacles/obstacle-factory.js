'use strict';

var _              = require('underscore');
var AspirinBottle  = require('./aspirin-bottle');
var AspirinPill    = require('./aspirin-pill');
var ClownNose      = require('./clown-nose');
var Comb           = require('./comb');
var DynamicBox     = require('./dynamic-box');
var Floss          = require('./floss');
var Razor          = require('./razor');
var StaticBox      = require('./static-box');
var Toothbrush     = require('./toothbrush');
var XboxController = require('./xbox-controller');

var ObstacleFactory = function(state) {
    this.state       = state;
    this.loadedTypes = {};
};

ObstacleFactory.prototype.types = {
    'AspirinBottle'  : AspirinBottle,
    'AspirinPill'    : AspirinPill,
    'ClownNose'      : ClownNose,
    'DynamicBox'     : DynamicBox,
    'Razor'          : Razor,
    'StaticBox'      : StaticBox,
    'Toothbrush'     : Toothbrush,
    'Comb'           : Comb,
    'Floss'          : Floss,
    'XboxController' : XboxController
};

ObstacleFactory.prototype.loadAssets = function(types)
{
    _.each(types, function(type) {
        if (this.types[type]) {
            this.state.load.image(type, this.types[type].prototype.getSpritePath());
            this.loadedTypes[type] = true;
        } else {
            throw new Error('Attempted to load assets for unknown class: ' + type);
        }
    }, this);

    this.state.load.physics('Obstacles', 'assets/physics/obstacles.json');
};

ObstacleFactory.prototype.getNew = function(type, x, y, angle)
{
    if (this.types[type]) {
        if (this.loadedTypes[type]) {
            return new this.types[type](this.state, x, y, type, angle);
        } else {
            throw new Error('Attempted to create unloaded type. Add a call to load assets for ' + type + '.');
        }
    } else {
        throw new Error('Attempted to create unknown class: ' + type);
    }
};

module.exports = ObstacleFactory;
