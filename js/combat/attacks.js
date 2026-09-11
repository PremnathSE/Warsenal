import {
    meleeHit
} from "./hitDetection.js";

import {
    applyDamage
} from "./damage.js";

import {
    applyKnockback
} from "./knockback.js";

import {
    Projectile
} from "../entities/projectile.js";


/*
 * =================================
 * MAIN ATTACK
 * =================================
 */

export function attack(
    attacker,
    target,
    projectileList
) {

    const weapon =
        attacker.weapon;


    if (!weapon) {

        return false;
    }


    /*
     * =================================
     * MELEE
     * =================================
     */

    if (
        weapon.type === "melee" ||
        weapon.type === "heavy"
    ) {

        return meleeAttack(
            attacker
        );
    }


    /*
     * =================================
     * RANGED
     * =================================
     */

    if (
        weapon.type === "ranged"
    ) {

        return rangedAttack(
            attacker,
            weapon,
            projectileList
        );
    }


    return false;
}


/*
 * =================================
 * MELEE START
 * =================================
 */

function meleeAttack(
    attacker
) {

    if (
        attacker.isAttacking
    ) {

        attacker.attackQueued = true;

        return false;
    }


    if (
        !attacker.weapon
    ) {

        return false;
    }


    if (
        !attacker.weapon.canAttack()
    ) {

        return false;
    }


    /*
     * Start weapon-specific stab.
     */

    const started =
        attacker.startMeleeAttack();


    if (!started) {

        return false;
    }


    /*
     * Cooldown starts immediately.
     */

    attacker.weapon.startCooldown();


    return true;
}


/*
 * =================================
 * RANGED ATTACK
 * =================================
 */

function rangedAttack(
    attacker,
    weapon,
    projectileList
) {

    if (
        !projectileList
    ) {

        return false;
    }


    if (
        !weapon.canAttack()
    ) {

        return false;
    }


    /*
     * =================================
     * PROJECTILE
     * =================================
     */

    const projectile =
        new Projectile({

            x:
                attacker.x +
                Math.cos(
                    attacker.angle
                ) * 30,

            y:
                attacker.y +
                Math.sin(
                    attacker.angle
                ) * 30,

            angle:
                attacker.angle,

            speed:
                weapon.projectileSpeed ||
                1100,

            damage:
                weapon.damage,

            knockback:
                weapon.knockback || 0,

            owner:
                attacker,

            range:
                weapon.range || 600,

            weaponName:
                weapon.name
        });


    projectileList.push(
        projectile
    );


    /*
     * Start cooldown.

     */

    weapon.startCooldown();


    /*
     * Small firing flash.

     */

    attacker.attackFlash =
        0.12;


    return true;
}


/*
 * =================================
 * GET MELEE ACTIVE WINDOW
 * =================================
 */

function getActiveWindow(
    weapon
) {

    const name =
        String(
            weapon?.name || ""
        ).toLowerCase();


    /*
     * =================================
     * DAGGER
     * =================================
     */

    if (
        name === "dagger"
    ) {

        return {
            start: 0.22,
            end: 0.70
        };
    }


    /*
     * =================================
     * SWORD
     * =================================
     */

    if (
        name === "sword"
    ) {

        return {
            start: 0.22,
            end: 0.70
        };
    }


    /*
     * =================================
     * SPEAR
     * =================================
     */

    if (
        name === "spear"
    ) {

        return {
            start: 0.25,
            end: 0.68
        };
    }


    /*
     * =================================
     * HAMMER
     * =================================
     */

    if (
        name === "hammer"
    ) {

        return {
            start: 0.28,
            end: 0.72
        };
    }


    /*
     * =================================
     * FALLBACK
     * =================================
     */

    if (
        weapon.type === "heavy"
    ) {

        return {
            start: 0.28,
            end: 0.72
        };
    }


    return {
        start: 0.22,
        end: 0.70
    };
}


/*
 * =================================
 * MELEE HIT
 * =================================
 */

export function processMeleeHit(
    attacker,
    target
) {

    /*
     * =================================
     * VALIDATION
     * =================================
     */

    if (
        !attacker ||
        !target
    ) {

        return false;
    }


    if (
        !attacker.isAttacking
    ) {

        return false;
    }


    if (
        attacker.attackHit
    ) {

        return false;
    }


    if (
        !attacker.weapon
    ) {

        return false;
    }


    /*
     * Ranged weapons don't use
     * melee collision.
     */

    if (
        attacker.weapon.type !== "melee" &&
        attacker.weapon.type !== "heavy"
    ) {

        return false;
    }


    /*
     * =================================
     * ACTIVE WINDOW
     * =================================
     */

    const progress =
        attacker.attackProgress;


    const window =
        getActiveWindow(
            attacker.weapon
        );


    if (
        progress < window.start ||
        progress > window.end
    ) {

        return false;
    }


    /*
     * =================================
     * HIT DETECTION
     * =================================
     */

    const hit =
        meleeHit(
            attacker,
            target,
            attacker.weapon
        );


    if (!hit) {

        return false;
    }


    /*
     * =================================
     * DAMAGE
     * =================================
     */

    const damaged =
        applyDamage(
            target,
            attacker.weapon.damage
        );


    if (!damaged) {

        return false;
    }


    /*
     * One hit per attack.
     */

    attacker.attackHit =
        true;


    /*
     * =================================
     * KNOCKBACK
     * =================================
     */

    if (
        attacker.weapon.knockback > 0
    ) {

        applyKnockback(
            attacker,
            target,
            attacker.weapon.knockback
        );
    }


    /*
     * =================================
     * HIT FLASH
     * =================================
     */

    attacker.attackFlash =
        0.12;


    return true;
}