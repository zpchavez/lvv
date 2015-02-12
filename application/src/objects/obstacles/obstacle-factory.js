'use strict';

var _          = require('underscore');
var ClownNose  = require('./clown-nose');
var DynamicBox = require('./dynamic-box');
var StaticBox  = require('./static-box');

var ObstacleFactory = function(state) {
    this.state      = state;
};

ObstacleFactory.prototype.types = {
    'ClownNose'  : ClownNose,
    'DynamicBox' : DynamicBox,
    'StaticBox'  : StaticBox
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
};

ObstacleFactory.prototype.getNew = function(type, x, y, collisionGroup)
{
    if (this.types[type]) {
        return new this.types[type](this.state, x, y, type, collisionGroup);
    } else {
        throw new Error('Attempted to create unknown class ' + type);
    }
};

module.exports = ObstacleFactory;
