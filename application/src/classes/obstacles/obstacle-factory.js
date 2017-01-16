import Ant from './ant';
import AspirinBottle from './aspirin-bottle';
import AspirinPill from './aspirin-pill';
import BathroomSink from './bathroom-sink';
import Binder from './binder';
import ClownNose from './clown-nose';
import Comb from './comb';
import DynamicBox from './dynamic-box';
import Floss from './floss';
import HandShovel from './hand-shovel';
import HorseShoe from './horse-shoe';
import LegalPad from './legal-pad';
import Lollipop from './lollipop';
import MarkerGreen from './marker-green';
import MarkerRed from './marker-red';
import MarkerBlue from './marker-blue';
import MarkerBlack from './marker-black';
import Pebble1 from './pebble-1';
import Pebble2 from './pebble-2';
import Pebble3 from './pebble-3';
import Pebble4 from './pebble-4';
import Pebble5 from './pebble-5';
import Pebble6 from './pebble-6';
import Pebble7 from './pebble-7';
import QTip from './q-tip';
import Razor from './razor';
import Sprayer from './sprayer';
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
    'HandShovel'     : HandShovel,
    'HorseShoe'      : HorseShoe,
    'LegalPad'       : LegalPad,
    'Lollipop'       : Lollipop,
    'MarkerGreen'    : MarkerGreen,
    'MarkerRed'      : MarkerRed,
    'MarkerBlue'     : MarkerBlue,
    'MarkerBlack'    : MarkerBlack,
    'Pebble1'        : Pebble1,
    'Pebble2'        : Pebble2,
    'Pebble3'        : Pebble3,
    'Pebble4'        : Pebble4,
    'Pebble5'        : Pebble5,
    'Pebble6'        : Pebble6,
    'Pebble7'        : Pebble7,
    'QTip'           : QTip,
    'Razor'          : Razor,
    'Sprayer'        : Sprayer,
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
