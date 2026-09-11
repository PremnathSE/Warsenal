import { Player } from "../player/player.js";


/*
 * =================================
 * SMART AI CONTROLLER
 * =================================
 *
 * Weapon-aware positioning:
 *
 * Sword  -> close range
 * Dagger -> very close
 * Hammer -> close / medium
 * Spear  -> medium range
 * Bow    -> long range
 * Staff  -> medium / long range
 *
 * Difficulty:
 *
 * Easy   -> slower, worse aim, less aggressive
 * Normal -> balanced
 * Hard   -> faster, better aim, more aggressive
 */


export class AIController {

    constructor(
        difficulty = "normal"
    ) {

        this.difficulty =
            difficulty;


        /*
         * Movement.
         */

        this.moveTimer = 0;

        this.moveX = 0;
        this.moveY = 0;


        /*
         * Attack.
         */

        this.attackTimer = 0;

        this.attackRequested =
            false;


        /*
         * Strafing.
         */

        this.strafeDirection =
            Math.random() < 0.5
                ? -1
                : 1;

        this.strafeTimer = 0;


        /*
         * Aim error.
         */

        this.aimError = 0;

        /*
         * Threat reaction / dodge cooldown.
         */

        this.reactionTimer = 0;
        this.dodgeTimer = 0;


        this.reset();
    }


    /*
     * =================================
     * DIFFICULTY
     * =================================
     */

    setDifficulty(
        difficulty
    ) {

        const allowed = [
            "easy",
            "normal",
            "hard"
        ];


        if (
            !allowed.includes(
                difficulty
            )
        ) {

            this.difficulty =
                "normal";

        } else {

            this.difficulty =
                difficulty;
        }


        this.reset();
    }


    /*
     * =================================
     * DIFFICULTY SETTINGS
     * =================================
     */

    getDifficultySettings() {

        switch (
            this.difficulty
        ) {

            case "easy":

                return {

                    movementSpeed: 72,

                    aimMin: -0.22,
                    aimMax: 0.22,

                    aimChangeRate: 0.22,

                    moveTimerMin: 0.55,
                    moveTimerMax: 1.10,

                    strafeTimerMin: 1.0,
                    strafeTimerMax: 2.2,

                    attackTimerMin: 0.95,
                    attackTimerMax: 1.70

                };


            case "hard":

                return {

                    movementSpeed: 150,

                    aimMin: -0.035,
                    aimMax: 0.035,

                    aimChangeRate: 0.70,

                    moveTimerMin: 0.15,
                    moveTimerMax: 0.40,

                    strafeTimerMin: 0.45,
                    strafeTimerMax: 1.0,

                    attackTimerMin: 0.18,
                    attackTimerMax: 0.55

                };


            case "normal":

            default:

                return {

                    movementSpeed: 112,

                    aimMin: -0.10,
                    aimMax: 0.10,

                    aimChangeRate: 0.45,

                    moveTimerMin: 0.35,
                    moveTimerMax: 0.80,

                    strafeTimerMin: 0.70,
                    strafeTimerMax: 1.80,

                    attackTimerMin: 0.48,
                    attackTimerMax: 1.15

                };
        }
    }


    /*
     * =================================
     * RESET
     * =================================
     */

    reset() {

        const settings =
            this.getDifficultySettings();

        /*
         * Movement timer.
         */

        this.moveTimer =
            randomBetween(
                settings.moveTimerMin,
                settings.moveTimerMax
            );


        /*
         * Attack timer.
         */

        this.attackTimer =
            randomBetween(
                settings.attackTimerMin,
                settings.attackTimerMax
            );


        /*
         * Strafing timer.
         */

        this.strafeTimer =
            randomBetween(
                settings.strafeTimerMin,
                settings.strafeTimerMax
            );


        /*
         * Random initial strafe.
         */

        this.strafeDirection =
            Math.random() < 0.5
                ? -1
                : 1;


        /*
         * Aim error.
         */

        this.aimError =
            randomBetween(
                settings.aimMin,
                settings.aimMax
            );


        /*
         * Attack request.
         */

        this.attackRequested =
            false;


        /*
         * Movement.

         */

        this.moveX = 0;

        this.moveY = 0;

        this.reactionTimer = 0;
        this.dodgeTimer = 0;
    }


    /*
     * =================================
     * PREFERRED RANGE
     * =================================
     */

    getPreferredRange(
        ai
    ) {

        if (!ai.weapon) {

            return 180;
        }


        const name =
            String(
                ai.weapon.name || ""
            ).toLowerCase();


        if (
            name === "dagger"
        ) {

            return 55;
        }


        if (
            name === "sword"
        ) {

            return 72;
        }


        if (
            name === "hammer"
        ) {

            return 82;
        }


        if (
            name === "spear"
        ) {

            return 105;
        }


        if (
            name === "bow"
        ) {

            return 390;
        }


        if (
            name === "staff"
        ) {

            return 270;
        }


        return 100;
    }


