module.exports = {
    state: {},

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
            score[this.state.teamColors[0]] = 0;
            score[this.state.teamColors[1]] = 0;
        } else {
            for (var i = 0; i < players; i += 1) {
                score[this.state.playerColors[i]] = 0;
            }
        }
        this.state.score = score;

        return this;
    }
}
