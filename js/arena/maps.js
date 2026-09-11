/*
 * =================================
 * WARSENAL ARENA MAPS
 * =================================
 *
 * Every playable level is defined here.
 *
 * Level data is intentionally kept
 * separate from the arena implementation
 * so new levels can be added without
 * rewriting game logic.
 */

export const LEVELS = Object.freeze({

    level1: {
        id: "level1",
        number: 1,
        name: "TRAINING GROUNDS",
        description: "OPEN COMBAT ARENA",

        background: "#071015",
        gridSize: 48,
        width: null,
        height: null,

        obstacles: [
            {
                type: "rectangle",
                x: 0.18,
                y: 0.22,
                width: 0.10,
                height: 0.08
            },
            {
                type: "rectangle",
                x: 0.18,
                y: 0.70,
                width: 0.10,
                height: 0.08
            },
            {
                type: "rectangle",
                x: 0.72,
                y: 0.22,
                width: 0.10,
                height: 0.08
            },
            {
                type: "rectangle",
                x: 0.72,
                y: 0.70,
                width: 0.10,
                height: 0.08
            }
        ],

        hazards: [],

        playerSpawn: {
            x: 0.10,
            y: 0.50
        },

        aiSpawn: {
            x: 0.90,
            y: 0.50
        }
    },


    level2: {
        id: "level2",
        number: 2,
        name: "RUINED ARENA",
        description: "ANCIENT BATTLEFIELD",

        background: "#0a1114",
        gridSize: 48,
        width: null,
        height: null,

        obstacles: [
            {
                type: "rectangle",
                x: 0.16,
                y: 0.20,
                width: 0.12,
                height: 0.09
            },
            {
                type: "rectangle",
                x: 0.16,
                y: 0.71,
                width: 0.12,
                height: 0.09
            },
            {
                type: "rectangle",
                x: 0.40,
                y: 0.37,
                width: 0.08,
                height: 0.26
            },
            {
                type: "rectangle",
                x: 0.60,
                y: 0.37,
                width: 0.08,
                height: 0.26
            },
            {
                type: "rectangle",
                x: 0.72,
                y: 0.20,
                width: 0.12,
                height: 0.09
            },
            {
                type: "rectangle",
                x: 0.72,
                y: 0.71,
                width: 0.12,
                height: 0.09
            }
        ],

        hazards: [],

        playerSpawn: {
            x: 0.08,
            y: 0.50
        },

        aiSpawn: {
            x: 0.92,
            y: 0.50
        }
    },


    level3: {
        id: "level3",
        number: 3,
        name: "INFERNO",
        description: "THE FINAL BATTLEFIELD",

        background: "#120b09",
        gridSize: 48,
        width: null,
        height: null,

        obstacles: [
            {
                type: "rectangle",
                x: 0.16,
                y: 0.18,
                width: 0.12,
                height: 0.09
            },
            {
                type: "rectangle",
                x: 0.16,
                y: 0.73,
                width: 0.12,
                height: 0.09
            },
            {
                type: "rectangle",
                x: 0.46,
                y: 0.38,
                width: 0.08,
                height: 0.24
            },
            {
                type: "rectangle",
                x: 0.72,
                y: 0.18,
                width: 0.12,
                height: 0.09
            },
            {
                type: "rectangle",
                x: 0.72,
                y: 0.73,
                width: 0.12,
                height: 0.09
            }
        ],

        hazards: [
            {
                type: "fire",
                x: 0.34,
                y: 0.28,
                radius: 0.045,
                damage: 8,
                interval: 0.5
            },
            {
                type: "fire",
                x: 0.34,
                y: 0.72,
                radius: 0.045,
                damage: 8,
                interval: 0.5
            },
            {
                type: "fire",
                x: 0.66,
                y: 0.50,
                radius: 0.045,
                damage: 8,
                interval: 0.5
            }
        ],

        playerSpawn: {
            x: 0.08,
            y: 0.50
        },

        aiSpawn: {
            x: 0.92,
            y: 0.50
        }
    }
});


export function getLevel(levelId) {
    return LEVELS[levelId] || LEVELS.level1;
}


export function getLevelList() {
    return Object.values(LEVELS);
}