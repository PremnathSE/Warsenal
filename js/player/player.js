import { hitEffect } from "../combat/effects.js";


export class Player {

    constructor(
        x,
        y,
        id = "player"
    ) {

        this.id = id;

        this.radius = 19;

        this.maxHealth = 100;

        this.speed = 260;

        this.x = x;
        this.y = y;

        this.health =
            this.maxHealth;

        this.angle = 0;


        /*
         * =================================
         * DODGE
         * =================================
         */

        this.invulnerable = 0;

        this.dodgeCooldown = 0;

        this.dodgeDuration = 0;

        this.dodgeSpeed = 720;

        this.dodgeDirectionX = 0;

        this.dodgeDirectionY = 0;

        this.dodgeKeyWasDown = false;


        /*
         * =================================
         * COMBAT
         * =================================
         */

        this.weapon = null;

        this.attackFlash = 0;

        this.isAttacking = false;

        this.attackProgress = 0;

        this.attackHit = false;

        this.attackQueued = false;

        this.attackDuration = 0;

        this.attackStartAngle = 0;

        this.stabDistance = 0;


        /*
         * Attack settings.
         */

        this.attackWindup = 0.15;

        this.attackActiveStart = 0.15;

        this.attackActiveEnd = 0.75;

        this.attackRecovery = 0.25;

        this.maxStabDistance = 50;


        /*
         * =================================
         * DAMAGE EFFECTS
         * =================================
         */

        this.hitFlash = 0;

        this.damagePopup = null;

        this.impactEffect = null;

        this.damageScreenFlash = 0;
    }


    /*
     * =================================
     * RESET
     * =================================
     */

    reset(x, y) {

        this.x = x;

        this.y = y;

        this.health =
            this.maxHealth;

        this.angle = 0;


        /*
         * Dodge.
         */

        this.invulnerable = 0;

        this.dodgeCooldown = 0;

        this.dodgeDuration = 0;

        this.dodgeDirectionX = 0;

        this.dodgeDirectionY = 0;

        this.dodgeKeyWasDown = false;


        /*
         * Combat.
         */

        this.weapon = null;

        this.attackFlash = 0;

        this.isAttacking = false;

        this.attackProgress = 0;

        this.attackHit = false;

        this.attackQueued = false;

        this.attackDuration = 0;

        this.attackStartAngle = 0;

        this.stabDistance = 0;


        /*
         * Attack settings.
         */

        this.attackWindup = 0.15;

        this.attackActiveStart = 0.15;

        this.attackActiveEnd = 0.75;

        this.attackRecovery = 0.25;

        this.maxStabDistance = 50;


        /*
         * Effects.
         */

        this.hitFlash = 0;

        this.damagePopup = null;

        this.impactEffect = null;

        this.damageScreenFlash = 0;
    }


    /*
     * =================================
     * WEAPON
     * =================================
     */

    setWeapon(weapon) {

        this.weapon = weapon;


        if (!weapon) {

            this.isAttacking = false;

            this.attackProgress = 0;

            this.attackHit = false;

            this.attackDuration = 0;

            this.stabDistance = 0;

            return;
        }


        this.configureAttack();
    }


    /*
     * =================================
     * ATTACK CONFIGURATION
     * =================================
     */

    configureAttack() {

        if (!this.weapon) {
            return;
        }


        const name =
            String(
                this.weapon.name || ""
            ).toLowerCase();


        /*
         * Dagger.
         */

        if (name === "dagger") {

            this.attackDuration = 0.20;

            this.attackWindup = 0.10;

            this.attackActiveStart = 0.10;

            this.attackActiveEnd = 0.72;

            this.attackRecovery = 0.28;

            this.maxStabDistance = 38;

            return;
        }


        /*
         * Sword.
         */

        if (name === "sword") {

            this.attackDuration = 0.30;

            this.attackWindup = 0.15;

            this.attackActiveStart = 0.15;

            this.attackActiveEnd = 0.75;

            this.attackRecovery = 0.25;

            this.maxStabDistance = 50;

            return;
        }


        /*
         * Spear.
         */

        if (name === "spear") {

            this.attackDuration = 0.38;

            this.attackWindup = 0.18;

            this.attackActiveStart = 0.18;

            this.attackActiveEnd = 0.78;

            this.attackRecovery = 0.22;

            this.maxStabDistance = 62;

            return;
        }


        /*
         * Hammer.
         */

        if (name === "hammer") {

            this.attackDuration = 0.60;

            this.attackWindup = 0.25;

            this.attackActiveStart = 0.25;

            this.attackActiveEnd = 0.78;

            this.attackRecovery = 0.22;

            this.maxStabDistance = 42;

            return;
        }


        /*
         * Fallback.
         */

        if (
            this.weapon.type === "heavy"
        ) {

            this.attackDuration = 0.60;

            this.attackWindup = 0.25;

            this.attackActiveStart = 0.25;

            this.attackActiveEnd = 0.78;

            this.attackRecovery = 0.22;

            this.maxStabDistance = 42;

        } else {

            this.attackDuration = 0.32;

            this.attackWindup = 0.15;

            this.attackActiveStart = 0.15;

            this.attackActiveEnd = 0.75;

            this.attackRecovery = 0.25;

            this.maxStabDistance = 50;
        }
    }


