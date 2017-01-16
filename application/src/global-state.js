import settingsFromQuery from './settings-from-query';
import { BLUE, RED, CYAN, PINK, GREEN, YELLOW } from './colors';

const initialState = Object.assign(
    {
        colors: (
          settingsFromQuery.teams
            ? [BLUE, CYAN, RED, PINK]
            : [BLUE, RED, GREEN, YELLOW]
        ),
        teamPlayers: {blue: [0, 1], red: [2, 3]},
    },
    settingsFromQuery
);

export default {
    state: Object.assign({}, initialState),

    reset() {
        this.state = Object.assign({}, initialState);
    },

    set(key, value) {
        this.state[key] = value;
    },

    setFromObj(stateValues) {
        this.state = Object.assign(this.state, stateValues);
    },

    get(key) {
        return this.state[key];
    },

    setInitialScore(players, teams) {
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
