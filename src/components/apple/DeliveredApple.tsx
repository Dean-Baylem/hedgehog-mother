import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function DeliveredApple({id, position}: { id: number, position: [number, number, number] }) {
    const ref = useRef<any>(null);
    useEffect(() => {
        if (!ref.current) return;

        requestAnimationFrame(() => {
            const target = new THREE.Vector3(0, 0, -5);
            const current = ref.current.translation();
            const direction = target.sub(new THREE.Vector3(current.x, current.y, current.z)).normalize();
            const strength = 0.02;
            ref.current.applyImpulse({
                x: direction.x * strength,
                y: direction.y * strength,
                z: direction.z * strength
            }, true);
        });       
    }, [])

    return (
        <RigidBody
            key={`deliveredApple-${id}`}
            type="dynamic"
            position={[...position]}
            ref={ref}
            ccd
        >
            <mesh>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="green" />
            </mesh>
        </RigidBody>
    );
}
