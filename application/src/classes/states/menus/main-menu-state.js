import AbstractState from 'app/classes/states/abstract-state';
import Controls from 'app/classes/controls';
import SelectColorState from './select-color-state';
import globalState from 'app/global-state';

const PLAYERS_1 = 0;
const PLAYERS_2 = 1;
const PLAYERS_3 = 2;
const PLAYERS_4 = 3;
const TEAMS     = 4;

class MainMenuState extends AbstractState
{
    constructor() {
        super(...arguments);

        this.numPlayersSelection = PLAYERS_1;
        this.playerChoices = [
            { players: 1 },
            { players: 2 },
            { players: 3 },
            { players: 4 },
            { players: 4, teams: true }
        ];
    }

    create() {
        super.create();

        this.renderTitle();

        this.renderNumPlayersMenu();
        this.renderNumPlayersCursor();

        if (globalState.get('profiler')) {
            this.game.add.plugin(Phaser.Plugin.Debug);
        }

        this.initInputs();
    }

    renderTitle() {
        this.titleText = this.game.add.text(
            this.game.width / 2,
            (this.game.height / 2) - 100,
            "L'il Vroom Vrooms!",
            {
                font: '42px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5,
            }
        );
        this.titleText.anchor.setTo(0.5, 0.5);
    }

    renderNumPlayersMenu() {
        const options = { fill: '#ffffff' };

        const optionStrings = ['1 Player', '2 Players', '3 Players', '4 Players', '4 Player Teams'];
        this.numberOfPlayersTextObjects = [];
        optionStrings.forEach((text, index) => {
            this.numberOfPlayersTextObjects.push(
                this.game.add.text(
                    this.game.width / 2 - 50,
                    this.game.height / 2 + (index * 30),
                    text,
                    options
                )
            );
        });
    }

    renderNumPlayersCursor()
    {
        const selectedText = this.numberOfPlayersTextObjects[this.numPlayersSelection];

        if (this.cursor) {
            this.cursor.destroy();
        }

        this.cursor = this.game.add.text(
            selectedText.x - 40,
            selectedText.y,
            '🏁',
            { fill: '#ffffff' }
        );
    }

    moveCursorUp() {
        if (this.numPlayersSelection === 0) {
            this.numPlayersSelection = TEAMS;
        } else {
            this.numPlayersSelection -= 1;
        }
        this.renderNumPlayersCursor();
    }

    moveCursorDown() {
        if (this.numPlayersSelection === this.playerChoices.length - 1) {
            this.numPlayersSelection = PLAYERS_1;
        } else {
            this.numPlayersSelection += 1;
        }
        this.renderNumPlayersCursor();
    }

    selectOption() {
        globalState.set('players', this.playerChoices[this.numPlayersSelection].players);
        globalState.set('teams', !! this.playerChoices[this.numPlayersSelection].teams);
        this.game.state.add('select-color', new SelectColorState(), true);
    }

    initInputs() {
        this.controls = new Controls(this.game);
        this.controls.onDown(0, 'UP', this.moveCursorUp.bind(this));
        this.controls.onDown(0, 'DOWN', this.moveCursorDown.bind(this));
        this.controls.onDown(0, 'SELECT', this.selectOption.bind(this));
    }
}

export default MainMenuState;
