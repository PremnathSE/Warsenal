export const WEAPON_STATS = Object.freeze({

    /*
     * =================================
     * SWORD
     * =================================
     */

    sword: {
        name: "Sword",
        type: "melee",

        range: 82,
        damage: 18,

        cooldown: 0.28,

        arc: 0.95,

        knockback: 18
    },


    /*
     * =================================
     * HAMMER
     * =================================
     */

    hammer: {
        name: "Hammer",
        type: "heavy",

        range: 78,
        damage: 34,

        cooldown: 0.90,

        arc: 0.72,

        knockback: 58
    },


    /*
     * =================================
     * BOW
     * =================================
     */

    bow: {
        name: "Bow",
        type: "ranged",

        range: 520,
        damage: 22,

        cooldown: 0.55,

        arc: 0.08,

        knockback: 4,

        projectileSpeed: 1100
    },


    /*
     * =================================
     * SPEAR
     * =================================
     *
     * Longest melee weapon.
     * Fast forward stab.
     */

    spear: {
        name: "Spear",
        type: "melee",

        range: 110,
        damage: 20,

        cooldown: 0.45,

        arc: 0.55,

        knockback: 22
    },


    /*
     * =================================
     * DAGGER
     * =================================
     *
     * Very short range.
     * Very fast attacks.
     */

    dagger: {
        name: "Dagger",
        type: "melee",

        range: 62,
        damage: 12,

        cooldown: 0.16,

        arc: 1.10,

        knockback: 8
    },


    /*
     * =================================
     * STAFF
     * =================================
     *
     * Ranged weapon with slower,
     * weaker projectile attacks.
     */

    staff: {
        name: "Staff",
        type: "ranged",

        range: 320,
        damage: 16,

        cooldown: 0.65,

        arc: 0.12,

        knockback: 12,

        projectileSpeed: 850
    }

});