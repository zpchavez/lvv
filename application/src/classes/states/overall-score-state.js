var Phaser = require('phaser');
var globalState = require('../../global-state');
var colors = require('../../colors');

var leftpad = function(str, len, ch) {
  str = String(str);
  var i = -1;
  if (!ch && ch !== 0) ch = ' ';
  len = len - str.length;
  while (++i < len) {
    str = ch + str;
  }
  return str;
}

var OverallScoreState = function(winner)
{
    Phaser.State.apply(this, arguments);
    this.winner = winner;
    globalState.get('score')[winner] += 1;
};

OverallScoreState.prototype = Object.create(Phaser.State.prototype);

OverallScoreState.prototype.create = function()
{
    if (globalState.get('score')[this.winner] === 3) {
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

OverallScoreState.prototype.getWinnerColor = function()
{
    var winnerColor;
    if (globalState.get('teams')) {
        winnerColor = (
            this.winner === 0
                ? colors[0]
                : colors[1]
        );
    } else {
        winnerColor = colors[globalState.get('colors')[this.winner]];
    }
    return winnerColor;
};

OverallScoreState.prototype.renderWinnerMessage = function()
{
    var winnerColor = this.getWinnerColor();
    var winnerText = this.game.add.text(
        this.game.width / 2,
        this.game.height / 2 - 100,
        winnerColor.name.toUpperCase() + ' WINS!',
        {
            font: '42px Arial',
            fill: '#ffffff',
        }
    )
    winnerText.anchor.set(0.5);
};

OverallScoreState.prototype.renderScore = function()
{
    var winnerColor = this.getWinnerColor();
    var winnerText = this.game.add.text(
        this.game.width / 2,
        this.game.height / 2 - 100,
        winnerColor.name.charAt(0).toUpperCase() + winnerColor.name.substr(1) + ' gets a point!',
        {
            font: '42px Arial',
            fill: '#ffffff',
        }
    )
    winnerText.anchor.set(0.5);

    globalState.get('score').forEach(function (score, index) {
        var color;
        if (globalState.get('teams')) {
            color = colors[index];
        } else {
            color = colors[globalState.get('colors')[index]];
        }
        var trophies = '';
        for (var i = 0; i < score; i += 1) {
            trophies += '🏆';
        }
        this.game.add.text(
            this.game.width / 2 - 200,
            this.game.height / 2 + (index * 50),
            color.name.charAt(0).toUpperCase() + color.name.substr(1),
            {
                font: '32px Arial',
                fill: '#' + leftpad(color.hex.toString(16), 6, 0),
                stroke: '#ffffff',
                strokeThickness: 2,
            }
        );
        this.game.add.text(
            this.game.width / 2 - 80,
            this.game.height / 2 + 5 + (index * 50),
            trophies,
            {
                font: '32px Arial',
            }
        );
    }.bind(this));
};

module.exports = OverallScoreState;
