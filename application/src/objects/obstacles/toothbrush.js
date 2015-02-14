'use strict';

var AbstractStaticObstacle = require('./abstract-static-obstacle');

var Toothbrush = function(state, x, y, key)
{
    AbstractStaticObstacle.apply(this, arguments);
};

Toothbrush.prototype = Object.create(AbstractStaticObstacle.prototype);

Toothbrush.prototype.getSpritePath = function()
{
    return ('assets/img/toothbrush.png');
};

Toothbrush.prototype.createPhysicsBody = function(state)
{
    state.game.physics.p2.enable(this, true);

    this.body.clearShapes();

    this.body.addPolygon(
        {
            skipSimpleCheck : true
        },
        [
            [18.952083,85.609722],
            [21.249306,71.826389],
            [53.984722,55.745833],
            [153.33958,44.834028],
            [379.04167,36.79375],
            [420.96597,35.645139],
            [481.84236,49.428472],
            [495.05139,58.043056],
            [607.04097,92.501389],
            [639.20208,96.521528],
            [682.84931,91.352778],
            [683.99792,52.874306],
            [709.26736,47.13125],
            [733.38819,47.705555],
            [766.12361,46.556944],
            [810.34514,35.645139],
            [818.95972,37.942361],
            [809.77083,86.184028],
            [816.6625,87.332639],
            [817.81111,102.83889],
            [794.26459,110.30486],
            [608.18958,118.91944],
            [481.26806,101.11597],
            [437.62083,101.69027],
            [403.73681,95.947223],
            [379.61597,86.758333],
            [326.77986,82.163889],
            [232.01944,90.204166],
            [133.23889,103.9875],
            [73.511111,106.85903],
            [38.478472,101.11597]
        ]
    );
};

module.exports = Toothbrush;
