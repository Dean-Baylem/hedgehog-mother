import { createNoise2D } from "simplex-noise";

type TreePosition = [number, number, number];

const noise2D = createNoise2D();

const generateTreePositions = (
    worldSize: number,
    scale: number,
    threshold: number,
    spacing: number = 3,
    jitterAmount: number = 1,
    exclusions: { x: number; z: number; radius: number }[] = [],
): TreePosition[] => {
    const positions: TreePosition[] = [];
    for (let x = -worldSize / 2; x < worldSize / 2; x += spacing) {
        for (let z = -worldSize / 2; z < worldSize / 2; z += spacing) {
            const noise = (noise2D(x * scale, z * scale) + 1) / 2;
            if (noise <= threshold) continue;

            const jitterX = x + (Math.random() - 0.5) * jitterAmount * 2;
            const jitterZ = z + (Math.random() - 0.5) * jitterAmount * 2;

            const blocked = exclusions.some(({ x: ex, z: ez, radius }) => {
                const dx = jitterX - ex;
                const dz = jitterZ - ez;
                return dx * dx + dz * dz < radius * radius;
            });
            if (blocked) continue;

            positions.push([jitterX, 0, jitterZ]);
        }
    }
    return positions;
};

export default generateTreePositions;
