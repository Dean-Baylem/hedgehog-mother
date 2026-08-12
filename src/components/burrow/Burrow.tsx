import { useGLTF } from "@react-three/drei";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function Burrow({position}: {position: [number, number, number]}) {
    const { scene } = useGLTF("/models/burrow/burrow.glb");
    const ref = useRef<RapierRigidBody>(null);

    useEffect(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene]);

    return (
        <RigidBody ref={ref} type="fixed" userData={{ type: "burrow" }} colliders="hull" position={position}>
            <primitive object={scene} />
        </RigidBody>
    )
}