export function drawDamageEffects(
    ctx,
    entity
) {

    /*
     * HIT FLASH
     */

    if (entity.hitFlash > 0) {

        ctx.save();

        ctx.globalAlpha =
            entity.hitFlash / 0.12;

        ctx.fillStyle = "#ffffff";

        ctx.beginPath();

        ctx.arc(
            entity.x,
            entity.y,
            entity.radius + 8,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }


    /*
     * IMPACT RING
     */

    if (entity.impactEffect) {

        const effect =
            entity.impactEffect;

        const alpha =
            effect.timer /
            effect.maxTime;

        ctx.save();

        ctx.globalAlpha = alpha;

        ctx.strokeStyle = "#ffffff";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.arc(
            entity.x,
            entity.y,
            effect.radius,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        ctx.restore();
    }


    /*
     * DAMAGE NUMBER
     */

    if (entity.damagePopup) {

        const popup =
            entity.damagePopup;

        const alpha =
            popup.timer /
            popup.maxTime;

        ctx.save();

        ctx.globalAlpha = alpha;

        ctx.fillStyle = "#ff536d";

        ctx.font =
            "bold 14px ui-monospace, monospace";

        ctx.textAlign = "center";

        ctx.fillText(
            `-${popup.value}`,
            entity.x + popup.offsetX,
            entity.y + popup.offsetY
        );

        ctx.restore();
    }
}