import AbstractState from 'app/classes/states/abstract-state';
import Controls from 'app/classes/controls';
import LoadingNextRaceState from 'app/classes/states/loading-next-race-state';
import CarFactory from 'app/classes/car-factory';
import globalState from 'app/global-state';
import colors from 'app/colors';
import _ from 'underscore';

class SelectColorState extends AbstractState
{
    constructor() {
        super(...arguments);

        this.carFactory = new CarFactory(this);
    }

    preload() {
        super.preload();

        this.carFactory.loadAssets();
    }

    create() {
        super.create();

        this.renderText();
        this.renderCars();
        this.initInputs();
    }

    renderText() {
        this.titleText = this.game.add.text(
            this.game.width / 2,
            (this.game.height / 2) - 150,
            "Choose Color",
            {
                font: '42px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5,
            }
        );
        this.titleText.anchor.setTo(0.5, 0.5);
    }

    renderCars() {
        this.game.physics.startSystem(Phaser.Physics.P2JS);

        if (globalState.get('teams')) {
            this.renderTeamSelection();
            return;
        } else {
            this.renderFreeForAllSelection();
            return;
        }
    }

    renderFreeForAllSelection() {
        let positions;
        if (globalState.get('players') === 1) {
            positions = [
                [this.game.width / 2, this.game.height / 2]
            ];
        } else if (globalState.get('players') === 2) {
            positions = [
                [(this.game.width / 2) - 50, this.game.height / 2],
                [(this.game.width / 2) + 50, this.game.height / 2],
            ];
        } else if (globalState.get('players') === 3) {
            positions = [
                [this.game.width / 2, this.game.height / 2],
                [(this.game.width / 2) - 100, this.game.height / 2],
                [(this.game.width / 2) + 100, this.game.height / 2],
            ];
        } else if (globalState.get('players') === 4) {
            positions = [
                [(this.game.width / 2) - 150, this.game.height / 2],
                [(this.game.width / 2) - 50, this.game.height / 2],
                [(this.game.width / 2) + 50, this.game.height / 2],
                [(this.game.width / 2) + 150, this.game.height / 2],
            ];
        } else {
            throw new Error('Invalid number of players: ' + globalState.get('players'));
        }

        const playerSprites = [];
        for (let player = 0; player < positions.length; player += 1) {
            playerSprites.push(
                this.carFactory.getNew(
                    positions[player][0],
                    positions[player][1],
                    player
                )
            );
            playerSprites[player].tint = colors[player].hex;
            this.game.world.addChild(playerSprites[player]);
        }
        this.playerSprites = playerSprites;
        this.colorCursors = [0, 1, 2, 3];
        this.selectedColors = [null, null, null, null];
    }

    renderTeamSelection()
    {
        this.blueTeamMessage = this.game.add.text(
            this.game.width / 2 - 100,
            (this.game.height / 2) - 70,
            "BLUE TEAM",
            {
                font: '24px Arial',
                fill: '#0000FF',
                stroke: '#000000',
                strokeThickness: 5,
            }
        );
        this.blueTeamMessage.anchor.setTo(0.5, 0.5);

        this.blueTeamMessage = this.game.add.text(
            this.game.width / 2 + 100,
            (this.game.height / 2) - 70,
            "RED TEAM",
            {
                font: '24px Arial',
                fill: '#FF0000',
                stroke: '#000000',
                strokeThickness: 5,
            }
        );
        this.blueTeamMessage.anchor.setTo(0.5, 0.5);

        const positions = [
            [this.game.width / 2, (this.game.height / 2) - 20],
            [this.game.width / 2, (this.game.height / 2) + 50],
            [this.game.width / 2, (this.game.height / 2) + 120],
            [this.game.width / 2, (this.game.height / 2) + 190],
        ];
        const playerSprites = [];
        for (let player = 0; player < positions.length; player += 1) {
            playerSprites.push(
                this.carFactory.getNew(
                    positions[player][0],
                    positions[player][1],
                    player
                )
            );
            playerSprites[player].tint = 0xffffff;
            this.game.world.addChild(playerSprites[player]);
        }
        this.playerSprites = playerSprites;
        this.selectedColors = [null, null, null, null];
        this.teamPlayers = {blue: [], red: []};
    }

    changeColor(player, direction) {
        // Player who isn't playing can't change color
        if (! this.playerSprites[player]) {
            return;
        }

        // Can't change color if player already selected a color (except on teams)
        if (!globalState.get('teams') && this.selectedColors[player] !== null) {
            return;
        }

        if (globalState.get('teams')) {
            this.changeTeamColor(player, direction);
        } else {
            this.changeFreeForFallColor(player, direction);
        }
    }

