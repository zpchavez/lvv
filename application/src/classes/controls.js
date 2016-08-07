var Phaser = require('phaser');

var gamepadButtonMappings = {
    'ACCEL': Phaser.Gamepad.XBOX360_A,
    'BREAK': Phaser.Gamepad.XBOX360_X,
    'UP': Phaser.Gamepad.XBOX360_DPAD_UP,
    'DOWN': Phaser.Gamepad.XBOX360_DPAD_DOWN,
    'LEFT': Phaser.Gamepad.XBOX360_DPAD_LEFT,
    'RIGHT': Phaser.Gamepad.XBOX360_DPAD_RIGHT,
    'SELECT': Phaser.Gamepad.XBOX360_A,
    'SPECIAL1': [
        Phaser.Gamepad.XBOX360_RIGHT_BUMPER,
        Phaser.Gamepad.XBOX360_RIGHT_TRIGGER,
    ],
};
var keyboardButtonMappings = {
    1: {
        'ACCEL': Phaser.Keyboard.UP,
        'BREAK': Phaser.Keyboard.DOWN,
        'UP': Phaser.Keyboard.UP,
        'DOWN': Phaser.Keyboard.DOWN,
        'LEFT': Phaser.Keyboard.LEFT,
        'RIGHT': Phaser.Keyboard.RIGHT,
        'SELECT': Phaser.Keyboard.ENTER,
        'SPECIAL1': Phaser.Keyboard.ENTER,
    },
    2: {
        'ACCEL': Phaser.Keyboard.W,
        'BREAK': Phaser.Keyboard.S,
        'UP': Phaser.Keyboard.W,
        'DOWN': Phaser.Keyboard.S,
        'LEFT': Phaser.Keyboard.A,
        'RIGHT': Phaser.Keyboard.D,
        'SELECT': Phaser.Keyboard.SPACEBAR,
        'SPECIAL1': Phaser.Keyboard.SPACEBAR,
    },
    3: {
        'ACCEL': Phaser.Keyboard.T,
        'BREAK': Phaser.Keyboard.G,
        'UP': Phaser.Keyboard.T,
        'DOWN': Phaser.Keyboard.G,
        'LEFT': Phaser.Keyboard.F,
        'RIGHT': Phaser.Keyboard.H,
        'SELECT': Phaser.Keyboard.Y,
        'SPECIAL1': Phaser.Keyboard.Y,
    },
    4: {
        'ACCEL': Phaser.Keyboard.I,
        'BREAK': Phaser.Keyboard.K,
        'UP': Phaser.Keyboard.I,
        'DOWN': Phaser.Keyboard.K,
        'LEFT': Phaser.Keyboard.J,
        'RIGHT': Phaser.Keyboard.L,
        'SELECT': Phaser.Keyboard.O,
        'SPECIAL1': Phaser.Keyboard.O,
    }
}

var getGamepadConstants = function(button) {
    if (typeof gamepadButtonMappings[button] === 'undefined') {
        throw new Error('Unknown button: ' + button);
    }

    var buttons = (
        Array.isArray(gamepadButtonMappings[button]) ?
        gamepadButtonMappings[button] :
        [gamepadButtonMappings[button]]
    );

    return buttons;
};

var getKeyboardConstant = function(player, button) {
    if (!keyboardButtonMappings[player] || !keyboardButtonMappings[player][button]) {
        throw new Error('Unknown keyboard button: ' + button);
    }

    return keyboardButtonMappings[player][button];
}

var Controls = function(game) {
    this.onDownMappings = [{}, {}, {}, {}];

    for (var player = 1; player < 5; player += 1) {
        game.input.gamepad['pad' + player].onDownCallback = (
            this.getGamepadDownCallback(player)
        );
    }

    game.input.gamepad.start();

    this.game = game;
};

Controls.prototype.getGamepadDownCallback = function(player) {
    var playerMappings = this.onDownMappings[player];
    if (! playerMappings) {
        return function() {};
    }

    return function (button) {
        if (playerMappings[button]) {
            playerMappings[button]();
        }
    };
};

Controls.prototype.onDown = function(player, button, callback) {
    // Map for gamepad
    getGamepadConstants(button).forEach(function (buttonConstant) {
        this.onDownMappings[player][buttonConstant] = callback;
    }.bind(this));

    // Map for keyboard
    this.game.input.keyboard.addKey(
        getKeyboardConstant(player, button)
    ).onDown.add(callback);
};

Controls.prototype.isDown = function(player, button) {
    var isDown = false;

    // Gamepad
    getGamepadConstants(button).forEach(function (buttonConstant) {
        isDown = isDown || this.game.input.gamepad['pad' + player].isDown(buttonConstant);
    }.bind(this));

    if (isDown) {
        return isDown;
    }

    // Keyboard
    return this.game.input.keyboard.isDown(getKeyboardConstant(player, button));
};

Controls.prototype.reset = function() {
    for (var player = 1; player < 5; player += 1) {
        this.game.input.gamepad['pad' + player].onDownCallback = null;
    }
};

module.exports = Controls;
