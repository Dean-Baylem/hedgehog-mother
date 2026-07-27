import { RigidBody } from "@react-three/rapier";
import { useGameStore } from "../../store/gameStore";
import { useRef, useState } from "react";

export default function Apple({id}: {id: number}) {
    const apple = useGameStore((state) => state.apples[id]);
    if (!apple) return null;

    const ref = useRef<any>(null);

    return (
        <RigidBody type={apple.state === 'falling' || apple.state === 'floor' ? 'dynamic' : apple.state === 'carried' ? 'kinematicPosition' : 'fixed'}>
            <mesh position={apple.anchorPos}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="red" />
            </mesh>
        </RigidBody>
    );
}