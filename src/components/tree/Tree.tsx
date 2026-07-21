import { useGLTF } from "@react-three/drei";
import { useMemo, useRef, useEffect } from "react";
import React from "react";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";


export default function Tree({id}: {id: number}) {
    const { nodes } = useGLTF("/models/trees/tree1.glb");
    const trunk = nodes.CommonTree_2.children[0] as THREE.Mesh;
    const leaves = nodes.CommonTree_2.children[1] as THREE.Mesh;

    const registerTree = useGameStore((state) => state.registerTree);
    const unregisterTree = useGameStore((state) => state.unregisterTree);

    const attachPositions = useMemo(() => {
        const sampler = new MeshSurfaceSampler(leaves).build();
        return Array.from({length: Math.floor(Math.random() * 4) + 1}, (_, i) => i).map(() => {
            const v = new THREE.Vector3();
            sampler.sample(v);
            return v;
        })
    }, [leaves]);

    const attachRefs = useRef(attachPositions.map(() => React.createRef<THREE.Object3D>()));

    useEffect(() => {
        registerTree(
            id,
            attachPositions.map((_, index) => ({
                id: index,
                ref: attachRefs.current[index],
            }))
        )
    }, []);

    return (
        <group scale={0.4}>
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
            {attachPositions.map((_, index) => {
                const attachPoint = attachPositions[index];
                const attachRef = attachRefs.current[index];
                return (
                    <group
                        key={`tree-${id}-attach-${index}`}
                        position={attachPoint}
                        ref={attachRef}
                    />
                );
            })}
        </group>
    );
}