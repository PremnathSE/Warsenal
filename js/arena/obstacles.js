/*
 * =================================
 * WARSENAL ARENA OBSTACLES
 * =================================
 */

export function createObstacles(
    definitions = [],
    width = 0,
    height = 0
) {

    const safeWidth =
        Number(width) > 0
            ? Number(width)
            : 1;

    const safeHeight =
        Number(height) > 0
            ? Number(height)
            : 1;


    return (Array.isArray(definitions)
        ? definitions
        : []
    ).map(definition => {

        if (!definition) {
            return null;
        }


        const x =
            Number(definition.x) || 0;

        const y =
            Number(definition.y) || 0;

        const obstacleWidth =
            Number(definition.width) || 0;

        const obstacleHeight =
            Number(definition.height) || 0;


        return {

            ...definition,

            x:
                x <= 1
                    ? x * safeWidth
                    : x,

            y:
                y <= 1
                    ? y * safeHeight
                    : y,

            width:
                obstacleWidth <= 1
                    ? obstacleWidth * safeWidth
                    : obstacleWidth,

            height:
                obstacleHeight <= 1
                    ? obstacleHeight * safeHeight
                    : obstacleHeight

        };

    }).filter(Boolean);

}
