'use strict';

var _                      = require('underscore');
var util                   = require('../../util');
var AbstractStaticObstacle = require('./abstract-static-obstacle');
var Car                    = require('../car');

var QTip = function(state, x, y, key, angle)
{
    AbstractStaticObstacle.apply(this, arguments);

    this.contactingEntities = {};
};

QTip.prototype = Object.create(AbstractStaticObstacle.prototype);

QTip.prototype.getSpritePath = function()
{
    return ('assets/img/q-tip.png');
};

QTip.prototype.createPhysicsBody = function(state, angle)
{
    state.game.physics.p2.enable(this);

    this.body.clearShapes();

    this.body.loadPolygon('Obstacles', 'qTip');

    _.each(this.body.data.shapes, function(shape) {
        shape.sensor = true;
    });

    this.body.onBeginContact.add(function (contactingBody, qTipContactingShape, otherContactingShape) {
        var velocity;

        if (Car.prototype.isPrototypeOf(contactingBody.sprite) &&
            ! (contactingBody.sprite.falling || contactingBody.sprite.airborne)) {
            velocity = util.getVectorMagnitude([
                contactingBody.velocity.x,
                contactingBody.velocity.y
            ]);

            if (velocity > 600) {
                contactingBody.sprite.jump(0.6);
            } else {
                contactingBody.sprite.addFrictionMultiplier('qTip', 5);

                if (! this.contactingEntities[contactingBody.id]) {
                    this.contactingEntities[contactingBody.id] = {};
                }

                this.contactingEntities[contactingBody.id][qTipContactingShape.id + '-' + otherContactingShape.id] = true;
            }
        }
    }, this);

    this.body.onEndContact.add(function (contactingBody, qTipContactingShape, otherContactingShape) {
        if (Car.prototype.isPrototypeOf(contactingBody.sprite)) {
            if (this.contactingEntities[contactingBody.id]) {
                delete this.contactingEntities[contactingBody.id][qTipContactingShape.id + '-' + otherContactingShape.id]
                if (_.keys(this.contactingEntities[contactingBody.id]).length === 0) {
                    delete this.contactingEntities[contactingBody.id];
                    contactingBody.sprite.removeFrictionMultiplier('qTip');
                }
            } else {
                contactingBody.sprite.removeFrictionMultiplier('qTip');
            }
        }
    }, this);

    if (angle) {
        this.body.angle = angle;
    }
};

module.exports = QTip;
