import { OrbitControls } from "@react-three/drei";
import Hedgehog from "./components/hedgehog/hedgehog";
import Tree from "./components/tree/Tree";
import { useGameStore } from "./store/gameStore";
import Apple from "./components/apple/Apple";
import { Physics, RigidBody } from "@react-three/rapier";
import Burrow from "./components/burrow/Burrow";

export default function Experience() {
    const apples = useGameStore((state) => state.apples);

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
                castShadow
                position={[5, 15, 5]}
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />
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
                    position={[5, 0, 5]}
                />
                <Tree
                    id={2}
                    position={[3, 0, -1]}
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
                {/* Burrow */}
                <Burrow position={[0, 0, -5]} />
            </Physics>
        </>
    );
}
