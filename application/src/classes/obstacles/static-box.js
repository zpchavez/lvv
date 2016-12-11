import AbstractStaticObstacle from './abstract-static-obstacle';

class StaticBox extends AbstractStaticObstacle
{
    getSpritePath() {
        return 'assets/img/obstacles/black-box.png';
    }
}

export default AbstractStaticObstacle;
