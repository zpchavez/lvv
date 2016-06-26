module.exports = {
    state: {},

    reset: function() {
        this.state = {};
    },

    setInitialScore: function(players, teams) {
        this.state = {
            players: players,
            teams: teams,
        };

        if (! this.state.playerColors) {
            this.state.playerColors = [
                'blue',
                'red',
                'yellow',
                'green'
            ];
            this.state.teamColors = [
                'blue',
                'red'
            ];
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