    /*
     * =================================
     * RANGE TOLERANCE
     * =================================
     */

    getRangeTolerance(
        ai
    ) {

        if (!ai.weapon) {

            return 40;
        }


        const name =
            String(
                ai.weapon.name || ""
            ).toLowerCase();


        if (
            name === "dagger"
        ) {

            return 18;
        }


        if (
            name === "sword"
        ) {

            return 28;
        }


        if (
            name === "hammer"
        ) {

            return 30;
        }


        if (
            name === "spear"
        ) {

            return 35;
        }


        if (
            name === "bow"
        ) {

            return 70;
        }


        if (
            name === "staff"
        ) {

            return 60;
        }


        return 40;
    }


    /*
     * =================================
     * IS RANGED
     * =================================
     */

    isRanged(
        ai
    ) {

        if (!ai.weapon) {

            return false;
        }


        return (
            ai.weapon.type ===
            "ranged"
        );
    }


    /*
     * =================================
     * ENVIRONMENT AVOIDANCE
     * =================================
     */

    getEnvironmentAvoidance(
        ai,
        arena,
        targetDistance
    ) {

        let avoidX = 0;
        let avoidY = 0;

        const obstacles =
            Array.isArray(arena?.obstacles)
                ? arena.obstacles
                : [];

        for (
            const obstacle of obstacles
        ) {

            if (
                !obstacle ||
                obstacle.type !== "rectangle"
            ) {
                continue;
            }

            const closestX =
                Math.max(
                    obstacle.x,
                    Math.min(
                        ai.x,
                        obstacle.x + obstacle.width
                    )
                );

            const closestY =
                Math.max(
                    obstacle.y,
                    Math.min(
                        ai.y,
                        obstacle.y + obstacle.height
                    )
                );

            let dx = ai.x - closestX;
            let dy = ai.y - closestY;
            let distance = Math.hypot(dx, dy);

            if (distance < 0.001) {
                dx =
                    ai.x -
                    (obstacle.x + obstacle.width * 0.5);

                dy =
                    ai.y -
                    (obstacle.y + obstacle.height * 0.5);

                distance = Math.hypot(dx, dy);
            }

            const safeDistance =
                ai.radius + 42;

            if (distance < safeDistance) {

                const strength =
                    (safeDistance - distance) /
                    safeDistance;

                avoidX +=
                    (dx / Math.max(distance, 0.001)) *
                    strength *
                    1.7;

                avoidY +=
                    (dy / Math.max(distance, 0.001)) *
                    strength *
                    1.7;
            }
        }

        const hazards =
            Array.isArray(arena?.hazards)
                ? arena.hazards
                : [];

        for (
            const hazard of hazards
        ) {

            if (
                !hazard ||
                hazard.type !== "fire"
            ) {
                continue;
            }

            const dx =
                ai.x - hazard.x;

            const dy =
                ai.y - hazard.y;

            const distance =
                Math.hypot(dx, dy);

            const safeDistance =
                hazard.radius + 70;

            if (
                distance < safeDistance
            ) {

                const strength =
                    (safeDistance - distance) /
                    safeDistance;

                avoidX +=
                    (dx / Math.max(distance, 0.001)) *
                    strength *
                    2.2;

                avoidY +=
                    (dy / Math.max(distance, 0.001)) *
                    strength *
                    2.2;
            }
        }

        /*
         * At very long range, avoidances are
         * slightly softened so the AI still
         * pursues the opponent decisively.
         */

        const longRangeFactor =
            targetDistance > 500
                ? 0.70
                : 1;

        return {
            x: avoidX * longRangeFactor,
            y: avoidY * longRangeFactor
        };
    }




    /*
     * =================================
     * NAVIGATION AROUND OBSTACLES
     * =================================
     *
     * Repulsion alone is not enough when an
     * obstacle sits directly between the AI and
     * its target. In that situation the AI can keep
     * pushing into the same wall forever.
     *
     * Build a tiny visibility graph from the AI,
     * target, and expanded obstacle corners. The
     * first waypoint on the shortest visible route
     * becomes the temporary movement target.
     */

    isPathClear(
        fromX,
        fromY,
        toX,
        toY,
        obstacles,
        clearance = 0
    ) {
        const dx = toX - fromX;
        const dy = toY - fromY;
        const lengthSquared =
            dx * dx + dy * dy;

        for (const obstacle of obstacles) {
            if (
                !obstacle ||
                obstacle.type !== "rectangle"
            ) {
                continue;
            }

            const left =
                obstacle.x - clearance;
            const right =
                obstacle.x +
                obstacle.width +
                clearance;
            const top =
                obstacle.y - clearance;
            const bottom =
                obstacle.y +
                obstacle.height +
                clearance;

            if (this.segmentIntersectsRect(
                fromX,
                fromY,
                toX,
                toY,
                left,
                top,
                right,
                bottom
            )) {
                return false;
            }
        }

        return true;
    }


