class AbstractObstacle extends Phaser.Sprite
{
    constructor(state, x, y, key, angle) {
        super(state.game, x, y, key);

        this.createPhysicsBody(state, angle);
        this.state = state;
    }

    loadAssets(state, key) {
        state.load.image(key, this.getSpritePath());
    }

    getSpritePath() {
        throw new Error('Attempted to load assets on abstract class');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        if (angle) {
            this.body.angle = angle;
        }
    }

    add(state) {
        state.add.existing(this);
    }

    addToCollisionGroup(collisionGroup) {
        this.body.setCollisionGroup(collisionGroup);
        this.body.collides(collisionGroup);
    }
}

export default AbstractObstacle;
