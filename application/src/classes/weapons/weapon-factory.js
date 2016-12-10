import CannonBall from './cannon-ball';

const allTypes = {
    'cannon-ball': CannonBall,
};

class WeaponFactory
{
    constructor(state) {
        this.state = state;
        this.loadedTypes = {};
    }

    loadAssets(types) {
        types = types || Object.keys(allTypes);

        types.forEach((type) => {
            if (this.types[type]) {
                this.types[type].prototype.loadAssets(this.state, type);
                this.loadedTypes[type] = true;
            } else {
                throw new Error('Attempted to load assets for unknown class: ' + type);
            }
        }, this);
    }

    getNew(type, x, y, angle) {
        if (this.types[type]) {
            if (this.loadedTypes[type]) {
                return new this.types[type](this.state, x, y, type, angle);
            } else {
                throw new Error('Attempted to create unloaded type. Add a call to load assets for ' + type + '.');
            }
        } else {
            throw new Error('Attempted to create unknown class: ' + type);
        }
    }
}

export default WeaponFactory;
