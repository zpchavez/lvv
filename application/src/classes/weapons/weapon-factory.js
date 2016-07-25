'use strict';

var _ = require('underscore');
var CannonBall = require('./cannon-ball');
var Mallet = require('./mallet');

var WeaponFactory = function(state) {
    this.state       = state;
    this.loadedTypes = {};
};

WeaponFactory.prototype.types = {
    'cannon-ball': CannonBall,
    'mallet': Mallet,
};

WeaponFactory.prototype.loadAssets = function(types)
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

WeaponFactory.prototype.getNew = function(type, x, y, angle)
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

module.exports = WeaponFactory;
