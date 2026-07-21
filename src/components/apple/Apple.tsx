import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

export default function Apple({treeId, attachId}: {treeId: number, attachId: number}) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const attachPoint = useGameStore((s) => s.trees[treeId]?.attachPoints[attachId]);

    useFrame(() => {
        if (!meshRef.current || !attachPoint?.ref.current) return;
        attachPoint.ref.current.getWorldPosition(meshRef.current.position);
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="red" />
        </mesh>
    );
}