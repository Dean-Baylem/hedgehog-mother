import { Clone, useGLTF } from "@react-three/drei";
import { RigidBody, BallCollider } from "@react-three/rapier";
import { useGameStore } from "../../store/gameStore";
import { useRef, useEffect } from "react";
import type { CollisionPayload } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Apple({ id }: { id: number }) {
    const apple = useGameStore((state) => state.apples[id]);
    const { updateAppleState } = useGameStore();
    const ref = useRef<any>(null);
    const shadowRef = useRef<THREE.Mesh>(null);
    const { scene } = useGLTF(`/models/apples/apple-${apple.appleColor}.glb`);

    useEffect(() => {
        if (!ref.current || !apple) return;
        const body = ref.current;

        switch (apple.state) {
            case "falling":
                body.setBodyType(0, true);
                requestAnimationFrame(() => {
                    const angle = Math.random() * Math.PI * 2;
                    const strength = 0.002;
                    body.applyImpulse({ x: Math.cos(angle) * strength, y: 0, z: Math.sin(angle) * strength }, true);
                });
                break;
            case "attached":
                body.setBodyType(2, true);
                break;
        }
    }, [apple?.state]);


    const handleCollisionEnter = (event: CollisionPayload) => {
        const otherBody = event.other.rigidBodyObject;

        if (!otherBody) return;

        const userData = otherBody.userData;
        if (userData.type === "floor") {
            console.log(`Apple ${id} hit the floor`);
            updateAppleState(id, "floor");
        }
    };

    useFrame(() => {
        if ((apple.state !== "falling" && apple.state !== "attached") || !ref.current || !shadowRef.current) return;

        // Update the shadow position to match the apple's x and z coordinates
        const position = ref.current.translation();
        shadowRef.current.position.x = position.x;
        shadowRef.current.position.z = position.z;

        // Update the shadow scale based on the apple's height above the ground
        const height = Math.max(0, position.y);

        const scale = Math.max(0.4, 0.5 - height * 0.4);
        shadowRef.current.scale.set(scale, scale, scale);
    });

    if (!apple) return null;

    return (
        <>
            <RigidBody
                type={apple.state === "falling" ? "dynamic" : "fixed"}
                position={apple.anchorPos}
                userData={{ type: "apple", appleId: id }}
                ref={ref}
                gravityScale={0.2}
                onCollisionEnter={handleCollisionEnter}
            >
                <Clone object={scene} receiveShadow={apple.state !== "falling"} castShadow />
                <BallCollider args={[0.08]} />
            </RigidBody>
            {(apple.state === "falling" || apple.state === "attached") && (
                <mesh
                    ref={shadowRef}
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[apple.anchorPos[0], 0.01, apple.anchorPos[2]]}
                    scale={[1.3, 0.6, 1.3]}
                >
                    <circleGeometry args={[0.12, 16]} />
                    <meshBasicMaterial
                        color="black"
                        transparent
                        opacity={0.45}
                    />
                </mesh>
            )}
        </>
    );
}