    segmentIntersectsRect(
        x1,
        y1,
        x2,
        y2,
        left,
        top,
        right,
        bottom
    ) {
        const dx = x2 - x1;
        const dy = y2 - y1;

        if (
            x1 >= left &&
            x1 <= right &&
            y1 >= top &&
            y1 <= bottom
        ) {
            return true;
        }

        if (
            x2 >= left &&
            x2 <= right &&
            y2 >= top &&
            y2 <= bottom
        ) {
            return true;
        }

        let tMin = 0;
        let tMax = 1;

        if (Math.abs(dx) < 0.000001) {
            if (x1 < left || x1 > right) {
                return false;
            }
        } else {
            const tx1 = (left - x1) / dx;
            const tx2 = (right - x1) / dx;
            tMin = Math.max(
                tMin,
                Math.min(tx1, tx2)
            );
            tMax = Math.min(
                tMax,
                Math.max(tx1, tx2)
            );
        }

        if (Math.abs(dy) < 0.000001) {
            if (y1 < top || y1 > bottom) {
                return false;
            }
        } else {
            const ty1 = (top - y1) / dy;
            const ty2 = (bottom - y1) / dy;
            tMin = Math.max(
                tMin,
                Math.min(ty1, ty2)
            );
            tMax = Math.min(
                tMax,
                Math.max(ty1, ty2)
            );
        }

        return tMin <= tMax;
    }


    getNavigationTarget(
        ai,
        target,
        arena
    ) {
        const obstacles =
            Array.isArray(arena?.obstacles)
                ? arena.obstacles.filter(
                    obstacle =>
                        obstacle &&
                        obstacle.type === "rectangle"
                )
                : [];

        const hazards =
            Array.isArray(arena?.hazards)
                ? arena.hazards.filter(
                    hazard =>
                        hazard &&
                        hazard.type === "fire"
                )
                : [];

        if (!obstacles.length && !hazards.length) {
            return {
                x: target.x,
                y: target.y
            };
        }

        const radius =
            Number(ai.radius) || 16;

        /*
         * Give the AI a real amount of space around
         * walls and fire.  The old corner graph used
         * points directly on the collision boundary,
         * which could still be pushed back by the
         * game's collision resolver.
         */
        const obstacleClearance =
            radius + 24;

        const hazardClearance =
            radius + 46;

        /*
         * If the direct route is safe, don't make the
         * AI take a silly detour.
         */
        if (
            this.isNavigationSegmentClear(
                ai.x,
                ai.y,
                target.x,
                target.y,
                obstacles,
                hazards,
                obstacleClearance,
                hazardClearance
            )
        ) {
            return {
                x: target.x,
                y: target.y
            };
        }

        const points = [
            {
                x: ai.x,
                y: ai.y
            },
            {
                x: target.x,
                y: target.y
            }
        ];

        /*
         * Obstacle corner waypoints.
         *
         * Offset well outside the actual obstacle so
         * that movement + collision resolution cannot
         * trap the AI on the corner.
         */
        for (const obstacle of obstacles) {
            const left =
                obstacle.x - obstacleClearance;
            const right =
                obstacle.x +
                obstacle.width +
                obstacleClearance;
            const top =
                obstacle.y - obstacleClearance;
            const bottom =
                obstacle.y +
                obstacle.height +
                obstacleClearance;

            points.push(
                { x: left, y: top },
                { x: right, y: top },
                { x: right, y: bottom },
                { x: left, y: bottom }
            );
        }

        /*
         * Fire waypoints.  These create an actual route
         * around Inferno hazards instead of relying only
         * on local repulsion after the AI is already near
         * the fire.
         */
        for (const hazard of hazards) {
            const safeRadius =
                Math.max(
                    20,
                    Number(hazard.radius) || 0
                ) +
                hazardClearance;

            const waypointCount = 8;

            for (let i = 0; i < waypointCount; i++) {
                const angle =
                    (Math.PI * 2 * i) /
                    waypointCount;

                points.push({
                    x:
                        hazard.x +
                        Math.cos(angle) * safeRadius,
                    y:
                        hazard.y +
                        Math.sin(angle) * safeRadius
                });
            }
        }

        /*
         * Keep navigation points inside the arena.
         */
        const width =
            Number(arena?.width) > 0
                ? Number(arena.width)
                : Infinity;

        const height =
            Number(arena?.height) > 0
                ? Number(arena.height)
                : Infinity;

        for (const point of points) {
            if (Number.isFinite(width)) {
                point.x = Math.max(
                    radius,
                    Math.min(
                        width - radius,
                        point.x
                    )
                );
            }

            if (Number.isFinite(height)) {
                point.y = Math.max(
                    radius,
                    Math.min(
                        height - radius,
                        point.y
                    )
                );
            }
        }

        const count = points.length;
        const distances =
            Array.from(
                { length: count },
                () => Infinity
            );
        const previous =
            Array.from(
                { length: count },
                () => -1
            );
        const visited =
            Array(count).fill(false);

        distances[0] = 0;

        /*
         * Dijkstra visibility graph.
         * Every usable edge must avoid BOTH walls and
         * fire, so the AI cannot select a mathematically
         * short route straight through Inferno.
         */
        for (let step = 0; step < count; step++) {
            let current = -1;
            let bestDistance = Infinity;

            for (let i = 0; i < count; i++) {
                if (
                    !visited[i] &&
                    distances[i] < bestDistance
                ) {
                    current = i;
                    bestDistance = distances[i];
                }
            }

            if (current < 0) {
                break;
            }

            visited[current] = true;

            if (current === 1) {
                break;
            }

            for (let next = 0; next < count; next++) {
                if (
                    visited[next] ||
                    next === current
                ) {
                    continue;
                }

                if (
                    !this.isNavigationSegmentClear(
                        points[current].x,
                        points[current].y,
                        points[next].x,
                        points[next].y,
                        obstacles,
                        hazards,
                        0,
                        0
                    )
                ) {
                    continue;
                }

                const edgeDistance =
                    Math.hypot(
                        points[next].x - points[current].x,
                        points[next].y - points[current].y
                    );

                const candidate =
                    distances[current] +
                    edgeDistance;

                if (
                    candidate <
                    distances[next]
                ) {
                    distances[next] = candidate;
                    previous[next] = current;
                }
            }
        }

        /*
         * If no graph route exists, prefer the safest
         * nearby point rather than walking through the
         * obstacle/fire toward the player.
         */
        if (!Number.isFinite(distances[1])) {
            let safest = null;
            let safestScore = Infinity;

            for (let i = 2; i < points.length; i++) {
                if (
                    !this.isNavigationPointSafe(
                        points[i].x,
                        points[i].y,
                        obstacles,
                        hazards,
                        obstacleClearance,
                        hazardClearance
                    )
                ) {
                    continue;
                }

                const score =
                    Math.hypot(
                        points[i].x - target.x,
                        points[i].y - target.y
                    ) +
                    Math.hypot(
                        points[i].x - ai.x,
                        points[i].y - ai.y
                    ) * 0.25;

                if (score < safestScore) {
                    safestScore = score;
                    safest = points[i];
                }
            }

            return safest || {
                x: target.x,
                y: target.y
            };
        }

        const route = [];
        let node = 1;

        while (node >= 0) {
            route.push(node);
            node = previous[node];
        }

        route.reverse();

        const waypointIndex =
            route.length > 1
                ? route[1]
                : 1;

        return points[waypointIndex];
    }


