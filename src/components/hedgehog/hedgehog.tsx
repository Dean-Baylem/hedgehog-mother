import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useControls } from "leva";
import { RigidBody } from "@react-three/rapier";

export default function Hedgehog() {
    const { scene } = useGLTF("/models/hedgehog/hedgehog.glb");
    const hedgehogRef = useRef<any>(null);
    const direction = useRef(new THREE.Vector3());
    const {offsetX, offsetY, offsetZ} = useControls("Camera Offset", {
        offsetX: { value: -3, min: -10, max: 10, step: 0.1 },
        offsetY: { value: 1.0, min: -10, max: 10, step: 0.1 },
        offsetZ: { value: 0, min: -10, max: 10, step: 0.1 },
    });
    const cameraOffset = new THREE.Vector3(offsetX, offsetY, offsetZ);
    const desiredPosition = new THREE.Vector3();

    const [, get] = useKeyboardControls();

    useFrame((state, delta) => {
        const { forward, backward, left, right } = get();
        if (!hedgehogRef.current) return;

        /**
         * Hedgehog Controls
         */
        const speed = 2 * delta;
        const rotationSpeed = 2 * delta;

        // Turn to change direction
        if (left) hedgehogRef.current.rotation.y += rotationSpeed;
        if (right) hedgehogRef.current.rotation.y -= rotationSpeed;

        // Get current forward direction
        direction.current.set(1, 0, 0).applyQuaternion(hedgehogRef.current.quaternion);

        if (forward) hedgehogRef.current.position.addScaledVector(direction.current, speed);
        if (backward) hedgehogRef.current.position.addScaledVector(direction.current, -speed);

        /**
         * Camera Management
         */
        // desiredPosition.copy(cameraOffset).applyQuaternion(hedgehogRef.current.quaternion).add(hedgehogRef.current.position);
        // state.camera.position.lerp(desiredPosition, 5 * delta);
        // state.camera.lookAt(hedgehogRef.current.position);
        
    });

    return (
        <RigidBody>
            <primitive
                object={scene}
                ref={hedgehogRef}
            />
        </RigidBody>
    );
}
