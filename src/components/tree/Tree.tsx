import { useGLTF } from "@react-three/drei";
import { useMemo, useEffect, useRef } from "react";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";
import { RigidBody, CuboidCollider, CylinderCollider, type CollisionPayload } from "@react-three/rapier";

export default function Tree({id, position}: {id: number, position: [number, number, number]}) {
    const { nodes } = useGLTF("/models/trees/tree1.glb");
    const trunk = nodes.CommonTree_2.children[0] as THREE.Mesh;
    const leaves = nodes.CommonTree_2.children[1] as THREE.Mesh;
    const { registerTree, registerApple, setCloseTreeId } = useGameStore();
    const initialised = useRef(false);

    // Create random apple positions
    const attachPositions = useMemo(() => {
        const sampler = new MeshSurfaceSampler(leaves).build();
        return Array.from({length: Math.floor(Math.random() * 4) + 1}, (_, i) => i).map(() => {
            const v = new THREE.Vector3();
            sampler.sample(v);
            v.multiplyScalar(0.8).add(new THREE.Vector3(...position));
            return v.toArray() as [number, number, number];
        });
    }, [leaves, position]);

    // Id & Position static for tree's lifetime.
    useEffect(() => {
        registerTree(id, position);
        if (initialised.current) return;

        attachPositions.forEach((pos) => {
            registerApple(id, pos);
        });

        initialised.current = true;
    }, []);

    const handleIntersectionEnter = (event: CollisionPayload) => {
        const otherBody = event.other.rigidBodyObject;

        if (!otherBody) return;

        const userData = otherBody.userData as { type: string; treeId?: number };
        if (userData.type !== "hedgehog") return;

        setCloseTreeId(id);
    }

    const handleIntersectionExit = (event: CollisionPayload) => {
        const otherBody = event.other.rigidBodyObject;

        if (!otherBody) return;

        const userData = otherBody.userData as { type: string; treeId?: number };
        if (userData.type !== "hedgehog") return;
        setCloseTreeId(0);
    }

    return (
        <RigidBody
            type="fixed"
            colliders={false}
            userData={{ treeId: id }}
            position={position}
        >
            <group scale={0.8}>
                <mesh
                    geometry={trunk.geometry}
                    material={trunk.material}
                    position={trunk.position}
                    rotation={trunk.rotation}
                    scale={trunk.scale}
                />
                <mesh
                    geometry={leaves.geometry}
                    material={leaves.material}
                    position={leaves.position}
                    rotation={leaves.rotation}
                    scale={leaves.scale}
                />
            </group>
            <CuboidCollider
                name={`tree-sensor-${id}`}
                args={[1, 0.2, 1]}
                position={[0, 0.2, 0]}
                onIntersectionEnter={handleIntersectionEnter}
                onIntersectionExit={handleIntersectionExit}
                sensor
            />
            <CylinderCollider
                args={[0.1, 0.5]}
                position={[0, 0.1, 0]}
            />
        </RigidBody>
    );
}