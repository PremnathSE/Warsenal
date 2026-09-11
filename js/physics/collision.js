/*
 * WARSENAL
 * Fighter body collision
 *
 * Player and AI cannot overlap or pass through
 * each other.
 *
 * This does NOT cause damage.
 * Weapon damage is handled separately by combat.
 */


/*
 * =================================
 * CIRCLE COLLISION
 * =================================
 */

export function resolveFighterCollision(
    player,
    ai
) {

    if (!player || !ai) {
        return;
    }


    const dx =
        ai.x - player.x;

    const dy =
        ai.y - player.y;


    let distance =
        Math.hypot(
            dx,
            dy
        );


    /*
     * Minimum distance between the
     * centers of the two fighters.
     */

    const minimumDistance =
        player.radius +
        ai.radius;


    /*
     * They are not touching.
     */

    if (
        distance >=
        minimumDistance
    ) {

        return;
    }


    /*
     * Handle exact same-position case.
     */

    if (distance === 0) {

        distance = 0.001;
    }


    /*
     * Amount of overlap.
     */

    const overlap =
        minimumDistance -
        distance;


    /*
     * Normalized direction from
     * player → AI.
     */

    const nx =
        dx / distance;

    const ny =
        dy / distance;


    /*
     * Push both fighters apart equally.
     */

    const push =
        overlap / 2;


    player.x -=
        nx * push;

    player.y -=
        ny * push;


    ai.x +=
        nx * push;

    ai.y +=
        ny * push;
}


/*
 * =================================
 * ARENA BOUNDARY
 * =================================
 *
 * Keeps a fighter inside the arena
 * after body-collision resolution.
 */

export function clampFighter(
    fighter,
    width,
    height
) {

    if (!fighter) {
        return;
    }


    fighter.x =
        Math.max(
            fighter.radius,

            Math.min(
                width -
                    fighter.radius,

                fighter.x
            )
        );


    fighter.y =
        Math.max(
            fighter.radius,

            Math.min(
                height -
                    fighter.radius,

                fighter.y
            )
        );
}