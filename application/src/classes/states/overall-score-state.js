var Phaser = require('phaser');
var global = require('../../global-state');

var OverallScoreState = function(winner)
{
    Phaser.State.apply(this, arguments);
    this.winner = winner;
    global.state.score[winner] += 1;
};

OverallScoreState.prototype = Object.create(Phaser.State.prototype);

OverallScoreState.prototype.create = function()
{
    if (global.state.score[this.winner] === 4) {
        this.renderWinnerMessage();
        setTimeout(this.returnToMainMenu.bind(this), 5000);
    } else {
        this.renderScore();
        setTimeout(this.loadNextRace.bind(this), 5000);
    }
};

OverallScoreState.prototype.loadNextRace = function()
{
    var LoadingNextRaceState = require('./loading-next-race-state');
    this.game.state.add('loading', new LoadingNextRaceState(), true);
};

OverallScoreState.prototype.returnToMainMenu = function()
{
    global.reset();

    var MainMenuState = require('./menus/main-menu-state');
    this.game.state.add('main-menu', new MainMenuState, true);
};

OverallScoreState.prototype.renderWinnerMessage = function()
{
    var winnerColor = global.state.playerColors[this.winner];
    var winnerText = this.game.add.text(
        this.game.width / 2,
        this.game.height / 2 - 100,
        winnerColor.toUpperCase() + ' WINS!',
        {
            font: '42px Arial',
            fill: '#ffffff',
        }
    )
    winnerText.anchor.set(0.5);
};

OverallScoreState.prototype.renderScore = function()
{
    var winnerColor = global.state.playerColors[this.winner];
    var winnerText = this.game.add.text(
        this.game.width / 2,
        this.game.height / 2 - 100,
        winnerColor.charAt(0).toUpperCase() + winnerColor.substr(1) + ' gets a point!',
        {
            font: '42px Arial',
            fill: '#ffffff',
        }
    )
    winnerText.anchor.set(0.5);

    console.log(global.state);

    global.state.score.forEach(function (score, index) {
        var color = global.state.playerColors[index];
        var trophies = '';
        for (var i = 0; i < score; i += 1) {
            trophies += '🏆';
        }
        this.game.add.text(
            this.game.width / 2 - 200,
            this.game.height / 2 + (index * 50),
            color.charAt(0).toUpperCase() + color.substr(1),
            {
                font: '32px Arial',
                fill: color,
                stroke: '#ffffff',
                strokeThickness: 2,
            }
        );
        this.game.add.text(
            this.game.width / 2 - 100,
            this.game.height / 2 + 5 + (index * 50),
            trophies,
            {
                font: '32px Arial',
            }
        );
    }.bind(this));
};

module.exports = OverallScoreState;
