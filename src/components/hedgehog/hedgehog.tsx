import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useControls } from "leva";
import { RigidBody } from "@react-three/rapier";
import type {RapierRigidBody} from "@react-three/rapier";

export default function Hedgehog() {
    const { scene } = useGLTF("/models/hedgehog/hedgehog.glb");
    const hedgehogRef = useRef<RapierRigidBody>(null);

    const rotationY = useRef(0);
    const quaternion = useRef(new THREE.Quaternion());
    const direction = useRef(new THREE.Vector3());
    const velocity = useRef(new THREE.Vector3());
    const currentPosition = useRef(new THREE.Vector3());

    const { offsetX, offsetY, offsetZ } = useControls("CameraOffset", {
        offsetX: { value: -3, min: -10, max: 10, step: 0.1 },
        offsetY: { value: 1.0, min: -10, max: 10, step: 0.1 },
        offsetZ: { value: 0, min: -10, max: 10, step: 0.1 },
    });

    const cameraOffset = new THREE.Vector3(offsetX, offsetY, offsetZ);
    const desiredPosition = new THREE.Vector3();
    const [, get] = useKeyboardControls();

    useFrame((state, delta) => {
        if (!hedgehogRef.current) return;

        const { forward, backward, left, right } = get();

        const speed = 2;
        const rotationSpeed = 2 * delta;

        // Turn
        if (left) rotationY.current += rotationSpeed;
        if (right) rotationY.current -= rotationSpeed;
        quaternion.current.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationY.current);
        hedgehogRef.current.setRotation(quaternion.current, true);

        // Create velocity from facing direction
        direction.current.set(1, 0, 0).applyQuaternion(quaternion.current);
        velocity.current.set(0, 0, 0);
        if (forward) velocity.current.addScaledVector(direction.current, speed);
        if (backward) velocity.current.addScaledVector(direction.current, -speed);

        // Move hedgehog
        hedgehogRef.current.setLinvel({ x: velocity.current.x, y: 0, z: velocity.current.z }, true);

        /**
         * Camera Management
         */
        // const t = hedgehogRef.current.translation();
        // currentPosition.current.set(t.x, t.y, t.z);
        // desiredPosition.copy(cameraOffset).applyQuaternion(quaternion.current).add(currentPosition.current);
        // state.camera.position.lerp(desiredPosition, 5 * delta);
        // state.camera.lookAt(currentPosition.current);
    });

    return (
        <RigidBody ref={hedgehogRef} type="dynamic" colliders="hull" gravityScale={0} enabledRotations={[false, true, false]} linearDamping={0.5}>
            <primitive object={scene} />
        </RigidBody>
    );
}