    isNavigationPointSafe(
        x,
        y,
        obstacles,
        hazards,
        obstacleClearance = 0,
        hazardClearance = 0
    ) {
        for (const obstacle of obstacles) {
            if (
                x >= obstacle.x - obstacleClearance &&
                x <= obstacle.x + obstacle.width + obstacleClearance &&
                y >= obstacle.y - obstacleClearance &&
                y <= obstacle.y + obstacle.height + obstacleClearance
            ) {
                return false;
            }
        }

        for (const hazard of hazards) {
            const safeRadius =
                Math.max(
                    20,
                    Number(hazard.radius) || 0
                ) +
                hazardClearance;

            if (
                Math.hypot(
                    x - hazard.x,
                    y - hazard.y
                ) < safeRadius
            ) {
                return false;
            }
        }

        return true;
    }


    isNavigationSegmentClear(
        fromX,
        fromY,
        toX,
        toY,
        obstacles,
        hazards,
        obstacleClearance = 0,
        hazardClearance = 0
    ) {
        for (const obstacle of obstacles) {
            const left =
                obstacle.x - obstacleClearance;
            const right =
                obstacle.x +
                obstacle.width +
                obstacleClearance;
            const top =
                obstacle.y - obstacleClearance;
            const bottom =
                obstacle.y +
                obstacle.height +
                obstacleClearance;

            if (
                this.segmentIntersectsRect(
                    fromX,
                    fromY,
                    toX,
                    toY,
                    left,
                    top,
                    right,
                    bottom
                )
            ) {
                return false;
            }
        }

        for (const hazard of hazards) {
            const safeRadius =
                Math.max(
                    20,
                    Number(hazard.radius) || 0
                ) +
                hazardClearance;

            if (
                this.segmentIntersectsCircle(
                    fromX,
                    fromY,
                    toX,
                    toY,
                    hazard.x,
                    hazard.y,
                    safeRadius
                )
            ) {
                return false;
            }
        }

        return true;
    }


