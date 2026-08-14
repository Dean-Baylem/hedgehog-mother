import { useGameStore } from "../../store/gameStore";
import { forwardRef } from "react";
import * as THREE from "three";

const CarriedApple = forwardRef<THREE.Mesh, {id: number}>(({id}, ref) => {
    const apple = useGameStore((state) => state.apples[id]);
    if (!apple || apple.state !== "carried" || !apple.attachedSlot) return null;
    return (
        <mesh position={[apple.attachedSlot[0], apple.attachedSlot[1], apple.attachedSlot[2]]} ref={ref}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="red" />
        </mesh>
    );
});

export default CarriedApple;