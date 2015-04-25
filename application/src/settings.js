/* global window */
'use strict';

var _           = require('underscore');
var queryString = require('query-string');
var trackList   = require('./track-list');

var defaultTheme = _(trackList).keys()[0];

var settings = _(queryString.parse(window.location.search)).defaults({
    seed     : Date.now(),
    theme    : defaultTheme,
    track    : _(trackList[defaultTheme]).keys()[0],
    players  : 1,
    teams    : false,
    laps     : 3,
    debug    : false,
    profiler : false
});

// Convert types for non-strings
settings.players  = parseInt(settings.players, 10);
settings.laps     = settings.laps === 'Infinity' ? Infinity : parseInt(settings.laps, 10);
settings.teams    = settings.teams === 'false' ? false : !! settings.teams;
settings.debug    = settings.debug === 'false' ? false : !! settings.debug;
settings.profiler = settings.profiler === 'false' ? false : !! settings.profiler;

module.exports = settings;