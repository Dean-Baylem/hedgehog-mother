type TreeLike = {
    id: number;
    position: [number, number, number]
};
type XYPos = {x: number, z: number};

export default function findTargetTree(
    trees: Record<number, TreeLike>,
    origin: XYPos,
    forward: XYPos,
    reach = 1.4,
    minDot = 0.75,
): number | null {
    let bestId: number | null = null;
    let bestDistSq = reach * reach;

    for (const tree of Object.values(trees)) {
        const dx = tree.position[0] - origin.x;
        const dz = tree.position[2] - origin.z;
        const distSq = dx * dx + dz * dz;

        if (distSq >= bestDistSq || distSq === 0) continue;

        const dist = Math.sqrt(distSq);
        const dot = (dx * forward.x + dz * forward.z) / dist;

        if (dot < minDot) continue;

        bestId = tree.id;
        bestDistSq = distSq;
    }

    return bestId;
}