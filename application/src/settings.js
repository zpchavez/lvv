/* global window */
'use strict';

var _           = require('underscore');
var queryString = require('query-string');
var trackList   = require('./track-list');

var defaultTheme = _(trackList).keys()[0];

module.exports = _(queryString.parse(window.location.search)).defaults({
    seed  : Date.now(),
    theme : defaultTheme,
    track : _(trackList[defaultTheme]).keys()[0]
});
