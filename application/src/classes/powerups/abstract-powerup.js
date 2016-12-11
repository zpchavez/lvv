import Car from '../car';

class AbstractPowerup extends Phaser.Sprite
{
    constructor(state, x, y, key) {
        super(state.game, x, y, key);

        this.createPhysicsBody(state);
    }

    loadAssets(state, key) {
        state.load.image(key, this.getSpritePath(key));
    }

    getSpritePath(key) {
        return 'assets/img/powerups/' + key + '.png';
    }

    createPhysicsBody(state) {
        state.game.physics.p2.enable(this);

        this.body.dynamic = false;

        this.body.data.shapes.forEach((shape) => {
            shape.sensor = true;
        });

        this.body.onBeginContact.add((contactingBody) => {
            if (Car.prototype.isPrototypeOf(contactingBody.sprite)) {
                this.applyPowerup(contactingBody.sprite);
                this.destroy();
            }
        });
    }

    add(state) {
        state.add.existing(this);
    }

    addToCollisionGroup(collisionGroup) {
        this.body.setCollisionGroup(collisionGroup);
        this.body.collides(collisionGroup);
    }

    applyPowerup(car) {
        throw new Error('You must overwrite applyPowerUp');
    }
}

export default AbstractPowerup;
