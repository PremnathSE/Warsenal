export class Keyboard {

    constructor() {

        /*
         * =================================
         * KEY STATE
         * =================================
         *
         * keys:
         * Keys currently being held.
         *
         * justPressed:
         * Keys pressed since the last
         * keyboard.update() call.
         */

        this.keys = new Set();

        this.justPressed = new Set();


        /*
         * =================================
         * KEY DOWN
         * =================================
         */

        addEventListener(
            "keydown",
            e => {

                /*
                 * Prevent the browser from
                 * scrolling when using Space
                 * or arrow keys.
                 */

                if (
                    [
                        "Space",
                        "ArrowUp",
                        "ArrowDown",
                        "ArrowLeft",
                        "ArrowRight"
                    ].includes(e.code)
                ) {

                    e.preventDefault();
                }


                /*
                 * Only register the initial
                 * press.
                 *
                 * Holding a key does not create
                 * repeated "pressed" events.
                 */

                if (
                    !e.repeat
                ) {

                    this.justPressed.add(
                        e.code
                    );
                }


                /*
                 * Key remains in the held set
                 * until keyup.
                 */

                this.keys.add(
                    e.code
                );
            },
            {
                passive: false
            }
        );


        /*
         * =================================
         * KEY UP
         * =================================
         */

        addEventListener(
            "keyup",
            e => {

                this.keys.delete(
                    e.code
                );
            }
        );


        /*
         * =================================
         * WINDOW BLUR
         * =================================
         *
         * Prevents stuck keys if the player
         * switches windows while holding one.
         */

        addEventListener(
            "blur",
            () => {

                this.keys.clear();

                this.justPressed.clear();
            }
        );
    }


    /*
     * =================================
     * KEY HELD
     * =================================
     *
     * Returns true while the key is held.
     *
     * Example:
     *
     * keyboard.down("KeyW")
     *
     */

    down(key) {

        return this.keys.has(
            key
        );
    }


    /*
     * =================================
     * KEY JUST PRESSED
     * =================================
     *
     * Returns true only once for a
     * newly pressed key.
     *
     * Perfect for:
     *
     * Space = Dodge
     * 1-6 = Weapon selection
     *
     */

    pressed(key) {

        return this.justPressed.has(
            key
        );
    }


    /*
     * =================================
     * MOVEMENT AXIS
     * =================================
     *
     * WASD + Arrow keys.
     *
     * The returned vector is normalized,
     * so diagonal movement isn't faster.
     *
     */

    axis() {

        let x = 0;

        let y = 0;


        /*
         * LEFT
         */

        if (
            this.down("KeyA") ||
            this.down("ArrowLeft")
        ) {

            x--;
        }


        /*
         * RIGHT
         */

        if (
            this.down("KeyD") ||
            this.down("ArrowRight")
        ) {

            x++;
        }


        /*
         * UP
         */

        if (
            this.down("KeyW") ||
            this.down("ArrowUp")
        ) {

            y--;
        }


        /*
         * DOWN
         */

        if (
            this.down("KeyS") ||
            this.down("ArrowDown")
        ) {

            y++;
        }


        /*
         * =================================
         * NORMALIZE
         * =================================
         */

        const length =
            Math.hypot(
                x,
                y
            );


        /*
         * No movement.

         */

        if (
            length === 0
        ) {

            return {
                x: 0,
                y: 0
            };
        }


        /*
         * Normalized movement vector.

         */

        return {

            x:
                x / length,

            y:
                y / length

        };
    }


    /*
     * =================================
     * END FRAME
     * =================================
     *
     * Game.js must call this ONCE after
     * processing the current frame.
     *
     * This makes pressed() a true
     * one-frame event.
     *
     */

    update() {

        this.justPressed.clear();
    }
}