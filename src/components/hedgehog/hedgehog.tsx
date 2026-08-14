import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useControls } from "leva";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import type { RapierRigidBody, CollisionPayload } from "@react-three/rapier";
import { useGameStore } from "../../store/gameStore";
import Apple from "../apple/Apple";
import CarriedApple from "../apple/CarriedApple";

const appleSlots: [number, number, number][] = [
    [0.06, 0.28, 0.08],
    [-0.03, 0.3, -0.09],
    [-0.14, 0.25, 0.08],
    [-0.23, 0.25, -0.03],
];

export default function Hedgehog() {
    const { scene } = useGLTF("/models/hedgehog/hedgehog.glb");
    const hedgehogRef = useRef<RapierRigidBody>(null);
    const appleRefs = useRef<Record<number, THREE.Mesh>>({});
    const { closeTreeId, hitTree, apples, attachAppleToHedgehog, applesSwitchCarriedToDelivered } = useGameStore();

    // Hedgehog Details
    const rotationY = useRef(0);
    const quaternion = useRef(new THREE.Quaternion());
    const direction = useRef(new THREE.Vector3());
    const velocity = useRef(new THREE.Vector3());
    const currentPosition = useRef(new THREE.Vector3());

    // Camera Details
    const { offsetX, offsetY, offsetZ } = useControls("CameraOffset", {
        offsetX: { value: -3, min: -10, max: 10, step: 0.1 },
        offsetY: { value: 1.0, min: -10, max: 10, step: 0.1 },
        offsetZ: { value: 0, min: -10, max: 10, step: 0.1 },
    });
    const cameraOffset = new THREE.Vector3(offsetX, offsetY, offsetZ);
    const desiredPosition = new THREE.Vector3();

    // Keyboard
    const [subscribe, get] = useKeyboardControls();

    const isFacingTree = (treeId: number) => {
        const tree = useGameStore.getState().trees[treeId];
        if (!tree) return false;

        const hedgehogPosition = hedgehogRef.current?.translation();
        if (!hedgehogPosition) return false;

        const treePosition = new THREE.Vector3(...tree.position);
        const directionToTree = treePosition.clone().sub(hedgehogPosition).normalize();
        const hedgehogDirection = new THREE.Vector3(1, 0, 0).applyQuaternion(hedgehogRef.current?.rotation() || new THREE.Quaternion());

        return directionToTree.dot(hedgehogDirection) > 0.8;
    };

    /**
     * Attempt to hit the closest tree.
     */
    const attemptTreeHit = () => {
        const tree = useGameStore.getState().trees[closeTreeId];

        if (!tree) return false;

        const hitSuccessful = isFacingTree(closeTreeId);

        if (hitSuccessful) {
            console.log(`Hit tree ${closeTreeId}`);
            hitTree(closeTreeId);
        } else {
            console.log("Not facing the tree, cannot hit.");
        }

        return hitSuccessful;
    };

    /**
     * Keyboard subscription to listen for the "hit" action and attempt to hit the closest tree when pressed.
     */
    useEffect(() => {
        const unsubscribe = subscribe(
            (state) => state.hit,
            (pressed) => {
                if (pressed) {
                    attemptTreeHit();
                }
            },
        );

        return unsubscribe;
    }, [subscribe, closeTreeId]);

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
        // const t = hedgehogRef.current.translation();
        // currentPosition.current.set(t.x, t.y, t.z);
        // desiredPosition.copy(cameraOffset).applyQuaternion(quaternion.current).add(currentPosition.current);
        // state.camera.position.lerp(desiredPosition, 5 * delta);
        // state.camera.lookAt(currentPosition.current);
    });

    // Handle The collisions between the hedgehog and the apples.
    const handleCollisionEnter = (event: CollisionPayload) => {
        const carriedCount = Object.values(apples).filter((apple) => apple.state === "carried").length;
        if (carriedCount >= appleSlots.length) return;

        const otherBody = event.other.rigidBodyObject;

        if (!otherBody) return;

        const userData = otherBody.userData;
        if (userData.type === "apple" && userData.appleId) {
            attachAppleToHedgehog(userData.appleId, appleSlots[carriedCount]);
        }
    };

    const handleIntersectionEnter = (event: CollisionPayload) => {
        const otherBody = event.other.rigidBodyObject;

        if (!otherBody) return;

        const userData = otherBody.userData as { type: string };
        if (userData.type !== "burrow") return;

        console.log("Entered the burrow area");

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
