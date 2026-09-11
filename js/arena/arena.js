/*
 * =================================
 * WARSENAL ARENA
 * =================================
 */

import {
    getLevel
} from "./maps.js";

import {
    createObstacles
} from "./obstacles.js";

import {
    createHazards
} from "./hazards.js";


export class Arena {

    constructor(
        width,
        height
    ) {

        this.width =
            width;

        this.height =
            height;


        this.level = null;

        this.obstacles = [];

        this.hazards = [];


        this.background =
            "#071015";

        this.gridSize =
            48;

    }


    /*
     * =================================
     * RESIZE
     * =================================
     */

    resize(
        width,
        height
    ) {

        this.width =
            Number(width) > 0
                ? Number(width)
                : this.width;

        this.height =
            Number(height) > 0
                ? Number(height)
                : this.height;

        /*
         * Rebuild the current level using the
         * new canvas dimensions.
         */
        if (this.level) {
            this.loadLevel(this.level.id);
        }

    }

    /*
     * =================================
     * LOAD LEVEL
     * =================================
     */

    loadLevel(
        levelId
    ) {

        const level =
            getLevel(
                levelId
            );


        this.level =
            level;


        this.background =
            level.background ||
            "#071015";


        this.gridSize =
            level.gridSize ||
            48;


        this.obstacles =
            createObstacles(
                level.obstacles,
                this.width,
                this.height
            );


        this.hazards =
            createHazards(
                level.hazards,
                this.width,
                this.height
            );


        return level;

    }


    /*
     * =================================
     * GET SPAWN POSITION
     * =================================
     */

    getSpawnPosition(
        side
    ) {

        const fallback =
            side === "player"
                ? { x: 0.20, y: 0.50 }
                : { x: 0.80, y: 0.50 };

        const spawn =
            this.level &&
            side === "player"
                ? this.level.playerSpawn
                : this.level && this.level.aiSpawn;

        const source =
            spawn &&
            Number.isFinite(Number(spawn.x)) &&
            Number.isFinite(Number(spawn.y))
                ? spawn
                : fallback;

        const width =
            Number(this.width) > 0
                ? Number(this.width)
                : 1;

        const height =
            Number(this.height) > 0
                ? Number(this.height)
                : 1;

        return {
            x: Number(source.x) * width,
            y: Number(source.y) * height
        };

    }

    /*
     * =================================
     * UPDATE
     * =================================
     */

    update(
        dt,
        player,
        ai
    ) {

        /*
         * Hazards are currently updated
         * externally through the hazard
         * helper.
         *
         * This method is intentionally
         * kept available for future
         * arena systems.
         */

    }


    /*
     * =================================
     * GET LEVEL NAME
     * =================================
     */

    getName() {

        return this.level
            ? this.level.name
            : "TRAINING GROUNDS";

    }

}