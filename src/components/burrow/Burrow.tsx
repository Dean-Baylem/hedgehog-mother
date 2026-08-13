import { useGLTF } from "@react-three/drei";
import { CuboidCollider, CylinderCollider, RapierRigidBody, RigidBody, type CollisionPayload } from "@react-three/rapier";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";

const getDisplayedAppleCount = (count: number) => {
    const displayThresholds = [10, 15, 20];

    for (let i = 0; i < displayThresholds.length; i++) {
        if (count < displayThresholds[i]) return displayThresholds[i];
    }

    return displayThresholds[displayThresholds.length - 1];
};

export default function Burrow({ position }: { position: [number, number, number] }) {
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
    };

    // const deliveredApples = Object.values(apples).filter((apple) => apple.state === "delivered");

    return (
        <group position={position}>
            <RigidBody
                ref={ref}
                type="fixed"
                userData={{ type: "burrow" }}
                colliders="trimesh"
            >
                <primitive object={scene} />
                <CuboidCollider
                    args={[0.5, 0.5, 0.2]}
                    position={[-0.05, 0.25, 1.1]}
                    sensor
                    onIntersectionEnter={handleIntersectionEnter}
                />
            </RigidBody>
            {Array.from({ length: 100 }).map((_, i) => (
                <RigidBody
                    type="dynamic"
                    position={[0, 0.5, 0]}
                    ccd
                >
                    <mesh>
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshBasicMaterial color="red" />
                    </mesh>
                </RigidBody>
            ))}
        </group>
    );
}
