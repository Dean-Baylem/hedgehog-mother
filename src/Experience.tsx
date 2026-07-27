import { OrbitControls } from "@react-three/drei";
import Hedgehog from "./components/hedgehog/hedgehog";
import Tree from "./components/tree/Tree";
import { useGameStore } from "./store/gameStore";
import Apple from "./components/apple/Apple";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";

export default function Experience() {
    const apples = useGameStore((state) => state.apples);

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            {/* Controls */}
            <OrbitControls
                makeDefault
                minDistance={10}
                maxDistance={30}
                maxPolarAngle={Math.PI / 2}
                enableDamping
            />
            <Physics debug>
                {/* Floor */}
                <RigidBody type="fixed">
                    <mesh
                        receiveShadow
                        position-y={-0.25}
                    >
                        <boxGeometry args={[25, 0.5, 25]} />
                        <meshStandardMaterial color="greenyellow" />
                    </mesh>
                </RigidBody>
                {/* Hedgehog */}
                <Hedgehog />
                {/* Tree */}
                <Tree
                    id={1}
                    position={[1, 0, 1]}
                />
                {/* Apples */}
                {Object.values(apples).map((apple) => (
                    <Apple
                        key={apple.id}
                        id={apple.id}
                    />
                ))}
            </Physics>
        </>
    );
}
