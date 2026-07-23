import { useGLTF } from "@react-three/drei";
import { useMemo, useEffect } from "react";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";


export default function Tree({id, position}: {id: number, position: [number, number, number]}) {
    const { nodes } = useGLTF("/models/trees/tree1.glb");
    const trunk = nodes.CommonTree_2.children[0] as THREE.Mesh;
    const leaves = nodes.CommonTree_2.children[1] as THREE.Mesh;
    const { registerTree, registerApple } = useGameStore();

    // Create random apple positions
    const attachPositions = useMemo(() => {
        const sampler = new MeshSurfaceSampler(leaves).build();
        return Array.from({length: Math.floor(Math.random() * 4) + 1}, (_, i) => i).map(() => {
            const v = new THREE.Vector3();
            sampler.sample(v);
            v.multiplyScalar(0.5).add(new THREE.Vector3(...position));
            return v.toArray() as [number, number, number];
        });
    }, [leaves, position]);

    // Id & Position static for tree's lifetime.
    useEffect(() => {
        registerTree(id, position);
        console.log(`Attach Positions: ${attachPositions}`);
        attachPositions.forEach((pos) => {
            registerApple(id, pos);
        })
    }, []);

    return (
        <group position={position} scale={0.5}>
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
    );
}