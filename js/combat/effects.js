export function hitEffect(entity, damage, isPlayer = false) {

    // Flash the entity
    entity.hitFlash = 0.12;

    // Store damage popup
    entity.damagePopup = {
        value: damage,
        timer: 0.55,
        maxTime: 0.55,
        offsetX: (Math.random() - 0.5) * 12,
        offsetY: -10
    };

    // Impact ring
    entity.impactEffect = {
        timer: 0.18,
        maxTime: 0.18,
        radius: 10
    };

    // Screen damage feedback
    if (isPlayer) {
        entity.damageScreenFlash = 0.12;
    }
}