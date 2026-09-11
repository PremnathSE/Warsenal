export class Mouse {

    constructor() {

        this.x = innerWidth / 2;
        this.y = innerHeight / 2;

        this.leftDown = false;
        this.justPressed = false;


        /*
         * =================================
         * MOUSE MOVEMENT
         * =================================
         */

        addEventListener(
            "mousemove",
            e => {

                this.x = e.clientX;
                this.y = e.clientY;
            }
        );


        /*
         * =================================
         * LEFT MOUSE BUTTON
         * =================================
         */

        addEventListener(
            "mousedown",
            e => {

                if (e.button !== 0) {
                    return;
                }


                /*
                 * If the click happened on a UI
                 * element, do NOT turn it into
                 * a combat attack.
                 */

                const target = e.target;

                if (
                    target.closest("#mainMenu") ||
                    target.closest("#weaponSelectMenu") ||
                    target.closest("#reset") ||
                    target.closest("button")
                ) {

                    this.leftDown = false;
                    this.justPressed = false;

                    return;
                }


                /*
                 * Normal arena click.
                 */

                this.leftDown = true;
                this.justPressed = true;
            }
        );


        /*
         * =================================
         * RELEASE
         * =================================
         */

        addEventListener(
            "mouseup",
            e => {

                if (e.button !== 0) {
                    return;
                }

                this.leftDown = false;
            }
        );


        /*
         * =================================
         * WINDOW BLUR
         * =================================
         */

        addEventListener(
            "blur",
            () => {

                this.leftDown = false;
                this.justPressed = false;
            }
        );
    }


    /*
     * =================================
     * BUTTON HELD
     * =================================
     */

    down() {

        return this.leftDown;
    }


    /*
     * =================================
     * BUTTON PRESSED
     * =================================
     */

    consumePress() {

        if (!this.justPressed) {
            return false;
        }

        this.justPressed = false;

        return true;
    }


    /*
     * =================================
     * CLEAR PRESS
     * =================================
     */

    clearPress() {

        this.justPressed = false;
    }
}