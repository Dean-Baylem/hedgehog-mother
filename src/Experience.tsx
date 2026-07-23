import { OrbitControls } from "@react-three/drei";
import Hedgehog from "./components/hedgehog/hedgehog";
import Tree from "./components/tree/Tree";
import { useGameStore } from "./store/gameStore";
import Apple from "./components/apple/Apple";

export default function Experience() {
    const apples = useGameStore((state) => state.apples);
    console.log("apple count:", Object.keys(apples).length, apples);
    return (
        <>
            // Lighting
            <ambientLight intensity={0.5} />
            // Controls
            <OrbitControls
                makeDefault
                minDistance={2}
                maxDistance={30}
                maxPolarAngle={Math.PI / 2}
                enableDamping
            />

            // Environment
            <mesh
                rotation-x={-Math.PI * 0.5}
                position-y={-0.01}
            >
                <planeGeometry args={[5, 5, 256, 256]} />
                <meshStandardMaterial
                    color="greenyellow"
                />
            </mesh>

            // Hedgehog
            <Hedgehog />

            // Tree
            <Tree id={1} position={[0, 0, 0]} />

            // Apples
            {Object.values(apples).map((apple) => (
                <Apple key={apple.id} id={apple.id} />
            ))}
        </>
    );
}
