import { useGameStore } from "../../store/gameStore";

export default function Apple({id}: {id: number}) {
    const apple = useGameStore((state) => state.apples[id]);
    if (!apple) return null;

    const apples = useGameStore((state) => state.apples);

    return (
        <mesh position={apple.anchorPos}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="red" />
        </mesh>
    );
}