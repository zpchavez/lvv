import CarSprite from './car';
import colors from 'app/colors';
import global from 'app/global-state';
import WeaponFactory from './weapons/weapon-factory';
import _ from 'underscore';

class CarFactory
{
    constructor(state, options) {
        options = options || {};
        _(options).defaults({teams : false});

        this.state = state;
        this.weaponFactory = new WeaponFactory(this.state);
        this.teams = options.teams;
    }

    getVehicleName() {
        return 'car';
    }

    getSpriteClass() {
        return CarSprite;
    }

    loadAssets() {
        this.state.load.image('player0', this.getSpritePath());
        this.state.load.image('player1', this.getSpritePath());
        this.state.load.image('player2', this.getSpritePath());
        this.state.load.image('player3', this.getSpritePath());
        this.state.load.image('car-glass', 'assets/img/vehicles/car-glass.png');

        this.weaponFactory.loadAssets();
    }

    getSpritePath(player) {
        return 'assets/img/vehicles/car-body.png';
    }

    getNew(x, y, playerNumber) {
        const SpriteClass = this.getSpriteClass();
        var car = new SpriteClass(
            this.state,
            x,
            y,
            'player' + playerNumber,
            this.weaponFactory
        );

        if (global.state.colors) {
            car.tint = colors[global.state.colors[playerNumber]].hex;
        }
        return car;
    }
}

export default CarFactory;
