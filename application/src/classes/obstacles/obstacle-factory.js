import Ant from './ant';
import AspirinBottle from './aspirin-bottle';
import AspirinPill from './aspirin-pill';
import BathroomSink from './bathroom-sink';
import Binder from './binder';
import ClownNose from './clown-nose';
import Comb from './comb';
import DynamicBox from './dynamic-box';
import Floss from './floss';
import LegalPad from './legal-pad';
import Lollipop from './lollipop';
import MarkerGreen from './marker-green';
import MarkerRed from './marker-red';
import MarkerBlue from './marker-blue';
import MarkerBlack from './marker-black';
import QTip from './q-tip';
import Razor from './razor';
import StaticBox from './static-box';
import Toothbrush from './toothbrush';
import XboxController from './xbox-controller';

const allTypes = {
    'Ant': Ant,
    'AspirinBottle'  : AspirinBottle,
    'AspirinPill'    : AspirinPill,
    'BathroomSink'   : BathroomSink,
    'Binder'         : Binder,
    'ClownNose'      : ClownNose,
    'Comb'           : Comb,
    'DynamicBox'     : DynamicBox,
    'Floss'          : Floss,
    'LegalPad'       : LegalPad,
    'Lollipop'       : Lollipop,
    'MarkerGreen'    : MarkerGreen,
    'MarkerRed'      : MarkerRed,
    'MarkerBlue'     : MarkerBlue,
    'MarkerBlack'    : MarkerBlack,
    'QTip'           : QTip,
    'Razor'          : Razor,
    'StaticBox'      : StaticBox,
    'Toothbrush'     : Toothbrush,
    'XboxController' : XboxController
};

class ObstacleFactory
{
    constructor(state) {
        this.state       = state;
        this.loadedTypes = {};
    }

    loadAssets(types) {
        types.forEach((type) => {
            if (allTypes[type]) {
                allTypes[type].prototype.loadAssets(this.state, type);
                this.loadedTypes[type] = true;
            } else {
                throw new Error('Attempted to load assets for unknown class: ' + type);
            }
        });

        this.state.game.load.atlas(
            'splash',
            'assets/img/ker-splash.png',
            'assets/img/ker-splash.json'
        );

        this.state.load.physics('Obstacles', 'assets/physics/obstacles.json');
    }

    getNew(type, x, y, angle) {
        if (allTypes[type]) {
            if (this.loadedTypes[type]) {
                return new allTypes[type](this.state, x, y, type, angle);
            } else {
                throw new Error('Attempted to create unloaded type. Add a call to load assets for ' + type + '.');
            }
        } else {
            throw new Error('Attempted to create unknown class: ' + type);
        }
    }
}

export default ObstacleFactory;
