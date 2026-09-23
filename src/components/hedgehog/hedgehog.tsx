import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import type { RapierRigidBody, CollisionPayload } from "@react-three/rapier";
import { useGameStore } from "../../store/gameStore";
import CarriedApple from "../apple/CarriedApple";
import findTargetTree from "../../utils/findTargetTree";

const appleSlots: [number, number, number][] = [
    [0.06, 0.28, 0.08],
    [-0.03, 0.3, -0.09],
    [-0.14, 0.25, 0.08],
    [-0.23, 0.25, -0.03],
];

type OrbitControlsLike = {
    target: THREE.Vector3;
    update: () => void;
    enabled: boolean;
};

const INITIAL_CAMERA_OFFSET = new THREE.Vector3(8, 5, 0);

export default function Hedgehog() {
    const { scene } = useGLTF("/models/hedgehog/hedgehog.glb");
    const hedgehogRef = useRef<RapierRigidBody>(null);
    const appleRefs = useRef<Record<number, THREE.Group>>({});
    const { apples, attachAppleToHedgehog, applesSwitchCarriedToDelivered } = useGameStore();

    // Hedgehog Details
    const rotationY = useRef(Math.PI);
    const quaternion = useRef(new THREE.Quaternion());
    const direction = useRef(new THREE.Vector3());
    const velocity = useRef(new THREE.Vector3());
    const currentPosition = useRef(new THREE.Vector3());

    // Camera Details
    const controls = useThree((state) => state.controls) as OrbitControlsLike | null;
    const smoothedTarget = useRef(new THREE.Vector3());
    const frameDelta = useRef(new THREE.Vector3());
    const initialised = useRef(false);

    // Keyboard
    const [subscribe, get] = useKeyboardControls();

    useEffect(() => {
        return subscribe(
            (state) => state.hit,
            (pressed) => {
                if (!pressed || !hedgehogRef.current) return;

                const p = hedgehogRef.current.translation();
                // (1,0,0) rotated by rotationY around the Y axis
                const forward = { x: Math.cos(rotationY.current), z: -Math.sin(rotationY.current) };

                const { trees, hitTree } = useGameStore.getState();
                const treeId = findTargetTree(trees, p, forward);
                if (treeId !== null) hitTree(treeId);
            },
        );
    }, [subscribe]);

    // Movement
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
        if (!controls) return;

        const t = hedgehogRef.current.translation();
        currentPosition.current.set(t.x, t.y, t.z);

        if (!initialised.current) {
            smoothedTarget.current.copy(currentPosition.current);
            controls.target.copy(currentPosition.current);
            state.camera.position.copy(currentPosition.current).add(INITIAL_CAMERA_OFFSET);
            initialised.current = true;
        }

        const alpha = 1 - Math.exp(-5 * delta);
        smoothedTarget.current.lerp(currentPosition.current, alpha);

        frameDelta.current.copy(smoothedTarget.current).sub(controls.target);
        controls.target.add(frameDelta.current);
        state.camera.position.add(frameDelta.current);

        controls.update();
    });

    // Handle The collisions between the hedgehog and the apples.
    const handleCollisionEnter = (event: CollisionPayload) => {
        const userData = event.other.rigidBodyObject?.userData;
        if (userData?.type !== "apple" || !userData.appleId) return;

        const { apples, attachAppleToHedgehog } = useGameStore.getState();
        const carriedCount = Object.values(apples).filter((a) => a.state === "carried").length;
        if (carriedCount >= appleSlots.length) return;

        attachAppleToHedgehog(userData.appleId, appleSlots[carriedCount]);
    };

    const handleIntersectionEnter = (event: CollisionPayload) => {
        const otherBody = event.other.rigidBodyObject;

        if (!otherBody) return;

        const userData = otherBody.userData as { type: string };
        if (userData.type !== "burrow") return;

        if (Object.values(appleRefs.current).length > 0) {
            applesSwitchCarriedToDelivered(appleRefs.current);
        }
    };

    return (
        <RigidBody
            ref={hedgehogRef}
            type="dynamic"
            colliders={false}
            gravityScale={0}
            linearDamping={4}
            angularDamping={4}
            enabledRotations={[false, true, false]}
            userData={{ type: "hedgehog" }}
            position={[7.5, 0, 1]}
            rotation={[0, Math.PI, 0]}
        >
            <primitive
                object={scene}
                scale={0.8}
            />
            <CuboidCollider
                args={[0.28, 0.15, 0.17]}
                position={[-0.02, 0.15, 0]}
                onCollisionEnter={handleCollisionEnter}
                onIntersectionEnter={handleIntersectionEnter}
            />
            {apples &&
                Object.values(apples)
                    .filter((apple) => apple.state === "carried" && apple.attachedSlot)
                    .map((apple) => (
                        <CarriedApple
                            key={apple.id}
                            id={apple.id}
                            ref={(object) => {
                                if (object) {
                                    appleRefs.current[apple.id] = object;
                                } else {
                                    delete appleRefs.current[apple.id];
                                }
                            }}
                        />
                    ))}
        </RigidBody>
    );
}
