import { Weapon } from "./weapon.js";
import { WEAPON_STATS } from "./weaponStats.js";

export class Spear extends Weapon {

    constructor() {

        super(
            WEAPON_STATS.spear
        );
    }
}