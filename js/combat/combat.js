import {
    attack
} from "./attacks.js";


export function combatAttack(
    attacker,
    target,
    projectileList
) {

    return attack(
        attacker,
        target,
        projectileList
    );
}