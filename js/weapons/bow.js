import { Weapon } from "./weapon.js";
import { WEAPON_STATS } from "./weaponStats.js";


export class Bow extends Weapon {

    constructor() {

        super(
            WEAPON_STATS.bow
        );

        this.projectileSpeed = 1100;
    }
}