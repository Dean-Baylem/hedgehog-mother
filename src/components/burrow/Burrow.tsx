import { useGLTF } from "@react-three/drei";
import { CuboidCollider, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";
import DeliveredApple from "../apple/DeliveredApple";
import { useControls } from "leva";

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
            <group
                position={position}
                rotation-y={-1.52}
            >
                <RigidBody
                    ref={ref}
                    type="fixed"
                    userData={{ type: "burrow" }}
                    colliders="trimesh"
                >
                    <primitive object={scene} />
                    <CuboidCollider
                        args={[0.35, 0.5, 0.2]}
                        position={[-0.08, 0.25, 1.1]}
                        sensor
                    />
                </RigidBody>
            </group>
            {deliveredApples.map((apple) => {
                if (!apple.deliverStartPos) return null;

                return (
                    <DeliveredApple
                        key={`deliveredApple-${apple.id}`}
                        id={apple.id}
                        position={[apple.deliverStartPos.x, apple.deliverStartPos.y, apple.deliverStartPos.z]}
                        burrowPosition={position}
                        appleColor={apple.appleColor}
                    />
                );
            })}
        </>
    );
}
