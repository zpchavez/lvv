import AbstractStaticObstacle from './abstract-static-obstacle';
import Car from 'app/classes/car';
import util from 'app/util';

/*
    Upon detecting contact between this and a car object, trigger a jump or register the ids of the
    overlapping shapes in the contactingEntities object and apply a friction multiplier.
*/
const onBeginContact = (contactingBody, qTipContactingShape, otherContactingShape) => {
    let velocity;

    if (Car.prototype.isPrototypeOf(contactingBody.sprite) &&
        ! (contactingBody.sprite.falling || contactingBody.sprite.airborne)) {
        velocity = util.getVectorMagnitude([
            contactingBody.velocity.x,
            contactingBody.velocity.y
        ]);

        if (velocity > 600) {
            contactingBody.sprite.jump(0.4);
        } else {
            contactingBody.sprite.addFrictionMultiplier('qTip', 4.5);

            if (! this.contactingEntities[contactingBody.id]) {
                this.contactingEntities[contactingBody.id] = {};
            }

            // Create a key in contactingEntites that corresponds to the two shapes in contact
            this.contactingEntities[contactingBody.id][qTipContactingShape.id + '-' + otherContactingShape.id] = true;
        }
    }
};

/*
    Upon the end of contact between a shape from this obstacle and a shape from a car, remove the shape
    pair from contactingEntities. If contactingEntities shows there are no more overlapping shapes
    between the two bodies, then remove the friction multiplier.
*/
const onEndContact = (contactingBody, qTipContactingShape, otherContactingShape) => {
    if (Car.prototype.isPrototypeOf(contactingBody.sprite)) {
        if (this.contactingEntities[contactingBody.id]) {
            // Remove the key in contactingEntities that corresponds to these two shapes
            delete this.contactingEntities[contactingBody.id][qTipContactingShape.id + '-' + otherContactingShape.id];
            // If there are no more shapes overlapping between the bodies, then the bodies are no longer in contact
            if (Object.keys(this.contactingEntities[contactingBody.id]).length === 0) {
                delete this.contactingEntities[contactingBody.id];
                contactingBody.sprite.removeFrictionMultiplier('qTip');
            }
        } else {
            // If there are no keys in contactingEntities that correspond to this object, then the bodies are no longer
            // in contact
            contactingBody.sprite.removeFrictionMultiplier('qTip');
        }
    }
};

class QTip extends AbstractStaticObstacle
{
    constructor(state, x, y, key, angle) {
        super(...arguments);

        this.contactingEntities = {};
    }

    getSpritePath() {
        return ('assets/img/obstacles/q-tip.png');
    }

    createPhysicsBody(state, angle) {
        state.game.physics.p2.enable(this);

        this.body.clearShapes();

        this.body.loadPolygon('Obstacles', 'qTip');

        this.body.data.shapes.forEach((shape) => {
            shape.sensor = true;
        });

        this.body.onBeginContact.add(onBeginContact , this);

        this.body.onEndContact.add(onEndContact, this);

        if (angle) {
            this.body.angle = angle;
        }
    }
}

export default QTip;
