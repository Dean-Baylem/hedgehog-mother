import { RigidBody } from "@react-three/rapier";
import { useGameStore } from "../../store/gameStore";
import { useRef, useEffect } from "react";

export default function Apple({id}: {id: number}) {
    const apple = useGameStore((state) => state.apples[id]);
    if (!apple) return null;

    const ref = useRef<any>(null);

    useEffect(() => {
        if (!ref.current || !apple) return;
        const body = ref.current;

        switch (apple.state) {
            case "falling":
                body.setBodyType(0, true);
                requestAnimationFrame(() => {
                    const angle = Math.random() * Math.PI * 2;
                    const strength = 0.01;
                    body.applyImpulse({ x: Math.cos(angle) * strength, y: 0, z: Math.sin(angle) * strength }, true);
                });
                break;
            case "attached":
                body.setBodyType(2, true);
                break;
        }
    }, [apple?.state]);

    return (
        <RigidBody
            type="fixed"
            position={apple.anchorPos}
            userData={{ type: "apple", appleId: id }}
            ref={ref}
            gravityScale={0.2}
        >
            <mesh castShadow>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="red" />
            </mesh>
        </RigidBody>
    );
}