    segmentIntersectsCircle(
        x1,
        y1,
        x2,
        y2,
        cx,
        cy,
        radius
    ) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared =
            dx * dx +
            dy * dy;

        if (lengthSquared <= 0.000001) {
            return (
                Math.hypot(
                    x1 - cx,
                    y1 - cy
                ) <= radius
            );
        }

        const t = Math.max(
            0,
            Math.min(
                1,
                (
                    (cx - x1) * dx +
                    (cy - y1) * dy
                ) /
                lengthSquared
            )
        );

        const closestX =
            x1 + dx * t;
        const closestY =
            y1 + dy * t;

        return (
            Math.hypot(
                closestX - cx,
                closestY - cy
            ) <= radius
        );
    }


    /*
     * =================================
     * PROJECTILE DANGER
     * =================================
     *
     * Detect incoming enemy projectiles and
     * return a lateral dodge vector.
     */

    getProjectileDodge(
        ai,
        projectiles
    ) {

        if (!Array.isArray(projectiles)) {
            return {
                x: 0,
                y: 0,
                strength: 0
            };
        }

        const difficulty =
            this.difficulty;

        const detectionDistance =
            difficulty === "hard"
                ? 250
                : difficulty === "normal"
                    ? 170
                    : 100;

        const dangerRadius =
            difficulty === "hard"
                ? 40
                : difficulty === "normal"
                    ? 34
                    : 28;

        const dodgeStrength =
            difficulty === "hard"
                ? 2.8
                : difficulty === "normal"
                    ? 2.1
                    : 1.4;

        let best = null;

        for (const projectile of projectiles) {

            if (!projectile || projectile.alive === false) {
                continue;
            }

            if (projectile.owner === ai) {
                continue;
            }

            const dx =
                ai.x - projectile.x;

            const dy =
                ai.y - projectile.y;

            const distance =
                Math.hypot(dx, dy);

            if (distance <= 0.001 || distance > detectionDistance) {
                continue;
            }

            const vx = Math.cos(projectile.angle || 0);
            const vy = Math.sin(projectile.angle || 0);

            const along =
                dx * vx +
                dy * vy;

            if (along < 0 || along > detectionDistance) {
                continue;
            }

            const perpendicular =
                Math.abs(dx * vy - dy * vx);

            const targetRadius =
                ai.radius +
                (Number(projectile.radius) || 6) +
                dangerRadius;

            if (perpendicular > targetRadius) {
                continue;
            }

            const urgency =
                1 -
                Math.min(1, along / detectionDistance);

            if (!best || urgency > best.urgency) {
                best = {
                    vx,
                    vy,
                    urgency
                };
            }
        }

        if (!best) {
            return {
                x: 0,
                y: 0,
                strength: 0
            };
        }

        let dodgeX =
            -best.vy *
            this.strafeDirection;

        let dodgeY =
            best.vx *
            this.strafeDirection;

        /*
         * Add a small forward component so a melee AI
         * keeps closing on a ranged target while dodging.
         */
        if (ai.weapon && !this.isRanged(ai)) {
            dodgeX += best.vx * 0.20;
            dodgeY += best.vy * 0.20;
        }

        return {
            x: dodgeX,
            y: dodgeY,
            strength:
                best.urgency *
                dodgeStrength
        };
    }


    /*
     * =================================
     * MELEE THREAT
     * =================================
     * React to an opponent who has started a melee attack.
     */

    getMeleeThreat(
        ai,
        target,
        distance
    ) {

        if (!target || !target.weapon || !target.isAttacking) {
            return { x: 0, y: 0, strength: 0 };
        }

        if (target.weapon.type !== "melee" && target.weapon.type !== "heavy") {
            return { x: 0, y: 0, strength: 0 };
        }

        const attackRange =
            (Number(target.weapon.range) || 70) +
            ai.radius +
            target.radius +
            28;

        if (distance > attackRange) {
            return { x: 0, y: 0, strength: 0 };
        }

        const dx = target.x - ai.x;
        const dy = target.y - ai.y;
        const len = Math.hypot(dx, dy) || 1;

        const towardX = dx / len;
        const towardY = dy / len;

        const side = this.strafeDirection;

        return {
            x: -towardY * side,
            y: towardX * side,
            strength: this.difficulty === "hard" ? 2.6 : this.difficulty === "normal" ? 1.7 : 0.9
        };
    }


    /*
     * =================================
     * UPDATE
     * =================================
     */

    update(
        ai,
        target,
        dt,
        width,
        height,
        arena = null,
        projectiles = []
    ) {

        /*
         * Never leave an old attack
         * request behind.
         */

        this.attackRequested =
            false;


        if (!target) {

            return;
        }


        const settings =
            this.getDifficultySettings();


        /*
         * =================================
         * DISTANCE
         * =================================
         */

        const dx =
            target.x -
            ai.x;


        const dy =
            target.y -
            ai.y;


        const distance =
            Math.hypot(
                dx,
                dy
            );


        const aiIsRanged =
            this.isRanged(ai);

        const targetIsRanged =
            Boolean(
                target.weapon &&
                target.weapon.type === "ranged"
            );

        const antiRangedRush =
            !aiIsRanged &&
            targetIsRanged;


        /*
         * =================================
         * AIM
         * =================================
         */

        if (
            !ai.isAttacking
        ) {

            const targetAngle =
                Math.atan2(
                    dy,
                    dx
                );


            ai.angle =
                targetAngle +
                this.aimError;
        }


        /*
         * =================================
         * AIM ERROR
         * =================================
         *
         * Easy:
         *   aim error changes slowly.
         *
         * Hard:
         *   aim error is smaller and
         *   changes more frequently.
         */

        if (
            !ai.isAttacking
        ) {

            if (
                Math.random() <
                dt *
                settings.aimChangeRate
            ) {

                this.aimError =
                    randomBetween(
                        settings.aimMin,
                        settings.aimMax
                    );
            }
        }


        /*
         * =================================
         * STRAFE TIMER
         * =================================
         */

        this.strafeTimer -= dt;


        if (
            this.strafeTimer <= 0
        ) {

            this.strafeTimer =
                randomBetween(
                    settings.strafeTimerMin,
                    settings.strafeTimerMax
                );


            this.strafeDirection *=
                -1;
        }


        /*
         * =================================
         * PREFERRED RANGE
         * =================================
         */

        const preferredRange =
            this.getPreferredRange(
                ai
            );


        const tolerance =
            this.getRangeTolerance(
                ai
            );


        /*
         * =================================
         * MOVEMENT VECTOR
         * =================================
         */

        let moveX = 0;
        let moveY = 0;


        /*
         * Incoming projectile avoidance.
         */

        const projectileDodge =
            this.getProjectileDodge(
                ai,
                projectiles
            );

        const meleeThreat =
            this.getMeleeThreat(
                ai,
                target,
                distance
            );

        if (projectileDodge.strength > 0) {
            moveX +=
                projectileDodge.x *
                projectileDodge.strength;

            moveY +=
                projectileDodge.y *
                projectileDodge.strength;
        }

        if (meleeThreat.strength > 0) {
            moveX += meleeThreat.x * meleeThreat.strength;
            moveY += meleeThreat.y * meleeThreat.strength;

            if (this.reactionTimer <= 0) {
                this.reactionTimer = this.difficulty === "hard" ? 0.18 : this.difficulty === "normal" ? 0.30 : 0.48;
            }
        }


        /*
         * Navigation target.
         *
         * If a wall blocks the direct route, use
         * the first waypoint around the obstacle
         * instead of repeatedly walking into it.
         */
        const navigationTarget =
            this.getNavigationTarget(
                ai,
                target,
                arena
            );

        const navigationDX =
            navigationTarget.x - ai.x;

        const navigationDY =
            navigationTarget.y - ai.y;

        const navigationDistance =
            Math.hypot(
                navigationDX,
                navigationDY
            );

        let towardX = 0;
        let towardY = 0;


        if (
            navigationDistance > 0.001
        ) {

            towardX =
                navigationDX / navigationDistance;

            towardY =
                navigationDY / navigationDistance;
        }


        /*
         * Perpendicular vector.
         *
         * Used for strafing.
         */

        const strafeX =
            -towardY *
            this.strafeDirection;


        const strafeY =
            towardX *
            this.strafeDirection;


        /*
         * =================================
         * TOO FAR
         * =================================
         */

        if (
            distance >
            preferredRange +
            tolerance
        ) {

            moveX =
                towardX;

            moveY =
                towardY;

            const strafeAmount =
                antiRangedRush
                    ? 0.12
                    : 0.35;

            moveX +=
                strafeX *
                strafeAmount;

            moveY +=
                strafeY *
                strafeAmount;
        }


        /*
         * =================================
         * TOO CLOSE
         * =================================
         */

        else if (
            distance <
            preferredRange -
            tolerance
        ) {

            moveX =
                -towardX;

            moveY =
                -towardY;


            if (
                this.isRanged(ai)
            ) {

                moveX +=
                    strafeX *
                    0.25;

                moveY +=
                    strafeY *
                    0.25;
            }
        }


        /*
         * =================================
         * IDEAL RANGE
         * =================================
         */

        else {

            if (antiRangedRush) {

                moveX =
                    towardX * 0.90 +
                    strafeX * 0.10;

                moveY =
                    towardY * 0.90 +
                    strafeY * 0.10;

            } else {

                moveX =
                    strafeX;

                moveY =
                    strafeY;
            }
        }


        /*
         * =================================
         * ENVIRONMENT AVOIDANCE
         * =================================
         *
         * Steer around nearby obstacles and
         * fire zones instead of walking into
         * them and relying only on collision
         * resolution.
         */

        if (arena) {

            const avoidance =
                this.getEnvironmentAvoidance(
                    ai,
                    arena,
                    distance
                );

            moveX += avoidance.x;
            moveY += avoidance.y;
        }


        /*
         * =================================
         * NORMALIZE
         * =================================
         */

        const movementLength =
            Math.hypot(
                moveX,
                moveY
            );


        if (
            movementLength > 0
        ) {

            moveX /=
                movementLength;

            moveY /=
                movementLength;
        }


        /*
         * =================================
         * MOVEMENT SPEED
         * =================================
         */

        let speed =
            settings.movementSpeed;


        /*
         * Dagger gets aggressive movement.
         */

        if (
            ai.weapon &&
            String(
                ai.weapon.name || ""
            ).toLowerCase() ===
            "dagger"
        ) {

            speed *=
                1.12;
        }


        /*
         * Ranged weapons move more
         * deliberately.
         */

        if (
            this.isRanged(ai)
        ) {

            speed *=
                0.96;
        }


        /*
         * Melee rush against a ranged target.
         */

        if (antiRangedRush) {

            const rushMultiplier =
                this.difficulty === "hard"
                    ? 1.42
                    : this.difficulty === "normal"
                        ? 1.28
                        : 1.14;

            speed *=
                rushMultiplier;
        }


        /*
         * Ranged firing commitment.
         * Applies equally to AI and player.
         */

        if (
            ai.rangedCommitTimer > 0
        ) {

            speed *=
                0.65;
        }


        /*
         * =================================
         * HARD PRESSURE
         * =================================
         */

        if (this.difficulty === "hard" && !aiIsRanged) {
            if (distance > preferredRange) {
                speed *= 1.10;
            }
        }


        /*
         * =================================
         * MOVEMENT TIMER
         * =================================
         */

        this.moveTimer -= dt;


        if (
            this.moveTimer <= 0
        ) {

            this.moveTimer =
                randomBetween(
                    settings.moveTimerMin,
                    settings.moveTimerMax
                );
        }


        /*
         * =================================
         * APPLY MOVEMENT
         * =================================
         *
         * Don't move while attacking.
         */

        if (
            !ai.isAttacking
        ) {

            ai.x +=
                moveX *
                speed *
                dt;

            ai.y +=
                moveY *
                speed *
                dt;
        }


        /*
         * =================================
         * ARENA BOUNDARIES
         * =================================
         */

        ai.x =
            Math.max(
                ai.radius,

                Math.min(
                    width -
                    ai.radius,

                    ai.x
                )
            );


        ai.y =
            Math.max(
                ai.radius,

                Math.min(
                    height -
                    ai.radius,

                    ai.y
                )
            );


        /*
         * =================================
         * ATTACK TIMER
         * =================================
         */

        this.attackTimer -= dt;


        if (
            this.attackTimer <= 0
        ) {

            const weaponDelay =
                this.getAttackDelay(
                    ai
                );

            if (antiRangedRush) {

                const rushAttackMultiplier =
                    this.difficulty === "hard"
                        ? 0.68
                        : this.difficulty === "normal"
                            ? 0.78
                            : 0.90;

                weaponDelay.min *=
                    rushAttackMultiplier;

                weaponDelay.max *=
                    rushAttackMultiplier;
            }


            this.attackTimer =
                randomBetween(
                    weaponDelay.min,
                    weaponDelay.max
                );


            /*
             * Check attack.
             */

            if (
                ai.weapon &&
                !ai.isAttacking &&
                ai.weapon.canAttack()
            ) {

                /*
                 * Melee.
                 */

                if (
                    !this.isRanged(ai)
                ) {

                    if (
                        distance <=
                        ai.weapon.range +
                        target.radius +
                        20
                    ) {

                        this.attackRequested =
                            true;
                    }
                }


                /*
                 * Ranged.
                 */

                else {

                    if (
                        distance <=
                        ai.weapon.range
                    ) {

                        this.attackRequested =
                            true;
                    }
                }
            }
        }
    }


    /*
     * =================================
     * ATTACK DELAY
     * =================================
     */

    getAttackDelay(
        ai
    ) {

        const difficulty =
            this.getDifficultySettings();


        let delay;


        if (!ai.weapon) {

            delay = {

                min: 1.2,
                max: 2.5

            };

        } else {

            const name =
                String(
                    ai.weapon.name || ""
                ).toLowerCase();


            if (
                name === "dagger"
            ) {

                delay = {

                    min: 0.45,
                    max: 1.0

                };

            } else if (
                name === "sword"
            ) {

                delay = {

                    min: 0.65,
                    max: 1.35

                };

            } else if (
                name === "hammer"
            ) {

                delay = {

                    min: 1.0,
                    max: 1.8

                };

            } else if (
                name === "spear"
            ) {

                delay = {

                    min: 0.75,
                    max: 1.45

                };

            } else if (
                name === "bow"
            ) {

                delay = {

                    min: 0.65,
                    max: 1.25

                };

            } else if (
                name === "staff"
            ) {

                delay = {

                    min: 0.8,
                    max: 1.5

                };

            } else {

                delay = {

                    min: 0.8,
                    max: 1.6

                };
            }
        }


        /*
         * Difficulty attack modifier.
         *
         * Easy  -> slower
         * Hard  -> faster
         */

        if (
            this.difficulty ===
            "easy"
        ) {

            delay.min *=
                1.35;

            delay.max *=
                1.35;

        } else if (
            this.difficulty ===
            "hard"
        ) {

            delay.min *=
                0.72;

            delay.max *=
                0.72;
        }


        return delay;
    }


    /*
     * =================================
     * CONSUME ATTACK
     * =================================
     */

    consumeAttack() {

        const value =
            this.attackRequested;


        this.attackRequested =
            false;


        return value;
    }
}


