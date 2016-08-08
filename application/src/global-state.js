var settingsFromQuery = require('./settings-from-query');

var initialState = Object.assign(
    {
        colors: [0, 1, 2, 3],
        teamPlayers: {blue: [0, 1], red: [2, 3]},
    },
    settingsFromQuery
);

module.exports = {
    state: Object.assign({}, initialState),

    reset: function() {
        this.state = Object.assign({}, initialState);
    },

    set: function(key, value) {
        this.state[key] = value;
    },

    setFromObj: function(stateValues) {
        this.state = Object.assign(this.state, stateValues);
    },

    get: function(key) {
        return this.state[key];
    },

    setInitialScore: function(players, teams) {
        if (players) {
            this.set('players', players);
        }
        if (typeof teams !== 'undefined') {
            this.set('teams', teams);
        }

        if (! this.get('players')) {
            throw new Error('Must set "players" before initializing score');
        }

        var score = {};
        if (this.state.teams) {
            score = [0, 0];
        } else {
            score = new Array(this.state.players).fill(0);
        }
        this.state.score = score;

        return this;
    }
}
