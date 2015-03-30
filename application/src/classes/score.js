'use strict';

var Score = function(state, playerCount)
{
    this.state = state;

    this.twoPlayerSprites = [];

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
};

Score.prototype.show = function()
{
    if (this.playerCount === 1) {
        return;
    }

    if (this.playerCount === 2) {
        var yPos = 60, spriteCount = 0;

        for (var p1Point = 0; p1Point < this.playerScores[0]; p1Point += 1) {
            this.twoPlayerSprites[spriteCount] = this.state.add.sprite(20, yPos, 'score-markers');
            this.twoPlayerSprites[spriteCount].frame = 0;
            this.twoPlayerSprites[spriteCount].fixedToCamera = true;

            yPos += 20;
            spriteCount += 1;
        }

        for (var p2Point = 0; p2Point < this.playerScores[1]; p2Point += 1) {
            this.twoPlayerSprites[spriteCount] = this.state.add.sprite(20, yPos, 'score-markers');
            this.twoPlayerSprites[spriteCount].frame = 1;
            this.twoPlayerSprites[spriteCount].fixedToCamera = true;

            yPos += 20;
            spriteCount += 1;
        }
    }
};

module.exports = Score;