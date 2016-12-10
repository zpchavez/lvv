import Car from 'app/classes/car';

class AbstractWeapon extends Phaser.Sprite
{
    constructor(state, x, y, key) {
        super(state.game, x, y, key);
        this.state = state;
        this.createPhysicsBody(state);
    }

    loadAssets(state, key) {
        state.load.image(key, this.getSpritePath(key));
    }

    getSpritePath(key) {
        return 'assets/img/weapons/' + key + '.png';
    }

    createPhysicsBody(state) {
        state.game.physics.p2.enable(this);

        this.body.kinematic = true;

        _this.body.data.shapes.forEach((shape) => {
            shape.sensor = true;
        });

        this.body.onBeginContact.add((contactingBody) => {
            if (Car.prototype.isPrototypeOf(contactingBody.sprite) &&
                contactingBody.sprite.playerNumber !== this.shotBy
            ) {
                this.hit(contactingBody.sprite);
                this.destroy();
            }
        }, this);
    }

    add(state) {
        state.add.existing(this);
    }

    addToCollisionGroup(collisionGroup) {
        this.body.setCollisionGroup(collisionGroup);
        this.body.collides(collisionGroup);
    }

    hit(car) {
        throw new Error('You must overwrite hit');
    }

    update()
    {
        if (! this.inCamera) {
            this.destroy();
        }
    }
}

export default AbstractWeapon;
