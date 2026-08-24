import { RigidBody, BallCollider } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { Clone, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function DeliveredApple({id, position, burrowPosition, appleColor}: { id: number, position: [number, number, number], burrowPosition: [number, number, number], appleColor: string }) {
    const ref = useRef<any>(null);
    const { scene } = useGLTF(`/models/apples/apple-${appleColor}.glb`);

    useEffect(() => {
        if (!ref.current) return;

        requestAnimationFrame(() => {
            const target = new THREE.Vector3(...burrowPosition);
            const current = ref.current.translation();
            const direction = target.sub(new THREE.Vector3(current.x, current.y, current.z)).normalize();
            const strength = 0.02;
            console.log("mass:", ref.current.mass());
            console.log(`Pulse strength: ${strength}`);
            console.log("direction:", direction, "current:", current, "target:", burrowPosition);
            ref.current.applyImpulse({
                x: direction.x * strength,
                y: direction.y * strength,
                z: direction.z * strength
            }, true);
        });       
    }, [])

    useEffect(() => {
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        console.log("apple size:", size);
    }, [scene]);

    return (
        <RigidBody
            key={`deliveredApple-${id}`}
            type="dynamic"
            position={[...position]}
            ref={ref}
            ccd
            mass={1}
        >
            <Clone
                object={scene}
                receiveShadow
                castShadow
            />
            <BallCollider args={[0.1]} />
        </RigidBody>
    );
}
