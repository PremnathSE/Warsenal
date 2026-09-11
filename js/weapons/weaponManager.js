import { Sword } from "./sword.js";
import { Hammer } from "./hammer.js";
import { Bow } from "./bow.js";
import { Spear } from "./spear.js";
import { Dagger } from "./dagger.js";
import { Staff } from "./staff.js";


export class WeaponManager {

    constructor(
        available = ["sword"],
        initial = "sword"
    ) {

        /*
         * Weapon classes
         */

        this.registry = {

            sword: Sword,

            hammer: Hammer,

            bow: Bow,

            spear: Spear,

            dagger: Dagger,

            staff: Staff
        };


        /*
         * Actual weapon instances
         */

        this.weapons = {};


        /*
         * Weapons this manager is allowed
         * to use.
         */

        this.available =
            new Set(available);


        /*
         * Current weapon name
         */

        this.currentName = null;


        /*
         * Create available weapons
         */

        this.buildAvailable();


        /*
         * Equip initial weapon
         */

        this.equip(initial);
    }


    /*
     * =================================
     * CREATE WEAPONS
     * =================================
     */

    buildAvailable() {

        for (
            const name of this.available
        ) {

            const WeaponClass =
                this.registry[name];


            if (!WeaponClass) {

                console.warn(
                    `Unknown weapon: ${name}`
                );

                continue;
            }


            this.weapons[name] =
                new WeaponClass();
        }
    }


    /*
     * =================================
     * EQUIP WEAPON
     * =================================
     */

    equip(name) {

        /*
         * Weapon doesn't exist.
         */

        if (!this.weapons[name]) {

            console.warn(
                `Weapon not available: ${name}`
            );

            return false;
        }


        this.currentName = name;


        /*
         * Reset the weapon cooldown
         * when switching weapons.
         */

        this.weapons[name].reset();


        return true;
    }


    /*
     * =================================
     * CURRENT WEAPON
     * =================================
     */

    get current() {

        if (!this.currentName) {
            return null;
        }


        return this.weapons[
            this.currentName
        ];
    }


    /*
     * =================================
     * UPDATE
     * =================================
     */

    update(dt) {

        for (
            const weapon
            of Object.values(
                this.weapons
            )
        ) {

            weapon.update(dt);
        }
    }


    /*
     * =================================
     * DEBUG
     * =================================
     */

    getCurrentWeaponName() {

        return this.currentName;
    }
}