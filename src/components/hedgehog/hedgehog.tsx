import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Hedgehog() {
    const { scene } = useGLTF("/models/hedgehog/hedgehog.glb");
    const hedgehogRef = useRef<any>(null);
    const direction = useRef(new THREE.Vector3());
    const [, get] = useKeyboardControls();

    useFrame((state, delta) => {
        const { forward, backward, left, right } = get();
        if (!hedgehogRef.current) return;

        const speed = 2 * delta;
        const rotationSpeed = 2 * delta;

        // Turn to change direction
        if (left) hedgehogRef.current.rotation.y += rotationSpeed;
        if (right) hedgehogRef.current.rotation.y -= rotationSpeed;

        // Get current forward direction
        direction.current.set(1, 0, 0).applyQuaternion(hedgehogRef.current.quaternion);

        if (forward) hedgehogRef.current.position.addScaledVector(direction.current, speed);
        if (backward) hedgehogRef.current.position.addScaledVector(direction.current, -speed);
        
    });

    return (
        <primitive
            object={scene}
            ref={hedgehogRef}
        />
    );
}
