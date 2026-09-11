export function applyKnockback(attacker,target,amount){target.x+=Math.cos(attacker.angle)*amount;target.y+=Math.sin(attacker.angle)*amount}