/*
 * =================================
 * AI PLAYER
 * =================================
 */

export class AI extends Player {

    constructor(
        x,
        y,
        difficulty = "normal"
    ) {

        super(
            x,
            y,
            "ai"
        );


        this.controller =
            new AIController(
                difficulty
            );
    }


    /*
     * =================================
     * DIFFICULTY
     * =================================
 */

    setDifficulty(
        difficulty
    ) {

        this.controller
            .setDifficulty(
                difficulty
            );
    }


    /*
     * =================================
     * GET DIFFICULTY
     * =================================
 */

    getDifficulty() {

        return this.controller
            .difficulty;
    }


    /*
     * =================================
     * WEAPON SELECTION
     * =================================
     *
     * Choose a weapon based on the
     * opening distance.
     */

    chooseWeapon(
        openingDistance = 500
    ) {

        /*
         * Close combat.
         */

        if (
            openingDistance < 180
        ) {

            const weapons = [

                "dagger",
                "sword",
                "hammer"

            ];


            return randomChoice(
                weapons
            );
        }


        /*
         * Medium distance.
         */

        if (
            openingDistance < 400
        ) {

            const weapons = [

                "sword",
                "spear",
                "hammer",
                "staff"

            ];


            return randomChoice(
                weapons
            );
        }


        /*
         * Long distance.
         */

        const weapons = [

            "bow",
            "staff",
            "spear"

        ];


        return randomChoice(
            weapons
        );
    }


