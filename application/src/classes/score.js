import colors from '../colors';
import globalState from '../global-state';

const BLUE = 0;
const RED = 1;

class Score
{
    constructor(state, playerCount) {
        this.state = state;

        this.twoPlayerSprites  = [];
        this.freeForAllSprites = [[], [], [], []];

        this.reset(playerCount);
    }

    loadAssets() {
        this.state.game.load.image(
            'score-marker',
            'assets/img/point-unawarded.png'
        );
    }

    reset(playerCount) {
        this.playerCount = playerCount;

        if (this.playerCount === 2) {
            this.playerScores = [4, 4];
        } else if (this.playerCount === 3) {
            this.playerScores = [0, 0, 0];
        } else {
            this.playerScores = [0, 0, 0, 0];
        }

        this.twoPlayerSprites.forEach(sprite => {
            sprite.destroy();
        });

        this.freeForAllSprites.forEach(playerSprites => {
            playerSprites.forEach(sprite => {
                sprite.destroy();
            });
        });
    }

    show() {
        let y, x, spriteCount;

        if (this.playerCount === 1) {
            return;
        }

        if (this.playerCount === 2) {
            y = 60;
            spriteCount = 0;

            for (let p1Point = 0; p1Point < this.playerScores[0]; p1Point += 1) {
                this.twoPlayerSprites[spriteCount] = this.state.add.sprite(20, y, 'score-marker');
                this.twoPlayerSprites[spriteCount].tint = (
                    globalState.get('teams')
                        ? colors[BLUE].hex
                        : colors[globalState.get('colors')[0]].hex
                );
                this.twoPlayerSprites[spriteCount].fixedToCamera = true;

                y += 20;
                spriteCount += 1;
            }

            for (let p2Point = 0; p2Point < this.playerScores[1]; p2Point += 1) {
                this.twoPlayerSprites[spriteCount] = this.state.add.sprite(20, y, 'score-marker');
                this.twoPlayerSprites[spriteCount].tint = (
                    globalState.get('teams')
                        ? colors[RED].hex
                        : colors[globalState.get('colors')[1]].hex
                );
                this.twoPlayerSprites[spriteCount].fixedToCamera = true;

                y += 20;
                spriteCount += 1;
            }
        } else {
            for (let i = 0; i < this.playerCount; i += 1) {
                y = 60;
                x = 30 * (i + 1);

                for (let p = 7; p >= 0; p -= 1) {
                    this.freeForAllSprites[i][p] = this.state.add.sprite(x, y, 'score-marker');
                    this.freeForAllSprites[i][p].tint = 0xffffff;
                    this.freeForAllSprites[i][p].fixedToCamera = true;

                    y += 20;
                }
            }
        }
    }

    awardTwoPlayerPointToPlayer(player) {
        let otherPlayer, spriteIndexToChange;

        if (player !== 0 && player !== 1) {
            throw new Error('Invalid player number');
        }

        otherPlayer = (player === 0) ? 1 : 0;

        if (this.playerScores[player] === 8) {
            throw new Error('Score cannot exceed 8');
        }

        this.playerScores[player]      += 1;
        this.playerScores[otherPlayer] -= 1;

        if (player === 0) {
            spriteIndexToChange = this.playerScores[0] - 1;
        } else {
            spriteIndexToChange = this.playerScores[0];
        }

        this.flashBetweenColors(
            this.twoPlayerSprites[spriteIndexToChange],
            colors[globalState.get('colors')[player]].hex
        );
    }

    awardPointToTeam(player) {
        let otherTeam, spriteIndexToChange;

        const team = (
            globalState.get('teamPlayers').blue.indexOf(player) !== -1
                ? 0 // is blue team
                : 1 // is red team
        );

        otherTeam = (team === 0) ? 1 : 0;

        if (this.playerScores[team] === 8) {
            throw new Error('Score cannot exceed 8');
        }

        this.playerScores[team] += 1;
        this.playerScores[otherTeam] -= 1;

        if (team === 0) {
            spriteIndexToChange = this.playerScores[0] - 1;
        } else {
            spriteIndexToChange = this.playerScores[0];
        }

        this.flashBetweenColors(
            this.twoPlayerSprites[spriteIndexToChange],
            colors[team].hex
        );
    }

    flashBetweenColors(sprite, tint) {
        const originalTint = sprite.tint;

        sprite.tint = tint;
        this.changeColorIn(sprite, originalTint, 500)
            .then(this.changeColorIn.bind(this, sprite, tint, 500))
            .then(this.changeColorIn.bind(this, sprite, originalTint, 500))
            .then(this.changeColorIn.bind(this, sprite, tint, 500));
    }

    changeColorIn(sprite, tint, delay) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                sprite.tint = tint;
                resolve();
            }, delay);
        });
    };

    /**
     *  playerStack is an array specifying the order in which players were eliminated,
     *  with the last value in the stack being the player who won
     *  e.g. [1, 2, 3, 0] means that player one came in first, player four came in second,
     *  player three came in third, and player two came in last.
     *
     * @param  {Array} playerStack
     */
    awardPointsForFreeForAll(playerStack) {
        if (playerStack.length === 3) {
            this.playerScores[playerStack[0]] -= 1; // Last place
            this.playerScores[playerStack[2]] += 1; // First place
        } else {
            this.playerScores[playerStack[0]] -= 2; // Last place
            this.playerScores[playerStack[1]] -= 1; // Third place
            this.playerScores[playerStack[2]] += 1; // Second place
            this.playerScores[playerStack[3]] += 2; // First place
        }

        // Don't allow negative scores
        this.playerScores = this.playerScores.map(score => {
            return Math.max(0, score);
        });

        // Redraw score
        for (let i = 0; i < this.playerCount; i += 1) {
            for (let p = 7; p >= 0; p -= 1) {
                this.flashBetweenColors(
                    this.freeForAllSprites[i][p],
                    (
                        (this.playerScores[i] > p)
                            ? colors[globalState.get('colors')[i]].hex
                            : 0xffffff
                    )
                )
            }
        }
    }

    getWinner() {
        for (let i = 0; i <= 8; i += 1) {
            if (this.playerScores[i] >= 8) {
                return i;
            }
        }

        return 0;
    }

    getLeaders() {
        const topScore = Math.max.apply(null, this.playerScores);
        const leaderIndexes = [];

        this.playerScores.forEach((score, player) => {
            if (score === topScore) {
                leaderIndexes.push(player);
            }
        });

        return leaderIndexes;
    }
}

export default Score;
