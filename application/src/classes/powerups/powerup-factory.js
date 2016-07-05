'use strict';

var _ = require('underscore');
var Cannon = require('./cannon');
var Hover = require('./hover');

var PowerupFactory = function(state) {
    this.state       = state;
    this.loadedTypes = {};
};

PowerupFactory.prototype.types = {
    'cannon': Cannon,
    'hover': Hover,
};

PowerupFactory.prototype.loadAssets = function(types)
{
    types = types || Object.keys(this.types);

    _.each(types, function(type) {
        if (this.types[type]) {
            this.types[type].prototype.loadAssets(this.state, type);
            this.loadedTypes[type] = true;
        } else {
            throw new Error('Attempted to load assets for unknown class: ' + type);
        }
    }, this);
};

PowerupFactory.prototype.getNew = function(type, x, y)
{
    if (this.types[type]) {
        if (this.loadedTypes[type]) {
            return new this.types[type](this.state, x, y, type);
        } else {
            throw new Error('Attempted to create unloaded type. Add a call to load assets for ' + type + '.');
        }
    } else {
        throw new Error('Attempted to create unknown class: ' + type);
    }
};

module.exports = PowerupFactory;
