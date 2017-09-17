import AbstractState from './abstract-state';
import RaceState from './race-state';
import DesertGenerator from 'app/classes/track-generator/desert/desert-generator';
import global from 'app/global-state';
import DelayTimer from 'app/delay';

const textStyle = {
    font: '42px Arial',
    fill: '#ffffff',
    stroke: '#000000',
    strokeThickness: 5,
};

class LoadingNextRaceState extends AbstractState
{
    create() {
        super.create();

        this.renderNextRaceInfo();

        this.delayTimer = new DelayTimer(this.game);

        this.delayTimer.setTimeout(this.loadTrack.bind(this));
    }

    renderNextRaceInfo() {
        const textString = 'Backyard';

        this.titleText = this.game.add.text(
            this.game.width / 2,
            50,
            textString,
            textStyle
        );
        this.titleText.anchor.setTo(0.5, 0.5);

        this.loadingText = this.game.add.text(
            this.game.width / 2,
            this.game.height / 2,
            'Generating...',
            textStyle
        )
        this.loadingText.anchor.set(0.5, 0.5);
    }

    loadTrack(type) {
        const desertGenerator = new DesertGenerator();
        const trackData = desertGenerator.generate();

        this.loadingText.destroy();

        const minimap = desertGenerator.generateMinimap(this.game);
        const image = minimap.addToWorld(
            this.game.width / 2,
            this.game.height / 2,
            0,
            0,
            0.6,
            0.6
        );
        image.anchor.set(0.5);

        const memorizeItText = this.game.add.text(
            this.game.width / 2,
            600,
            'Memorize it!',
            textStyle
        );
        memorizeItText.anchor.set(0.5);

        this.delayTimer.setTimeout(() => {
            this.game.state.add(
                'race',
                new RaceState(trackData, {
                    players: global.state.players,
                    teams: global.state.teams
                }),
                true
            );
        }, 3000);
    };
}

export default LoadingNextRaceState;
