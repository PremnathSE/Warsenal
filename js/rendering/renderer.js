import {
    drawDamageEffects
} from "./effects.js";


export class Renderer {

    constructor(canvas) {

        this.canvas = canvas;

        this.ctx =
            canvas.getContext("2d");

        this.resize();

        addEventListener(
            "resize",
            () => this.resize()
        );
    }


    resize() {

        const d =
            Math.min(
                devicePixelRatio || 1,
                2
            );

        this.width = innerWidth;
        this.height = innerHeight;

        this.canvas.width =
            this.width * d;

        this.canvas.height =
            this.height * d;

        this.canvas.style.width =
            this.width + "px";

        this.canvas.style.height =
            this.height + "px";

        this.ctx.setTransform(
            d,
            0,
            0,
            d,
            0,
            0
        );
    }


    draw(
        player,
        enemy,
        projectiles = [],
        obstacles = [],
        hazards = [],
        showCombat = true
    ) {

        const c = this.ctx;

        c.clearRect(
            0,
            0,
            this.width,
            this.height
        );


        /*
         * =================================
         * BACKGROUND
         * =================================
         */

        c.fillStyle =
            "#071015";

        c.fillRect(
            0,
            0,
            this.width,
            this.height
        );


        /*
         * =================================
         * GRID
         * =================================
         */

        c.strokeStyle =
            "#102027";

        c.lineWidth = 1;

        for (
            let x = 0;
            x <= this.width;
            x += 48
        ) {

            c.beginPath();

            c.moveTo(
                x,
                0
            );

            c.lineTo(
                x,
                this.height
            );

            c.stroke();
        }


        for (
            let y = 0;
            y <= this.height;
            y += 48
        ) {

            c.beginPath();

            c.moveTo(
                0,
                y
            );

            c.lineTo(
                this.width,
                y
            );

            c.stroke();
        }


        /*
         * =================================
         * BORDER
         * =================================
         */

        c.strokeStyle =
            "#263840";

        c.lineWidth = 2;

        c.strokeRect(
            2,
            2,
            this.width - 4,
            this.height - 4
        );


        if (!showCombat) {
            return;
        }


        /*
         * =================================
         * ARENA HAZARDS
         * =================================
         */

        for (
            const hazard of Array.isArray(hazards)
                ? hazards
                : []
        ) {

            this.hazard(hazard);
        }


        /*
         * =================================
         * ARENA OBSTACLES
         * =================================
         */

        for (
            const obstacle of Array.isArray(obstacles)
                ? obstacles
                : []
        ) {

            this.obstacle(obstacle);
        }


        /*
         * =================================
         * PROJECTILES FIRST
         * =================================
         */

        for (
            const projectile of projectiles
        ) {

            this.projectile(
                projectile
            );
        }


        /*
         * =================================
         * FIGHTERS
         * =================================
         */

        this.fighter(
            enemy,
            "#ff536d",
            "AI"
        );

        this.drawHealthBar(enemy, "CPU", "#ff536d");

        this.fighter(
            player,
            "#6fffe9",
            "YOU"
        );

        this.drawHealthBar(player, "PLAYER", "#6fffe9");
    }

    /*
     * =================================
     * HAZARD
     * =================================
     */