    changeFreeForFallColor(player, direction) {
        let colorIndex;
        if (direction === 'LEFT') {
            colorIndex = (
                this.colorCursors[player] === 0
                ? colors.length - 1
                : this.colorCursors[player] - 1
            );
        } else {
            colorIndex = (
                this.colorCursors[player] === colors.length - 1
                ? 0
                : this.colorCursors[player] + 1
            );
        }

        // If color selected by another player, select the next available color
        if (this.selectedColors.indexOf(colorIndex) !== -1) {
            colorIndex = this.getNextAvailableColorIndex(colorIndex, direction);
        }

        this.playerSprites[player].tint = colors[colorIndex].hex;
        this.colorCursors[player] = colorIndex;
    }

    changeTeamColor(player, direction) {
        const BLUE = 0;
        const CYAN = 6;
        const RED = 1;
        const PINK = 8;

        let selectTeamColor = (teamShades, teamColorKey, directionMultiplier) => {
            if (this.selectedColors[player] === null) {
                // If both team colors already selected, do nothing
                if (
                    this.selectedColors.indexOf(teamShades[0]) !== -1 &&
                    this.selectedColors.indexOf(teamShades[1]) !== -1
                ) {
                    return;
                }

                if (this.selectedColors.indexOf(teamShades[0]) !== -1) {
                    this.selectedColors[player] = teamShades[1];
                } else {
                    this.selectedColors[player] = teamShades[0];
                }
                this.playerSprites[player].tint = colors[this.selectedColors[player]].hex;
                this.playerSprites[player].body.x = (
                    (this.game.width / 2) +
                    (directionMultiplier * 100)
                );
                this.teamPlayers[teamColorKey].push(player);
            } else if (teamShades.indexOf(this.selectedColors[player]) === -1) {
                this.playerSprites[player].tint = 0xffffff;
                this.unselectColor(player);
                this.playerSprites[player].body.x = (this.game.width / 2);
                this.teamPlayers[teamColorKey] = _.without(this.teamPlayers[teamColorKey], player);
            }
        };

        if (direction === 'LEFT') {
            selectTeamColor([BLUE, CYAN], 'blue', -1);
        } else {
            selectTeamColor([RED, PINK], 'red', 1);
        }

        if (this.allSelected()) {
            this.showAllSelectedMessage();
        }
    }

    getNextAvailableColorIndex(index, direction) {
        const filteredSelectedColors = this.selectedColors.filter((colorIndex) => {
            return colorIndex !== null;
        });

        const multiplier = (direction === 'LEFT' ? -1 : 1);

        let nextAvailable;
        let candidate = index;

        do {
            candidate = candidate + (1 * multiplier);
            if (candidate === colors.length) {
                candidate = 0;
            }
            if (candidate < 0) {
                candidate = colors.length - 1;
            }

            if (this.selectedColors.indexOf(candidate) === -1) {
                nextAvailable = candidate;
            }
        } while (typeof nextAvailable === 'undefined');

        return nextAvailable;
    }

    selectColor(player) {
        if (this.allSelected()) {
            this.startGame();
            return;
        }

        // Select if not already selected
        if (this.selectedColors.indexOf(this.colorCursors[player]) === -1) {
            this.selectedColors[player] = this.colorCursors[player];
        }

        const selections = this.selectedColors.filter((index) => {return index !== null});
        if (this.allSelected()) {
            this.showAllSelectedMessage();
        }
    }

    allSelected() {
        const selections = this.selectedColors.filter((index) => {return index !== null});
        return selections.length === globalState.get('players');
    }

    unselectColor(player) {
        if (this.allSelectedMessage) {
            this.allSelectedMessage.destroy();
            this.allSelectedMessage = null;
        }

        this.selectedColors[player] = null;
        this.playerSprites[player].body.setZeroRotation();
        this.playerSprites[player].body.angle = 0;
    }

    update() {
        // Cars that have selected their color spin around
        this.selectedColors.forEach((color, player) => {
            if (color !== null) {
                this.playerSprites[player].body.rotateRight(150);
            }
        });
    }

    showAllSelectedMessage() {
        this.allSelectedMessage = this.game.add.text(
            this.game.width / 2,
            (this.game.height / 2) + 250,
            "Press button to start!",
            {
                font: '24px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5,
            }
        );
        this.allSelectedMessage.anchor.setTo(0.5, 0.5);
    }

    startGame() {
        this.controls.reset();
        globalState.set('colors', this.selectedColors);
        globalState.set('teamPlayers', this.teamPlayers || null);
        this.game.state.add('loading', new LoadingNextRaceState(), true);
    }

    initInputs() {
        this.controls = new Controls(this.game);
        for (let player = 0; player < 4; player += 1) {
            this.controls.onDown(player, 'LEFT', this.changeColor.bind(this, player, 'LEFT'));
            this.controls.onDown(player, 'RIGHT', this.changeColor.bind(this, player, 'RIGHT'));
            this.controls.onDown(player, 'SELECT', this.selectColor.bind(this, player));
            this.controls.onDown(player, 'CANCEL', this.unselectColor.bind(this, player));
        }
    }
}

export default SelectColorState;
