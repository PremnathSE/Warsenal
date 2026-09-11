/*
 * WARSENAL ARENA BOUNDARIES
 */

export function constrainToArena(
    entity,
    width,
    height,
    padding = 0
) {
    if (!entity) return;

    const w = Number(width) > 0 ? Number(width) : 1;
    const h = Number(height) > 0 ? Number(height) : 1;
    const radius = Number(entity.radius) || 0;
    const p = Math.max(0, Number(padding) || 0);

    const minX = p + radius;
    const maxX = w - p - radius;
    const minY = p + radius;
    const maxY = h - p - radius;

    entity.x = Math.max(minX, Math.min(maxX, Number(entity.x) || minX));
    entity.y = Math.max(minY, Math.min(maxY, Number(entity.y) || minY));
}
