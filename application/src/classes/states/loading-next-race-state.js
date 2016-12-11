import RaceState from './race-state';
import DesertGenerator from 'app/classes/track-generator/desert/desert-generator';
import global from 'app/global-state';

class LoadingNextRaceState extends Phaser.State
{
    create() {
        this.renderNextRaceInfo();

        setTimeout(this.loadTrack.bind(this));
    }

    renderNextRaceInfo() {
        const textString = 'Backyard';

        this.titleText = this.game.add.text(
            this.game.width / 2,
            (this.game.height / 2) - 100,
            textString,
            {
                font: '42px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5,
            }
        );
        this.titleText.anchor.setTo(0.5, 0.5);

        this.loadingText = this.game.add.text(
            this.game.width / 2,
            this.game.height / 2,
            'Loading...',
            {
                font: '42px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5,
            }
        )
        this.loadingText.anchor.set(0.5, 0.5);
    }

    loadTrack(type) {
        const desertGenerator = new DesertGenerator();
        var trackData = desertGenerator.generate();
        this.game.state.add(
            'race',
            new RaceState(trackData, {
                players: global.state.players,
                teams: global.state.teams
            }),
            true
        );
    };
}

export default LoadingNextRaceState;