    hazard(
        hazard
    ) {

        if (!hazard) {
            return;
        }

        const c = this.ctx;

        const x = Number(hazard.x) || 0;
        const y = Number(hazard.y) || 0;
        const radius =
            Math.max(
                1,
                Number(hazard.radius) || 0
            );

        const type =
            String(hazard.type || "fire")
                .toLowerCase();

        c.save();

        /*
         * Inferno hazards are drawn as layered
         * fire zones so they remain visible
         * without hiding the fighters.
         */

        if (type === "fire") {

            c.globalAlpha = 0.16;
            c.fillStyle = "#ff4b1f";

            c.beginPath();
            c.arc(
                x,
                y,
                radius * 1.55,
                0,
                Math.PI * 2
            );
            c.fill();

            c.globalAlpha = 0.28;
            c.fillStyle = "#ff7a18";

            c.beginPath();
            c.arc(
                x,
                y,
                radius * 1.12,
                0,
                Math.PI * 2
            );
            c.fill();

            c.globalAlpha = 0.95;
            c.strokeStyle = "#ff9f1c";
            c.lineWidth = 2;

            c.beginPath();
            c.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );
            c.stroke();

            c.globalAlpha = 0.9;
            c.fillStyle = "#ff3b18";

            const flameCount = 8;

            for (let i = 0; i < flameCount; i++) {

                const angle =
                    (Math.PI * 2 * i) / flameCount;

                const wobble =
                    Math.sin(
                        performance.now() * 0.006 + i * 1.7
                    ) *
                    radius * 0.16;

                const fx =
                    x +
                    Math.cos(angle) *
                    (radius * 0.72 + wobble);

                const fy =
                    y +
                    Math.sin(angle) *
                    (radius * 0.72 + wobble);

                c.beginPath();
                c.arc(
                    fx,
                    fy,
                    Math.max(2, radius * 0.18),
                    0,
                    Math.PI * 2
                );
                c.fill();
            }

            c.globalAlpha = 1;
            c.fillStyle = "#ffd166";

            c.beginPath();
            c.arc(
                x,
                y,
                Math.max(2, radius * 0.28),
                0,
                Math.PI * 2
            );
            c.fill();

        } else {

            c.globalAlpha = 0.25;
            c.fillStyle = "#ff536d";

            c.beginPath();
            c.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );
            c.fill();

