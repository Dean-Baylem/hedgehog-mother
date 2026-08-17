import { useGLTF } from "@react-three/drei";
import { CuboidCollider, CylinderCollider, RapierRigidBody, RigidBody, type CollisionPayload } from "@react-three/rapier";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";
import DeliveredApple from "../apple/DeliveredApple";

export default function Burrow({ position }: { position: [number, number, number] }) {
    const { scene } = useGLTF("/models/burrow/burrow.glb");
    const ref = useRef<RapierRigidBody>(null);
    const { apples } = useGameStore();

    useEffect(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene]);

    const deliveredApples = Object.values(apples).filter((apple) => apple.state === "delivered");

    return (
        
        <>
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
                    />
                </RigidBody>
            </group>
            {deliveredApples.map((apple) => {
                console.log(apple);
                if (!apple.deliverStartPos) return null;

                return (
                    <DeliveredApple
                        key={`deliveredApple-${apple.id}`}
                        id={apple.id}
                        position={[apple.deliverStartPos.x, apple.deliverStartPos.y, apple.deliverStartPos.z]}
                        burrowPosition={position}
                    />
                );
            })}
        </>
    );
}
