export class InputManager {

    constructor(keyboard, mouse) {

        this.keyboard = keyboard;
        this.mouse = mouse;
    }


    movement() {

        return this.keyboard.axis();
    }


    /*
     * =================================
     * KEY JUST PRESSED COMPATIBILITY
     * =================================
     *
     * Game.js uses wasPressed() for
     * one-shot actions such as Dodge.
     *
     * Consume the key here so the action
     * cannot repeat every frame.
     */

    wasPressed(key) {

        if (
            !this.keyboard ||
            typeof this.keyboard.pressed !==
                "function"
        ) {
            return false;
        }

        const pressed =
            this.keyboard.pressed(key);

        if (
            pressed &&
            this.keyboard.justPressed
        ) {
            this.keyboard.justPressed.delete(
                key
            );
        }

        return pressed;
    }


    attackPressed() {

        return this.mouse.consumePress();
    }


    /*
     * =================================
     * CLEAR UI INPUT
     *
     * Call this after a UI click that
     * should NOT become a combat attack.
     * =================================
     */

    clearAttackPress() {

        this.mouse.clearPress();
    }
}