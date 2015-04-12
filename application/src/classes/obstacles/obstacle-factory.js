'use strict';

var _              = require('underscore');
var AspirinBottle  = require('./aspirin-bottle');
var AspirinPill    = require('./aspirin-pill');
var BathroomSink  = require('./bathroom-sink');
var Binder         = require('./binder');
var ClownNose      = require('./clown-nose');
var Comb           = require('./comb');
var DynamicBox     = require('./dynamic-box');
var Floss          = require('./floss');
var LegalPad       = require('./legal-pad');
var MarkerGreen    = require('./marker-green');
var MarkerRed      = require('./marker-red');
var MarkerBlue     = require('./marker-blue');
var MarkerBlack    = require('./marker-black');
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
    'BathroomSink'  : BathroomSink,
    'Binder'         : Binder,
    'ClownNose'      : ClownNose,
    'Comb'           : Comb,
    'DynamicBox'     : DynamicBox,
    'Floss'          : Floss,
    'LegalPad'       : LegalPad,
    'MarkerGreen'    : MarkerGreen,
    'MarkerRed'      : MarkerRed,
    'MarkerBlue'     : MarkerBlue,
    'MarkerBlack'    : MarkerBlack,
    'Razor'          : Razor,
    'StaticBox'      : StaticBox,
    'Toothbrush'     : Toothbrush,
    'XboxController' : XboxController
};

ObstacleFactory.prototype.loadAssets = function(types)
{
    _.each(types, function(type) {
        if (this.types[type]) {
            this.types[type].prototype.loadAssets(this.state, type);
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
