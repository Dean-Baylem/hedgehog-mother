import { createNoise2D } from "simplex-noise";

type TreePosition = [number, number, number];

const noise2D = createNoise2D();

const generateTreePositions = (
    worldSize: number,
    scale: number,
    threshold: number,
    spacing: number = 3,
    jitterAmount: number = 1, // how far off-grid a tree can shift
): TreePosition[] => {
    const positions: TreePosition[] = [];

    for (let x = -worldSize / 2; x < worldSize / 2; x += spacing) {
        for (let z = -worldSize / 2; z < worldSize / 2; z += spacing) {
            const noise = (noise2D(x * scale, z * scale) + 1) / 2;

            if (noise > threshold) {
                const jitterX = x + (Math.random() - 0.5) * jitterAmount * 2;
                const jitterZ = z + (Math.random() - 0.5) * jitterAmount * 2;

                positions.push([jitterX, 0, jitterZ]);
            }
        }
    }

    return positions;
};
export default generateTreePositions;