    /*
     * =================================
     * AIM
     * =================================
     */

    updateAim(
        mx,
        my,
        rect
    ) {

        if (
            this.isAttacking
        ) {

            return;
        }


        this.angle =
            Math.atan2(

                my -
                    rect.top -
                    this.y,

                mx -
                    rect.left -
                    this.x
            );
    }


    /*
     * =================================
     * MOVEMENT + DODGE
     * =================================
     */

    updateMovement(
        keyboard,
        dt,
        width,
        height
    ) {

        const axis =
            keyboard.axis();


        /*
         * =================================
         * UPDATE TIMERS
         * =================================
         */

        this.invulnerable =
            Math.max(
                0,
                this.invulnerable - dt
            );


        this.dodgeCooldown =
            Math.max(
                0,
                this.dodgeCooldown - dt
            );


        /*
         * =================================
         * SPACE INPUT
         * =================================
         *
         * Detect the transition:
         *
         * UP → DOWN
         *
         * This prevents holding Space from
         * continuously starting dodges.
         */

        const spaceDown =
            keyboard.down("Space");


        const spacePressed =
            spaceDown &&
            !this.dodgeKeyWasDown;


        this.dodgeKeyWasDown =
            spaceDown;


        /*
         * =================================
         * START DODGE
         * =================================
         */

        if (
            spacePressed &&
            this.dodgeCooldown <= 0 &&
            this.dodgeDuration <= 0 &&
            (axis.x !== 0 || axis.y !== 0)
        ) {

            /*
             * Normalize direction.
             */

            const length =
                Math.hypot(
                    axis.x,
                    axis.y
                );


            this.dodgeDirectionX =
                axis.x / length;

            this.dodgeDirectionY =
                axis.y / length;


            /*
             * Dodge duration.
             */

            this.dodgeDuration =
                0.16;


            /*
             * Cooldown starts immediately.
             */

            this.dodgeCooldown =
                0.75;


            /*
             * Invulnerability lasts for the
             * dodge itself.
             */

            this.invulnerable =
                0.16;
        }


        /*
         * =================================
         * DODGE MOVEMENT
         * =================================
         */

        if (
            this.dodgeDuration > 0
        ) {

            this.x +=
                this.dodgeDirectionX *
                this.dodgeSpeed *
                dt;

            this.y +=
                this.dodgeDirectionY *
                this.dodgeSpeed *
                dt;


            this.dodgeDuration =
                Math.max(
                    0,
                    this.dodgeDuration - dt
                );
        }


        /*
         * =================================
         * NORMAL MOVEMENT
         * =================================
         */

        else {

            this.x +=
                axis.x *
                this.speed *
                dt;

            this.y +=
                axis.y *
                this.speed *
                dt;
        }


        /*
         * =================================
         * ARENA LIMITS
         * =================================
         */

        this.x =
            Math.max(
                this.radius,

                Math.min(
                    width -
                        this.radius,

                    this.x
                )
            );


        this.y =
            Math.max(
                this.radius,

                Math.min(
                    height -
                        this.radius,

                    this.y
                )
            );
    }


    /*
     * =================================
     * IS DODGING
     * =================================
     */

    isDodging() {

        return (
            this.dodgeDuration > 0
        );
    }


    /*
     * =================================
     * START MELEE ATTACK
     * =================================
     */

