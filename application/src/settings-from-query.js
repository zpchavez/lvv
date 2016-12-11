/* global window */
import _ from 'underscore';
import queryString from 'query-string';
import trackList from './track-list';

const defaultTheme = _(trackList).keys()[0];

let settings = queryString.parse(window.location.search);

settings = _(settings).defaults({
    seed     : Date.now(),
    theme    : defaultTheme,
    track    : _(trackList[settings.theme || defaultTheme]).keys()[0],
    players  : 1,
    teams    : false,
    laps     : 3,
    debug    : false,
    profiler : false,
    selector : false,
    startWithCannons : false,
});

// Convert types for non-strings
settings.players  = parseInt(settings.players, 10);
settings.laps     = settings.laps === 'Infinity' ? Infinity : parseInt(settings.laps, 10);
settings.teams    = settings.teams === 'false' ? false : !! settings.teams;
settings.debug    = settings.debug === 'false' ? false : !! settings.debug;
settings.profiler = settings.profiler === 'false' ? false : !! settings.profiler;
settings.startWithCannons = !! settings.startWithCannons;

export default settings;
