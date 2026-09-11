/*
 * =================================
 * DISTANCE
 * =================================
 */

export function distance(
    a,
    b
) {

    return Math.hypot(
        b.x - a.x,
        b.y - a.y
    );
}


/*
 * =================================
 * ANGLE DIFFERENCE
 * =================================
 */

export function angleDifference(
    a,
    b
) {

    return Math.atan2(
        Math.sin(a - b),
        Math.cos(a - b)
    );
}


/*
 * =================================
 * MELEE STAB HIT
 * =================================
 *
 * Uses the actual animated weapon
 * position instead of a swing arc.
 */

export function meleeHit(
    attacker,
    target,
    weapon
) {

    if (
        !attacker ||
        !target ||
        !weapon
    ) {

        return false;
    }


    /*
     * =================================
     * ATTACK DIRECTION
     * =================================
     */

    const angle =
        attacker.attackStartAngle;


    const dirX =
        Math.cos(angle);

    const dirY =
        Math.sin(angle);


    /*
     * =================================
     * TARGET OFFSET
     * =================================
     */

    const dx =
        target.x -
        attacker.x;

    const dy =
        target.y -
        attacker.y;


    /*
     * =================================
     * FORWARD DISTANCE
     * =================================
     */

    const forwardDistance =
        dx * dirX +
        dy * dirY;


    /*
     * Target is behind attacker.

     */

    if (
        forwardDistance <
        -target.radius
    ) {

        return false;
    }


    /*
     * =================================
     * SIDE DISTANCE
     * =================================
     */

    const sideDistance =
        Math.abs(
            dx * dirY -
            dy * dirX
        );


    /*
     * =================================
     * WEAPON REACH
     * =================================
     *
     * Use the weapon's actual range,
     * but also account for the current
     * stab animation.
     */

    const weaponRange =
        Number(
            weapon.range
        ) || 60;


    const animationOffset =
        Number(
            attacker.stabDistance
        ) || 0;


    /*
     * The renderer moves the weapon
     * forward by stabDistance.
     *
     * The hitbox follows it.
     */

    let reach =
        weaponRange +
        animationOffset;


    /*
     * Never allow negative reach during
     * the pull-back portion.
     */

    reach =
        Math.max(
            10,
            reach
        );


    /*
     * =================================
     * WEAPON-SPECIFIC WIDTH
     * =================================
     */

    let width = 18;


    /*
     * Heavy weapons have a larger
     * impact area.
     */

    if (
        weapon.type === "heavy"
    ) {

        width = 30;
    }


    /*
     * Spear is long but narrow.

     */

    if (
        String(
            weapon.name || ""
        ).toLowerCase() === "spear"
    ) {

        width = 14;
    }


    /*
     * Dagger is short and narrow.

     */

    if (
        String(
            weapon.name || ""
        ).toLowerCase() === "dagger"
    ) {

        width = 16;
    }


    /*
     * Account for target radius.

     */

    width +=
        target.radius;


    /*
     * =================================
     * RANGE CHECK
     * =================================
     */

    if (
        forwardDistance >
        reach
    ) {

        return false;
    }


    /*
     * =================================
     * SIDE CHECK
     * =================================
     */

    if (
        sideDistance >
        width
    ) {

        return false;
    }


    /*
     * =================================
     * VERY CLOSE TARGET
     * =================================
     *
     * Prevent attacks from missing when
     * fighters are directly touching.
     */

    const targetDistance =
        Math.hypot(
            dx,
            dy
        );


    if (
        targetDistance <=
        attacker.radius +
        target.radius +
        8
    ) {

        return true;
    }


    /*
     * =================================
     * FINAL STAB HIT
     * =================================
     */

    return true;
}