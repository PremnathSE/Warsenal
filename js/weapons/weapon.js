export class Weapon {

    constructor(config) {

        this.name =
            config.name;

        this.type =
            config.type;


        /*
         * =================================
         * COMBAT STATS
         * =================================
         */

        this.range =
            config.range;

        this.damage =
            config.damage;

        this.cooldown =
            config.cooldown;

        this.knockback =
            config.knockback;


        /*
         * Legacy arc value.
         *
         * The current melee system uses
         * forward stabbing rather than
         * a swing arc.
         */

        this.arc =
            config.arc || 0;


        /*
         * =================================
         * PROJECTILE
         * =================================
         *
         * Bow and Staff both get their
         * projectile speed directly from
         * weaponStats.js.
         */

        this.projectileSpeed =
            config.projectileSpeed || 0;


        /*
         * =================================
         * COOLDOWN
         * =================================
         */

        this.cooldownTimer =
            0;
    }


    /*
     * =================================
     * UPDATE
     * =================================
     */

    update(dt) {

        if (
            this.cooldownTimer > 0
        ) {

            this.cooldownTimer -= dt;


            if (
                this.cooldownTimer < 0
            ) {

                this.cooldownTimer = 0;
            }
        }
    }


    /*
     * =================================
     * CAN ATTACK
     * =================================
     */

    canAttack() {

        return (
            this.cooldownTimer <= 0
        );
    }


    /*
     * =================================
     * START COOLDOWN
     * =================================
     */

    startCooldown() {

        this.cooldownTimer =
            this.cooldown;
    }


    /*
     * =================================
     * RESET
     * =================================
     */

    reset() {

        this.cooldownTimer =
            0;
    }
}