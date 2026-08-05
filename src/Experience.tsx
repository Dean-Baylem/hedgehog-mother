import { OrbitControls } from "@react-three/drei";
import Hedgehog from "./components/hedgehog/hedgehog";
import Tree from "./components/tree/Tree";
import { useGameStore } from "./store/gameStore";
import Apple from "./components/apple/Apple";
import { Physics, RigidBody } from "@react-three/rapier";

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
                <RigidBody
                    type="fixed"
                    userData={{ type: "floor" }}
                >
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
                <Tree
                    id={2}
                    position={[4, 0, 1]}
                />
                {/* Apples */}
                {Object.values(apples)
                    .filter((apple) => apple.state === "attached" || apple.state === "falling" || apple.state === "floor")
                    .map((apple) => (
                        <Apple
                            key={apple.id}
                            id={apple.id}
                        />
                    ))}
            </Physics>
        </>
    );
}
