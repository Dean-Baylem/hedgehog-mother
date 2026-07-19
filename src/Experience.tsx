import { OrbitControls } from "@react-three/drei";
import Hedgehog from "./components/hedgehog/hedgehog";

export default function Experience() {
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
        </>
    );
}
