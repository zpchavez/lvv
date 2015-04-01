'use strict';

var UNAWARDED_POINT_FRAME = 4;

var Score = function(state, playerCount)
{
    this.state = state;

    this.twoPlayerSprites  = [];
    this.freeForAllSprites = [[], [], [], []];

    this.reset(playerCount);
};

Score.prototype.loadAssets = function()
{
    this.state.game.load.atlas(
        'score-markers',
        'assets/img/score-markers.png',
        'assets/img/score-markers.json'
    );
};

Score.prototype.reset = function(playerCount)
{
    this.playerCount = playerCount;

    if (this.playerCount === 2) {
        this.playerScores = [4, 4];
    } else if (this.playerCount === 3) {
        this.playerScores = [0, 0, 0];
    } else {
        this.playerScores = [0, 0, 0, 0];
    }

    this.twoPlayerSprites.forEach(function (sprite) {
        sprite.destroy();
    });

    this.freeForAllSprites.forEach(function (playerSprites) {
        playerSprites.forEach(function (sprite) {
            sprite.destroy();
        });
    });
};

Score.prototype.show = function()
{
    var y, x, spriteCount;

    if (this.playerCount === 1) {
        return;
    }

    if (this.playerCount === 2) {
        y        = 60;
        spriteCount = 0;

        for (var p1Point = 0; p1Point < this.playerScores[0]; p1Point += 1) {
            this.twoPlayerSprites[spriteCount] = this.state.add.sprite(20, y, 'score-markers');
            this.twoPlayerSprites[spriteCount].frame = 0;
            this.twoPlayerSprites[spriteCount].fixedToCamera = true;

            y += 20;
            spriteCount += 1;
        }

        for (var p2Point = 0; p2Point < this.playerScores[1]; p2Point += 1) {
            this.twoPlayerSprites[spriteCount] = this.state.add.sprite(20, y, 'score-markers');
            this.twoPlayerSprites[spriteCount].frame = 1;
            this.twoPlayerSprites[spriteCount].fixedToCamera = true;

            y += 20;
            spriteCount += 1;
        }
    } else {
        for (var i = 0; i < this.playerCount; i += 1) {
            y = 60;
            x = 30 * (i + 1);

            for (var p = 7; p >= 0; p -= 1) {
                this.freeForAllSprites[i][p] = this.state.add.sprite(x, y, 'score-markers');
                this.freeForAllSprites[i][p].frame = UNAWARDED_POINT_FRAME;
                this.freeForAllSprites[i][p].fixedToCamera = true;

                y += 20;
            }
        }
    }
};

Score.prototype.awardTwoPlayerPointToPlayer = function(player)
{
    var otherPlayer, spriteIndexToChange;

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

    this.twoPlayerSprites[spriteIndexToChange].frame = player;
};


/**
 *  playerStack is an array specifying the order in which players were eliminated,
 *  with the last value in the stack being the player who won
 *  e.g. [1, 2, 3, 0] means that player one came in first, player four came in second,
 *  player three came in third, and player two came in last.
 *
 * @param  {Array} playerStack
 */
Score.prototype.awardPointsForFreeForAll = function(playerStack)
{
    if (playerStack.length === 3) {
        this.playerScores[playerStack[0]] -= 2; // Last place
        this.playerScores[playerStack[2]] += 2; // First place
    } else {
        this.playerScores[playerStack[0]] -= 2; // Last place
        this.playerScores[playerStack[1]] -= 1; // Third place
        this.playerScores[playerStack[2]] += 1; // Second place
        this.playerScores[playerStack[3]] += 2; // First place
    }

    // Don't allow negative scores
    this.playerScores = this.playerScores.map(function (score) {
        return Math.max(0, score);
    });

    // Redraw score
    for (var i = 0; i < this.playerCount; i += 1) {
        for (var p = 7; p >= 0; p -= 1) {
            this.freeForAllSprites[i][p].frame = (this.playerScores[i] > p) ? i : UNAWARDED_POINT_FRAME;
        }
    }
};

Score.prototype.getWinner = function()
{
    for (var i = 0; i <= 8; i += 1) {
        if (this.playerScores[i] >= 8) {
            return i;
        }
    }

    return false;
};

Score.prototype.getLeaders = function()
{
    var topScore, leaderIndexes = [];

    topScore = Math.max.apply(null, this.playerScores);

    this.playerScores.forEach(function (score, player) {
        if (score === topScore) {
            leaderIndexes.push(player);
        }
    });

    return leaderIndexes;
};

module.exports = Score;