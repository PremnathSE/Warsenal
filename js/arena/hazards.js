/*
 * =================================
 * WARSENAL ARENA HAZARDS
 * =================================
 */

export function createHazards(
    definitions = [],
    width = 0,
    height = 0
) {
    const safeWidth =
        Number(width) > 0
            ? Number(width)
            : 1;

    const safeHeight =
        Number(height) > 0
            ? Number(height)
            : 1;

    return (Array.isArray(definitions)
        ? definitions
        : []
    ).map(definition => {
        if (!definition) {
            return null;
        }

        const x =
            Number(definition.x) || 0;

        const y =
            Number(definition.y) || 0;

        const radius =
            Number(definition.radius) || 0.04;

        return {
            ...definition,

            x:
                x <= 1
                    ? x * safeWidth
                    : x,

            y:
                y <= 1
                    ? y * safeHeight
                    : y,

            radius:
                radius <= 1
                    ? radius *
                      Math.min(
                          safeWidth,
                          safeHeight
                      )
                    : radius,

            damage:
                Number(definition.damage) || 0,

            interval:
                Number(definition.interval) || 0.5,

            timer: 0
        };
    }).filter(Boolean);
}


/*
 * =================================
 * UPDATE HAZARDS
 * =================================
 *
 * Supports both:
 *   updateHazards(hazards, player, ai, dt)
 *   updateHazards(hazards, dt, player, ai)
 */

export function updateHazards(
    hazards = [],
    arg2 = null,
    arg3 = null,
    arg4 = 0
) {
    if (!Array.isArray(hazards)) {
        return;
    }

    let player;
    let ai;
    let dt;

    if (typeof arg2 === "number") {
        dt = arg2;
        player = arg3;
        ai = arg4;
    } else {
        player = arg2;
        ai = arg3;
        dt = arg4;
    }

    const targets = [
        player,
        ai
    ].filter(Boolean);

    for (const hazard of hazards) {
        if (!hazard) {
            continue;
        }

        hazard.timer =
            Math.max(
                0,
                Number(hazard.timer) || 0
            ) +
            Math.max(
                0,
                Number(dt) || 0
            );

        if (
            hazard.timer <
            (Number(hazard.interval) || 0.5)
        ) {
            continue;
        }

        hazard.timer = 0;

        for (const target of targets) {
            const dx =
                target.x -
                hazard.x;

            const dy =
                target.y -
                hazard.y;

            const distance =
                Math.hypot(dx, dy);

            if (
                distance <=
                hazard.radius
            ) {
                target.health =
                    Math.max(
                        0,
                        target.health -
                        (Number(hazard.damage) || 0)
                    );
            }
        }
    }
}