            c.globalAlpha = 0.9;
            c.strokeStyle = "#ff536d";
            c.lineWidth = 2;
            c.stroke();
        }

        c.restore();
    }


    /*
     * =================================
     * ARENA OBSTACLE
     * =================================
     */

    obstacle(obstacle) {

        if (!obstacle) return;

        const c = this.ctx;

        const x = Number(obstacle.x) || 0;
        const y = Number(obstacle.y) || 0;
        const width = Number(obstacle.width) || Number(obstacle.w) || 40;
        const height = Number(obstacle.height) || Number(obstacle.h) || 40;

        c.save();

        c.fillStyle = "#18282f";
        c.strokeStyle = "#6fffe9";
        c.lineWidth = 2;

        c.fillRect(x, y, width, height);
        c.strokeRect(x, y, width, height);

        c.strokeStyle = "#31464e";
        c.lineWidth = 1;
        c.strokeRect(
            x + 5,
            y + 5,
            Math.max(0, width - 10),
            Math.max(0, height - 10)
        );

        c.restore();
    }


    /*
     * =================================
     * ARENA HAZARD
     * =================================
     */

    hazard(hazard) {

        if (!hazard) return;

        const c = this.ctx;

        const x = Number(hazard.x) || 0;
        const y = Number(hazard.y) || 0;
        const radius = Math.max(4, Number(hazard.radius) || 20);

        if (String(hazard.type || "fire").toLowerCase() !== "fire") {
            return;
        }

        const pulse =
            0.88 +
            Math.sin(performance.now() * 0.008 + x + y) * 0.12;

        c.save();

        c.globalAlpha = 0.18 * pulse;
        c.fillStyle = "#ff3b18";
        c.beginPath();
        c.arc(x, y, radius * 1.9, 0, Math.PI * 2);
        c.fill();

        c.globalAlpha = 0.35 * pulse;
        c.fillStyle = "#ff6a18";
        c.beginPath();
        c.arc(x, y, radius * 1.35, 0, Math.PI * 2);
        c.fill();

        c.globalAlpha = 0.95;
        c.fillStyle = "#ff8a18";
        c.beginPath();
        c.arc(x, y, radius, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = "#ffd447";
        c.beginPath();
        c.arc(x, y, radius * 0.52, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = "#ff3b18";
        c.lineWidth = 2;
        c.globalAlpha = 0.8;
        c.beginPath();
        c.arc(x, y, radius * 1.45, 0, Math.PI * 2);
        c.stroke();

        c.restore();
    }


    drawHealthBar(fighter, label, color) {

        if (!fighter) return;

        const maxHealth =
            Number(fighter.maxHealth) > 0
                ? Number(fighter.maxHealth)
                : 100;

        const health =
            Math.max(
                0,
                Math.min(
                    maxHealth,
                    Number(fighter.health) || 0
                )
            );

        const ratio = health / maxHealth;

        const width = 64;
        const height = 7;
        const x = fighter.x - width / 2;
        const y = fighter.y - 38;

        const c = this.ctx;

        c.save();

        c.fillStyle = "rgba(5, 11, 15, 0.9)";
        c.fillRect(x - 1, y - 1, width + 2, height + 2);

        c.fillStyle = "#162329";
        c.fillRect(x, y, width, height);

        c.fillStyle = color;
        c.fillRect(x, y, width * ratio, height);

        c.strokeStyle = "#263840";
        c.lineWidth = 1;
        c.strokeRect(x - 1, y - 1, width + 2, height + 2);

        c.restore();
    }




    fighter(
        fighter,
        color,
        label
    ) {

        if (!fighter) {
            return;
        }


        const c =
            this.ctx;


        c.save();


        /*
         * =================================
         * BODY
         * =================================
         */

        c.translate(
            fighter.x,
            fighter.y
        );


        c.fillStyle =
            fighter.hitFlash > 0
                ? "#ffffff"
                : "#071015";

        c.strokeStyle =
            color;

        c.lineWidth = 2;


        c.beginPath();

        c.arc(
            0,
            0,
            fighter.radius,
            0,
            Math.PI * 2
        );

        c.fill();

        c.stroke();


        /*
         * =================================
         * ATTACK DIRECTION
         * =================================
         *
         * During an attack the direction is
         * locked so the weapon cannot rotate
         * around the player while stabbing.
         */

        const direction =
            fighter.isAttacking
                ? fighter.attackStartAngle
                : fighter.angle;


        /*
         * =================================
         * AIM LINE
         * =================================
         *
         * Only show this when NOT attacking.
         *
         * This prevents the aim line from
         * looking like part of the weapon.
         */

        if (
            !fighter.isAttacking
        ) {

            c.strokeStyle =
                color;

            c.globalAlpha =
                0.28;

            c.lineWidth = 1;


            c.beginPath();

            c.moveTo(
                0,
                0
            );

            c.lineTo(
                Math.cos(direction) * 42,
                Math.sin(direction) * 42
            );

            c.stroke();

            c.globalAlpha = 1;
        }


        /*
         * =================================
         * WEAPON
         * =================================
         */

        c.rotate(
            direction
        );


        this.weapon(
            c,
            fighter
        );


        /*
         * =================================
         * ATTACK FLASH
         * =================================
         */

        if (
            fighter.attackFlash > 0
        ) {

            c.strokeStyle =
                "#ffffff";

            c.lineWidth = 3;

            c.globalAlpha =
                Math.min(
                    1,
                    fighter.attackFlash / 0.12
                );


            c.beginPath();

            c.arc(
                35,
                0,
                42,
                -0.35,
                0.35
            );

            c.stroke();

            c.globalAlpha = 1;
        }


        c.restore();


        /*
         * =================================
         * DAMAGE EFFECTS
         * =================================
         */

        drawDamageEffects(
            c,
            fighter
        );
    }


    /*
     * =================================
     * WEAPON DISPATCHER
     * =================================
     */

    weapon(
        c,
        fighter
    ) {

        if (
            !fighter.weapon
        ) {

            return;
        }


        const name =
            String(
                fighter.weapon.name || ""
            ).toLowerCase();


        if (
            name === "sword"
        ) {

            this.sword(
                c,
                fighter
            );

            return;
        }


        if (
            name === "hammer"
        ) {

            this.hammer(
                c,
                fighter
            );

            return;
        }


        if (
            name === "spear"
        ) {

            this.spear(
                c,
                fighter
            );

            return;
        }


        if (
            name === "dagger"
        ) {

            this.dagger(
                c,
                fighter
            );

            return;
        }


        if (
            name === "bow"
        ) {

            this.bow(
                c,
                fighter
            );

            return;
        }


        if (
            name === "staff"
        ) {

            this.staff(
                c,
                fighter
            );

            return;
        }


        /*
         * Fallback.
         */

        if (
            fighter.weapon.type === "melee" ||
            fighter.weapon.type === "heavy"
        ) {

            this.sword(
                c,
                fighter
            );

        } else {

            this.staff(
                c,
                fighter
            );
        }
    }


    /*
     * =================================
     * STAB OFFSET
     * =================================
     */

    stabOffset(
        fighter
    ) {

        if (
            !fighter.isAttacking
        ) {

            return 0;
        }


        /*
         * Use the Player's actual animation
         * distance.
         */

        return Number(
            fighter.stabDistance
        ) || 0;
    }


    /*
     * =================================
     * SWORD
     * =================================
     */

    sword(
        c,
        fighter
    ) {

        const offset =
            this.stabOffset(
                fighter
            );


        /*
         * Handle.
         */

        c.strokeStyle =
            "#6b4428";

        c.lineWidth = 6;

        c.lineCap =
            "round";


        c.beginPath();

        c.moveTo(
            2 + offset,
            0
        );

        c.lineTo(
            15 + offset,
            0
        );

        c.stroke();


        /*
         * Guard.

         */

        c.strokeStyle =
            "#d5b36a";

        c.lineWidth = 5;


        c.beginPath();

        c.moveTo(
            14 + offset,
            -9
        );

        c.lineTo(
            14 + offset,
            9
        );

        c.stroke();


        /*
         * Blade.

         */

        c.fillStyle =
            "#dce6ea";

        c.strokeStyle =
            "#ffffff";

        c.lineWidth = 1.5;


        c.beginPath();

        c.moveTo(
            17 + offset,
            -5
        );

        c.lineTo(
            48 + offset,
            -5
        );

        c.lineTo(
            60 + offset,
            0
        );

        c.lineTo(
            48 + offset,
            5
        );

        c.lineTo(
            17 + offset,
            5
        );

        c.closePath();

        c.fill();

        c.stroke();
    }


    /*
     * =================================
     * HAMMER
     * =================================
     */

    hammer(
        c,
        fighter
    ) {

        const offset =
            this.stabOffset(
                fighter
            );


        /*
         * Handle.

         */

        c.strokeStyle =
            "#704728";

        c.lineWidth = 6;

        c.lineCap =
            "round";


        c.beginPath();

        c.moveTo(
            4 + offset,
            0
        );

        c.lineTo(
            48 + offset,
            0
        );

        c.stroke();


        /*
         * Hammer head.

         */

        c.fillStyle =
            "#929da1";

        c.strokeStyle =
            "#e7eef0";

        c.lineWidth = 2;


        c.beginPath();

        c.roundRect(
            38 + offset,
            -14,
            22,
            28,
            4
        );

        c.fill();

        c.stroke();
    }


    /*
     * =================================
     * SPEAR
     * =================================
     */

    spear(
        c,
        fighter
    ) {

        const offset =
            this.stabOffset(
                fighter
            );


        c.strokeStyle =
            "#80542e";

        c.lineWidth = 5;

        c.lineCap =
            "round";


        c.beginPath();

        c.moveTo(
            3 + offset,
            0
        );

        c.lineTo(
            78 + offset,
            0
        );

        c.stroke();


        /*
         * Spearhead.

         */

        c.fillStyle =
            "#d9e3e6";

        c.strokeStyle =
            "#ffffff";

        c.lineWidth = 1.5;


        c.beginPath();

        c.moveTo(
            78 + offset,
            0
        );

        c.lineTo(
            66 + offset,
            -8
        );

        c.lineTo(
            104 + offset,
            0
        );

        c.lineTo(
            66 + offset,
            8
        );

        c.closePath();

        c.fill();

        c.stroke();


        /*
         * Collar.

         */

        c.strokeStyle =
            "#c7a45f";

        c.lineWidth = 4;


        c.beginPath();

        c.moveTo(
            67 + offset,
            -7
        );

        c.lineTo(
            67 + offset,
            7
        );

        c.stroke();
    }


    /*
     * =================================
     * DAGGER
     * =================================
     */

    dagger(
        c,
        fighter
    ) {

        const offset =
            this.stabOffset(
                fighter
            );


        c.strokeStyle =
            "#5b3825";

        c.lineWidth = 6;

        c.lineCap =
            "round";


        c.beginPath();

        c.moveTo(
            3 + offset,
            0
        );

        c.lineTo(
            15 + offset,
            0
        );

        c.stroke();


        /*
         * Guard.

         */

        c.strokeStyle =
            "#b99555";

        c.lineWidth = 4;


        c.beginPath();

        c.moveTo(
            14 + offset,
            -7
        );

        c.lineTo(
            14 + offset,
            7
        );

        c.stroke();


        /*
         * Blade.

         */

        c.fillStyle =
            "#e1eaed";

        c.strokeStyle =
            "#ffffff";

        c.lineWidth = 1;


        c.beginPath();

        c.moveTo(
            16 + offset,
            -4
        );

        c.lineTo(
            40 + offset,
            0
        );

        c.lineTo(
            16 + offset,
            4
        );

        c.closePath();

        c.fill();

        c.stroke();
    }


    /*
     * =================================
     * BOW
     * =================================
     */

    bow(
        c,
        fighter
    ) {

        const offset =
            this.stabOffset(
                fighter
            );


        /*
         * During attack the bow moves
         * slightly forward.
         */

        c.translate(
            offset * 0.35,
            0
        );


        c.strokeStyle =
            "#c49a61";

        c.lineWidth = 4;

        c.lineCap =
            "round";


        /*
         * Bow.

         */

        c.beginPath();

        c.arc(
            27,
            0,
            20,
            -0.95,
            0.95
        );

        c.stroke();


        /*
         * String.

         */

        c.strokeStyle =
            "#eaf1f4";

        c.lineWidth = 1.5;


        c.beginPath();

        c.moveTo(
            8,
            0
        );

        c.lineTo(
            27,
            -20
        );

        c.lineTo(
            27,
            20
        );

        c.lineTo(
            8,
            0
        );

        c.stroke();
    }


    /*
     * =================================
     * STAFF
     * =================================
     */

    staff(
        c,
        fighter
    ) {

        const offset =
            this.stabOffset(
                fighter
            );


        /*
         * Staff moves forward during attack.

         */

        c.translate(
            offset * 0.35,
            0
        );


        /*
         * Shaft.

         */

        c.strokeStyle =
            "#80552f";

        c.lineWidth = 6;

        c.lineCap =
            "round";


        c.beginPath();

        c.moveTo(
            3,
            0
        );

        c.lineTo(
            48,
            0
        );

        c.stroke();


        /*
         * Magic head.

         */

        c.fillStyle =
            "#dcecff";

        c.strokeStyle =
            "#ffffff";

        c.lineWidth = 2;


        c.beginPath();

        c.arc(
            51,
            0,
            8,
            0,
            Math.PI * 2
        );

        c.fill();

        c.stroke();


        /*
         * Core.

         */

        c.fillStyle =
            "#ffffff";


        c.beginPath();

        c.arc(
            51,
            0,
            3,
            0,
            Math.PI * 2
        );

        c.fill();
    }


    /*
     * =================================
     * PROJECTILE
     * =================================
     */

    projectile(
        projectile
    ) {

        if (
            !projectile ||
            projectile.alive === false
        ) {

            return;
        }


        const c =
            this.ctx;


        c.save();


        c.translate(
            projectile.x,
            projectile.y
        );


        c.rotate(
            projectile.angle || 0
        );


        /*
         * =================================
         * FAST ARROW TRAIL
         * =================================
         */

        c.strokeStyle =
            "#eaf1f4";

        c.lineWidth = 2;

        c.lineCap =
            "round";


        c.beginPath();

        c.moveTo(
            -16,
            0
        );

        c.lineTo(
            12,
            0
        );

        c.stroke();


        /*
         * Arrow head.

         */

        c.fillStyle =
            "#ffffff";


        c.beginPath();

        c.moveTo(
            17,
            0
        );

        c.lineTo(
            8,
            -5
        );

        c.lineTo(
            8,
            5
        );

        c.closePath();

        c.fill();


        /*
         * Tail.

         */

        c.strokeStyle =
            "#b7c4c8";

        c.lineWidth = 2;


        c.beginPath();

        c.moveTo(
            -10,
            0
        );

        c.lineTo(
            -15,
            -4
        );

        c.moveTo(
            -10,
            0
        );

        c.lineTo(
            -15,
            4
        );

        c.stroke();


        c.restore();
    }
}