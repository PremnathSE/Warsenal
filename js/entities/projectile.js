export class Projectile {

    constructor({
        x,
        y,
        angle,
        speed,
        damage,
        knockback,
        owner,
        range = 600,
        weaponName = "Bow"
    }) {

        this.x = x;

        this.y = y;

        this.previousX = x;

        this.previousY = y;

        this.angle = angle;

        this.speed = speed;

        this.damage = damage;

        this.knockback = knockback;

        this.owner = owner;

        /*
         * Remember which weapon fired
         * this projectile.
         */

        this.weaponName =
            weaponName;


        /*
         * Collision radius.
         */

        this.radius = 6;


        /*
         * Range tracking.
         */

        this.distanceTravelled = 0;

        this.maxRange =
            range;


        this.alive = true;
    }


    /*
     * =================================
     * UPDATE
     * =================================
     */

    update(dt) {

        if (
            !this.alive
        ) {

            return;
        }


        const movement =
            this.speed * dt;

        this.previousX =
            this.x;

        this.previousY =
            this.y;


        this.x +=
            Math.cos(
                this.angle
            ) *
            movement;


        this.y +=
            Math.sin(
                this.angle
            ) *
            movement;


        this.distanceTravelled +=
            movement;


        /*
         * Destroy after maximum range.
         */

        if (
            this.distanceTravelled >=
            this.maxRange
        ) {

            this.alive = false;
        }
    }


    /*
     * =================================
     * COLLISION
     * =================================
     */

    collidesWith(
        target
    ) {

        if (
            !this.alive
        ) {

            return false;
        }


        const radius =
            this.radius +
            target.radius;

        const vx =
            this.x -
            this.previousX;

        const vy =
            this.y -
            this.previousY;

        const lengthSquared =
            vx * vx +
            vy * vy;

        if (lengthSquared === 0) {

            return (
                Math.hypot(
                    target.x - this.x,
                    target.y - this.y
                ) <= radius
            );
        }

        const tx =
            target.x -
            this.previousX;

        const ty =
            target.y -
            this.previousY;

        const projection =
            Math.max(
                0,
                Math.min(
                    1,
                    (tx * vx + ty * vy) /
                    lengthSquared
                )
            );

        const closestX =
            this.previousX +
            projection * vx;

        const closestY =
            this.previousY +
            projection * vy;

        return (
            Math.hypot(
                target.x - closestX,
                target.y - closestY
            ) <= radius
        );
    }
}