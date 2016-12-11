const gamepadButtonMappings = {
    'ACCEL': Phaser.Gamepad.XBOX360_A,
    'BRAKE': Phaser.Gamepad.XBOX360_X,
    'UP': Phaser.Gamepad.XBOX360_DPAD_UP,
    'DOWN': Phaser.Gamepad.XBOX360_DPAD_DOWN,
    'LEFT': Phaser.Gamepad.XBOX360_DPAD_LEFT,
    'RIGHT': Phaser.Gamepad.XBOX360_DPAD_RIGHT,
    'SELECT': Phaser.Gamepad.XBOX360_A,
    'CANCEL': Phaser.Gamepad.XBOX360_B,
    'SPECIAL1': [
        Phaser.Gamepad.XBOX360_RIGHT_BUMPER,
        Phaser.Gamepad.XBOX360_RIGHT_TRIGGER,
    ],
};

const keyboardButtonMappings = [
    {
        'ACCEL': Phaser.Keyboard.UP,
        'BRAKE': Phaser.Keyboard.DOWN,
        'UP': Phaser.Keyboard.UP,
        'DOWN': Phaser.Keyboard.DOWN,
        'LEFT': Phaser.Keyboard.LEFT,
        'RIGHT': Phaser.Keyboard.RIGHT,
        'SELECT': Phaser.Keyboard.ENTER,
        'CANCEL': Phaser.Keyboard.QUOTES,
        'SPECIAL1': Phaser.Keyboard.ENTER,
    },
    {
        'ACCEL': Phaser.Keyboard.W,
        'BRAKE': Phaser.Keyboard.S,
        'UP': Phaser.Keyboard.W,
        'DOWN': Phaser.Keyboard.S,
        'LEFT': Phaser.Keyboard.A,
        'RIGHT': Phaser.Keyboard.D,
        'SELECT': Phaser.Keyboard.SPACEBAR,
        'CANCEL': Phaser.Keyboard.Q,
        'SPECIAL1': Phaser.Keyboard.SPACEBAR,
    },
    {
        'ACCEL': Phaser.Keyboard.T,
        'BRAKE': Phaser.Keyboard.G,
        'UP': Phaser.Keyboard.T,
        'DOWN': Phaser.Keyboard.G,
        'LEFT': Phaser.Keyboard.F,
        'RIGHT': Phaser.Keyboard.H,
        'SELECT': Phaser.Keyboard.Y,
        'CANCEL': Phaser.Keyboard.R,
        'SPECIAL1': Phaser.Keyboard.Y,
    },
    {
        'ACCEL': Phaser.Keyboard.I,
        'BRAKE': Phaser.Keyboard.K,
        'UP': Phaser.Keyboard.I,
        'DOWN': Phaser.Keyboard.K,
        'LEFT': Phaser.Keyboard.J,
        'RIGHT': Phaser.Keyboard.L,
        'SELECT': Phaser.Keyboard.O,
        'CANCEL': Phaser.Keyboard.U,
        'SPECIAL1': Phaser.Keyboard.O,
    }
];

const getGamepadConstants = (button) => {
    if (typeof gamepadButtonMappings[button] === 'undefined') {
        throw new Error('Unknown button: ' + button);
    }

    const buttons = (
        Array.isArray(gamepadButtonMappings[button]) ?
        gamepadButtonMappings[button] :
        [gamepadButtonMappings[button]]
    );

    return buttons;
};

const getKeyboardConstant = (player, button) => {
    if (!keyboardButtonMappings[player] || !keyboardButtonMappings[player][button]) {
        throw new Error('Unknown keyboard button: ' + button);
    }

    return keyboardButtonMappings[player][button];
}

const getAxisDownDefaults = () => {
    return {
        'UP': false,
        'DOWN': false,
        'LEFT': false,
        'RIGHT': false,
    };
};

