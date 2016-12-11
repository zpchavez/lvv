'use strict';

import AbstractObstacle from './abstract-obstacle';

class AbstractStaticObstacle extends AbstractObstacle
{
    constructor(state, x, y, key, angle)
    {
        super(...arguments);

        this.body.dynamic = false;
    }
}

export default AbstractStaticObstacle;