    startMeleeAttack() {

        if (
            this.isAttacking
        ) {

            return false;
        }


        if (
            !this.weapon
        ) {

            return false;
        }


        if (
            this.weapon.type !== "melee" &&
            this.weapon.type !== "heavy"
        ) {

            return false;
        }


        /*
         * Don't start an attack while
         * actively dodging.
         */

        if (
            this.isDodging()
        ) {

            return false;
        }


        this.configureAttack();


        /*
         * Lock direction.
         */

        this.attackStartAngle =
            this.angle;


        /*
         * Start attack.

         */

        this.isAttacking =
            true;

        this.attackProgress =
            0;

        this.attackHit =
            false;

        this.stabDistance =
            0;


        this.attackFlash =
            0.12;


        return true;
    }


    /*
     * =================================
     * UPDATE ATTACK
     * =================================
     */

    updateAttack(dt) {

        if (
            !this.isAttacking
        ) {

            this.stabDistance =
                0;

            return;
        }


        if (
            this.attackDuration <= 0
        ) {

            this.configureAttack();
        }


        /*
         * Advance.
         */

        this.attackProgress +=
            dt /
            this.attackDuration;


        this.attackProgress =
            Math.min(
                1,
                this.attackProgress
            );


        /*
         * =================================
         * WIND-UP
         * =================================
         */

        if (
            this.attackProgress <
            this.attackActiveStart
        ) {

            const p =
                this.attackProgress /
                this.attackActiveStart;


            this.stabDistance =
                -8 * p;
        }


        /*
         * =================================
         * THRUST
         * =================================
         */

        else if (
            this.attackProgress <
            this.attackActiveEnd
        ) {

            const p =
                (
                    this.attackProgress -
                    this.attackActiveStart
                ) /
                (
                    this.attackActiveEnd -
                    this.attackActiveStart
                );


            const smooth =
                p * p *
                (3 - 2 * p);


            this.stabDistance =
                -8 +
                smooth *
                (
                    this.maxStabDistance + 8
                );
        }


        /*
         * =================================
         * RECOVERY
         * =================================
         */

        else {

            const recoveryLength =
                1 -
                this.attackActiveEnd;


            const p =
                (
                    this.attackProgress -
                    this.attackActiveEnd
                ) /
                recoveryLength;


            this.stabDistance =
                this.maxStabDistance -
                p *
                this.maxStabDistance;
        }


        /*
         * =================================
         * FINISH
         * =================================
         */

        if (
            this.attackProgress >= 1
        ) {

            this.isAttacking =
                false;

            this.attackProgress =
                0;

            this.stabDistance =
                0;

            this.attackHit =
                false;
        }
    }


    /*
     * =================================
     * ATTACK ACTIVE
     * =================================
     */

    isAttackActive() {

        if (
            !this.isAttacking
        ) {

            return false;
        }


        return (
            this.attackProgress >=
                this.attackActiveStart &&

            this.attackProgress <=
                this.attackActiveEnd
        );
    }


    /*
     * =================================
     * EFFECTS
     * =================================
     */

    updateEffects(dt) {

        this.hitFlash =
            Math.max(
                0,
                this.hitFlash - dt
            );


        this.attackFlash =
            Math.max(
                0,
                this.attackFlash - dt
            );


        this.damageScreenFlash =
            Math.max(
                0,
                this.damageScreenFlash - dt
            );


        /*
         * Damage popup.
         */

        if (
            this.damagePopup
        ) {

            this.damagePopup.timer -= dt;

            this.damagePopup.offsetY -=
                25 * dt;


            if (
                this.damagePopup.timer <= 0
            ) {

                this.damagePopup = null;
            }
        }


        /*
         * Impact effect.
         */

        if (
            this.impactEffect
        ) {

            this.impactEffect.timer -= dt;

            this.impactEffect.radius +=
                100 * dt;


            if (
                this.impactEffect.timer <= 0
            ) {

                this.impactEffect = null;
            }
        }
    }


    /*
     * =================================
     * DAMAGE
     * =================================
     */

    takeDamage(amount) {

    if (this.invulnerable) {
        return false;
    }

    if (this.health <= 0) {
        return false;
    }

    const damage = Math.max(0, amount);

    this.health = Math.max(
        0,
        this.health - damage
    );

    this.hitFlash = 0.12;

    return true;
}
}