import Car from '../car';

const fixturesKey = 'BathroomSinkFixtures';

class BathroomSink extends Phaser.Sprite
{
    constructor(state, x, y, key, angle) {
        super(state.game, x, y, key);

        this.fixturesSprite = new Phaser.Sprite(state.game, x, y, fixturesKey);

        this.createPhysicsBody(state, angle);

        this.body.dynamic = false;
        this.fixturesSprite.body.dynamic = false;
    }

    loadAssets(state, key) {
        state.load.image(key, 'assets/img/obstacles/sink-bowl.png');
        state.load.image(fixturesKey, 'assets/img/obstacles/sink-fixtures.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'sinkBowl');

        this.body.data.shapes.forEach((shape) => {
            shape.sensor = true;
        });

        this.body.onBeginContact.add((contactingBody, sinkContactingShape, otherContactingShape) => {
            if (Car.prototype.isPrototypeOf(contactingBody.sprite) &&
                otherContactingShape.centerOfMassFor &&
                ! (contactingBody.sprite.falling || contactingBody.sprite.airborne)) {
                contactingBody.sprite.fall(
                    {
                        x : this.x,
                        y : this.y
                    },
                    true
                );
            }
        });

        if (angle) {
            this.body.angle = angle;
        }

        state.game.physics.p2.enable(this.fixturesSprite);

        this.fixturesSprite.body.clearShapes();

        this.fixturesSprite.body.loadPolygon('Obstacles', 'sinkFixtures');

        if (angle) {
            this.fixturesSprite.body.angle = angle;
        }
    }

    add(state) {
        state.add.existing(this);
        state.add.existing(this.fixturesSprite);
    }

    addToCollisionGroup(collisionGroup) {
        this.body.setCollisionGroup(collisionGroup);
        this.body.collides(collisionGroup);

        this.fixturesSprite.body.setCollisionGroup(collisionGroup);
        this.fixturesSprite.body.collides(collisionGroup);
    }

    postGameObjectPlacement() {
        this.fixturesSprite.bringToTop();
    }
}

export default BathroomSink;
