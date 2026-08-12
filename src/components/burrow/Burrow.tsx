import { useGLTF } from "@react-three/drei";
import { CuboidCollider, CylinderCollider, RapierRigidBody, RigidBody, type CollisionPayload } from "@react-three/rapier";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

export default function Burrow({position}: {position: [number, number, number]}) {
    const { scene } = useGLTF("/models/burrow/burrow.glb");
    const ref = useRef<RapierRigidBody>(null);
    const { deliverApplesFromHedgehog, apples } = useGameStore();

    useEffect(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene]);

    const handleIntersectionEnter = (event: CollisionPayload) => {
        const otherBody = event.other.rigidBodyObject;

        if (!otherBody) return;

        const userData = otherBody.userData as { type: string };
        if (userData.type !== "hedgehog") return;

        deliverApplesFromHedgehog();
    }

    return (
        <RigidBody ref={ref} type="fixed" userData={{ type: "burrow" }} colliders={false} position={position}>
            <primitive object={scene} />
            <CylinderCollider args={[0.5, 1.0]} position={[0, 0.5, 0]} />
            <CuboidCollider args={[0.5, 0.5, 0.2]} position={[-0.05, 0.25, 1.1]} sensor onIntersectionEnter={handleIntersectionEnter} />
        </RigidBody>
    )
}