    /*
     * =================================
     * RESET
     * =================================
     */

    reset(
        x,
        y
    ) {

        super.reset(
            x,
            y
        );


        this.controller.reset();
    }


    /*
     * =================================
     * MELEE THREAT
     * =================================
     * React to an opponent who has started a melee attack.
     */

    getMeleeThreat(
        ai,
        target,
        distance
    ) {

        if (!target || !target.weapon || !target.isAttacking) {
            return { x: 0, y: 0, strength: 0 };
        }

        if (target.weapon.type !== "melee" && target.weapon.type !== "heavy") {
            return { x: 0, y: 0, strength: 0 };
        }

        const attackRange =
            (Number(target.weapon.range) || 70) +
            ai.radius +
            target.radius +
            28;

        if (distance > attackRange) {
            return { x: 0, y: 0, strength: 0 };
        }

        const dx = target.x - ai.x;
        const dy = target.y - ai.y;
        const len = Math.hypot(dx, dy) || 1;

        const towardX = dx / len;
        const towardY = dy / len;

        const side = this.strafeDirection;

        return {
            x: -towardY * side,
            y: towardX * side,
            strength: this.difficulty === "hard" ? 2.6 : this.difficulty === "normal" ? 1.7 : 0.9
        };
    }


    /*
     * =================================
     * UPDATE
     * =================================
     */

    update(
        target,
        dt,
        width,
        height,
        arena = null,
        projectiles = []
    ) {

        this.controller.update(
            this,
            target,
            dt,
            width,
            height,
            arena,
            projectiles
        );
    }


    /*
     * =================================
     * ATTACK
     * =================================
     */

    consumeAttack() {

        return this.controller
            .consumeAttack();
    }
}


/*
 * =================================
 * RANDOM NUMBER
 * =================================
 */

function randomBetween(
    min,
    max
) {

    return (
        min +
        Math.random() *
        (
            max -
            min
        )
    );
}


/*
 * =================================
 * RANDOM CHOICE
 * =================================
 */

function randomChoice(
    array
) {

    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];
}