class Controls
{
    constructor(game) {
        this.onDownMappings = [{}, {}, {}, {}];
        this.isAxisDown = [
            getAxisDownDefaults(),
            getAxisDownDefaults(),
            getAxisDownDefaults(),
            getAxisDownDefaults(),
        ];

        for (let player = 0; player < 4; player += 1) {
            game.input.gamepad['pad' + (player + 1)].onDownCallback = (
                this.getGamepadDownCallback(player)
            );
            game.input.gamepad['pad' + (player + 1)].onAxisCallback = (
                this.getGamepadAxisCallback(player)
            );
        }

        game.input.gamepad.start();

        this.game = game;
    }

    leftXAxisNeutral(player) {
        return this.isAxisDown[player].LEFT === false && this.isAxisDown[player].RIGHT === false;
    }

    leftYAxisNeutral(player) {
        return this.isAxisDown[player].UP === false && this.isAxisDown[player].DOWN === false;
    }

    getGamepadDownCallback(player) {
        const playerMappings = this.onDownMappings[player];
        if (! playerMappings) {
            return () => {};
        }

        return (button) => {
            if (playerMappings[button]) {
                playerMappings[button]();
            }
        };
    }

    getGamepadAxisCallback(player) {
        const playerMappings = this.onDownMappings[player];

        return (pad, button, value) => {
            if (this.leftYAxisNeutral(player) && button === Phaser.Gamepad.XBOX360_STICK_LEFT_Y) {
                if (value > 0) {
                    this.isAxisDown[player].DOWN = true;
                    if (playerMappings[gamepadButtonMappings.DOWN]) {
                        playerMappings[gamepadButtonMappings.DOWN]();
                    }
                } else if (value < 0) {
                    this.isAxisDown[player].UP = true;
                    if (playerMappings[gamepadButtonMappings.UP]) {
                        playerMappings[gamepadButtonMappings.UP]();
                    }
                }
            } else if (this.leftXAxisNeutral(player) && button === Phaser.Gamepad.XBOX360_STICK_LEFT_X) {
                if (value > 0) {
                    this.isAxisDown[player].RIGHT = true;
                    if (playerMappings[gamepadButtonMappings.RIGHT]) {
                        playerMappings[gamepadButtonMappings.RIGHT]();
                    }
                } else if (value < 0) {
                    this.isAxisDown[player].LEFT = true;
                    if (playerMappings[gamepadButtonMappings.LEFT]) {
                        playerMappings[gamepadButtonMappings.LEFT]();
                    }
                }
            } else if (! this.leftYAxisNeutral(player) && button === Phaser.Gamepad.XBOX360_STICK_LEFT_Y && value === 0) {
                this.isAxisDown[player].UP = false;
                this.isAxisDown[player].DOWN = false;
            } else if (! this.leftXAxisNeutral(player) && button === Phaser.Gamepad.XBOX360_STICK_LEFT_X && value === 0) {
                this.isAxisDown[player].LEFT = false;
                this.isAxisDown[player].RIGHT = false;
            }
        };
    }

    onDown(player, button, callback) {
        // Map for gamepad
        getGamepadConstants(button).forEach(buttonConstant => {
            this.onDownMappings[player][buttonConstant] = callback;
        });

        // Map for keyboard
        this.game.input.keyboard.addKey(
            getKeyboardConstant(player, button)
        ).onDown.add(callback);
    }

    isDown(player, button) {
        let isDown = false;

        // Gamepad
        getGamepadConstants(button).forEach(buttonConstant => {
            isDown = isDown || this.game.input.gamepad['pad' + (player + 1)].isDown(buttonConstant);
        });

        if (this.isAxisDown[player][button]) {
            isDown = true;
        }

        if (isDown) {
            return isDown;
        }

        // Keyboard
        return this.game.input.keyboard.isDown(getKeyboardConstant(player, button));
    }

    reset() {
        for (let player = 0; player < 4; player += 1) {
            this.game.input.gamepad['pad' + (player + 1)].onDownCallback = null;
        }
        this.game.input.onDown.removeAll()
    }
}

export default Controls;
