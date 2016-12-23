import AbstractState from './abstract-state';
import globalState from 'app/global-state';
import colors from 'app/colors';
import LoadingNextRaceState from './loading-next-race-state';
import MainMenuState from './menus/main-menu-state';
import DelayTimer from 'app/delay';

const leftpad = function(str, len, ch) {
  str = String(str);
  var i = -1;
  if (!ch && ch !== 0) ch = ' ';
  len = len - str.length;
  while (++i < len) {
    str = ch + str;
  }
  return str;
}

class OverallScoreState extends AbstractState
{
    constructor(winner) {
        super(...arguments);
        this.winner = winner;
        globalState.get('score')[winner] += 1;
    }

    create() {
        super.create();

        this.delayTimer = new DelayTimer(this.game);

        if (globalState.get('score')[this.winner] === 3) {
            this.renderWinnerMessage();
            this.delayTimer.setTimeout(this.returnToMainMenu.bind(this), 5000);
        } else {
            this.renderScore();
            this.delayTimer.setTimeout(this.loadNextRace.bind(this), 5000);
        }
    }

    loadNextRace () {
        this.game.state.add('loading', new LoadingNextRaceState(), true);
    }

    returnToMainMenu() {
        globalState.reset();

        this.game.state.add('main-menu', new MainMenuState, true);
    }

    getWinnerColor() {
        let winnerColor;
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
    }

    renderWinnerMessage() {
        const winnerColor = this.getWinnerColor();
        const winnerText = this.game.add.text(
            this.game.width / 2,
            this.game.height / 2 - 100,
            winnerColor.name.toUpperCase() + ' WINS!',
            {
                font: '42px Arial',
                fill: '#ffffff',
            }
        )
        winnerText.anchor.set(0.5);
    }

    renderScore() {
        const winnerColor = this.getWinnerColor();
        const winnerText = this.game.add.text(
            this.game.width / 2,
            this.game.height / 2 - 100,
            winnerColor.name.charAt(0).toUpperCase() + winnerColor.name.substr(1) + ' gets a point!',
            {
                font: '42px Arial',
                fill: '#ffffff',
            }
        )
        winnerText.anchor.set(0.5);

        globalState.get('score').forEach((score, index) => {
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
        });
    };
}

export default OverallScoreState;
