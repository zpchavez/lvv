'use strict';

var _          = require('underscore');
var ClownNose  = require('./clown-nose');
var Comb       = require('./comb');
var DynamicBox = require('./dynamic-box');
var Floss      = require('./floss');
var StaticBox  = require('./static-box');
var Toothbrush = require('./toothbrush');

var ObstacleFactory = function(state) {
    this.state      = state;
};

ObstacleFactory.prototype.types = {
    'ClownNose'  : ClownNose,
    'DynamicBox' : DynamicBox,
    'StaticBox'  : StaticBox,
    'Toothbrush' : Toothbrush,
    'Comb'       : Comb,
    'Floss'      : Floss
};

ObstacleFactory.prototype.loadAssets = function(types)
{
    _.each(types, function(type) {
        if (this.types[type]) {
            this.state.load.image(type, this.types[type].prototype.getSpritePath());
        } else {
            throw new Error('Attempted to load assets for unknown class ' + type);
        }        
    }, this);

    this.state.load.physics('Obstacles', 'assets/physics/obstacles.json');
};

ObstacleFactory.prototype.getNew = function(type, x, y, angle)
{
    if (this.types[type]) {
        return new this.types[type](this.state, x, y, type, angle);
    } else {
        throw new Error('Attempted to create unknown class ' + type);
    }
};

module.exports = ObstacleFactory;
