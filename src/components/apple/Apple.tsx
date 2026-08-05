import { RigidBody } from "@react-three/rapier";
import { useGameStore } from "../../store/gameStore";
import { useRef, useEffect } from "react";
import type { CollisionPayload } from "@react-three/rapier";
import { useControls } from "leva";

export default function Apple({id}: {id: number}) {
    const apple = useGameStore((state) => state.apples[id]);
    const { updateAppleState } = useGameStore();
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
                    const strength = 0.005;
                    body.applyImpulse({ x: Math.cos(angle) * strength, y: 0, z: Math.sin(angle) * strength }, true);
                });
                break;
            case "attached":
                body.setBodyType(2, true);
                break;
        }
    }, [apple?.state]);

    const handleCollisionEnter = (event: CollisionPayload) => {
        const otherBody = event.other.rigidBodyObject;

        if (!otherBody) return;

        const userData = otherBody.userData;
        if (userData.type === "floor") {
            console.log(`Apple ${id} hit the floor`);
            updateAppleState(id, "floor");
        }
    }

    if (apple.state === "carried" && apple.attachedSlot) {
        return (
            <mesh position={[apple.attachedSlot[0], apple.attachedSlot[1], apple.attachedSlot[2]]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="red" />
            </mesh>
        );
    }

    return (
        <RigidBody
            type={apple.state === "falling" ? "dynamic" : "fixed"}
            position={apple.anchorPos}
            userData={{ type: "apple", appleId: id }}
            ref={ref}
            gravityScale={0.2}
            onCollisionEnter={handleCollisionEnter}
        >
            <mesh castShadow>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="red" />
            </mesh>
        </RigidBody>
    );
}