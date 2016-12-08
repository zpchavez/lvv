import randomSeed from 'random-seed';
import globalState from './global-state';

class RNG
{
    constructor() {
        this.rng = randomSeed.create(globalState.get('seed'));
        console.log('The seed is ' + globalState.get('seed'));
    }

    getIntBetween(min, max) {
        return Math.round(this.rng.random() * (max - min) + min);
    }

    happensGivenProbability(chance) {
        return this.rng.random() <= chance;
    }

    pickValueFromArray(array) {
        const max = array.length - 1;

        const selectedIndex = this.getIntBetween(0, max);

        return array[selectedIndex];
    }
}

const rng = new RNG();

export default rng;
