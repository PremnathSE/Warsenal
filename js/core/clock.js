/*
 * =================================
 * WARSENAL CLOCK
 * =================================
 */

export class Clock {

    constructor() {
        this.lastTime = null;
        this.deltaTime = 0;
        this.elapsed = 0;
    }

    tick(timestamp = performance.now()) {
        if (this.lastTime === null) {
            this.lastTime = timestamp;
            this.deltaTime = 0;
            return 0;
        }

        this.deltaTime =
            Math.max(
                0,
                Math.min(
                    (timestamp - this.lastTime) / 1000,
                    0.1
                )
            );

        this.lastTime = timestamp;
        this.elapsed += this.deltaTime;

        return this.deltaTime;
    }

    reset(timestamp = performance.now()) {
        this.lastTime = timestamp;
        this.deltaTime = 0;
        this.elapsed = 0;
    }
}
