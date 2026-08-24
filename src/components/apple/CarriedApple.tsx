import { useGameStore } from "../../store/gameStore";
import { forwardRef } from "react";
import * as THREE from "three";
import { Clone, useGLTF } from "@react-three/drei";

const CarriedApple = forwardRef<THREE.Group, {id: number}>(({id}, ref) => {
    const apple = useGameStore((state) => state.apples[id]);
    const { scene } = useGLTF(`/models/apples/apple-${apple.appleColor}.glb`);
    
    if (!apple || apple.state !== "carried" || !apple.attachedSlot) return null;
    return (
        <Clone
            object={scene}
            position={[apple.attachedSlot[0], apple.attachedSlot[1], apple.attachedSlot[2]]}
            receiveShadow
            castShadow
            ref={ref}
        />
    );
});

export default CarriedApple;