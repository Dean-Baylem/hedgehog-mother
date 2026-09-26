import { create } from "zustand";
import * as THREE from "three";
import getRandomAppleColor from "../utils/getRandomAppleColor";
import generateTreePositions from "../utils/generateTreePositions";
import { BURROW_POSITION } from "../constants";

interface Tree {
    id: number;
    position: [number, number, number];
}

interface Apple {
    id: number;
    treeId: number;
    anchorPos: [number, number, number];
    state: "attached" | "falling" | "delivered" | "floor" | "carried";
    attachedSlot?: [number, number, number];
    appleColor: string;
    deliverStartPos?: THREE.Vector3;
}

interface GameStore {
    // Trees
    trees: Record<number, Tree>;
    hitTree: (treeId: number) => void;

    // Apples
    apples: Record<number, Apple>;
    nextAppleId: number;
    registerApple: (treeId: number, anchorPos: [number, number, number]) => void;
    updateAppleState: (appleId: number, newState: Apple["state"]) => void;
    attachAppleToHedgehog: (appleId: number, position: [number, number, number]) => void;
    applesSwitchCarriedToDelivered: (appleRefs: Record<number, THREE.Group>) => void;
}

const initialTrees: Record<number, Tree> = Object.fromEntries(
    generateTreePositions(24, 1.0, 0.4, 3, 1.2, [{ x: BURROW_POSITION[0], z: BURROW_POSITION[2], radius: 3 }]).map((position, id) => [
        id,
        { id, position },
    ]),
);

export const useGameStore = create<GameStore>((set) => ({
    // Trees
    trees: initialTrees,
    hitTree: (treeId: number) =>
        set((state) => {
            const apple = Object.values(state.apples).find((apple) => apple.treeId === treeId && apple.state === "attached");
            if (!apple) return state;
            return {
                apples: {
                    ...state.apples,
                    [apple.id]: {
                        ...apple,
                        state: "falling",
                    },
                },
            };
        }),

    // Apples
    apples: {},
    nextAppleId: 1,
    registerApple: (treeId: number, anchorPos: [number, number, number]) =>
        set((state) => {
            const color = getRandomAppleColor();
            const id = state.nextAppleId;
            return {
                nextAppleId: id + 1,
                apples: { ...state.apples, [id]: { id, treeId, anchorPos, state: "attached", appleColor: color } },
            };
        }),

    updateAppleState: (appleId: number, newState: Apple["state"]) =>
        set((state) => {
            const apple = state.apples[appleId];
            if (!apple) return state;
            return {
                apples: {
                    ...state.apples,
                    [appleId]: {
                        ...apple,
                        state: newState,
                    },
                },
            };
        }),
    attachAppleToHedgehog: (appleId: number, position: [number, number, number]) =>
        set((state) => {
            const apple = state.apples[appleId];
            if (!apple) return state;
            return {
                apples: {
                    ...state.apples,
                    [appleId]: {
                        ...apple,
                        state: "carried",
                        attachedSlot: position,
                    },
                },
            };
        }),

    applesSwitchCarriedToDelivered: (appleRefs) =>
        set((state) => {
            const apples = Object.values(state.apples).filter((apple) => apple.state === "carried");
            if (apples.length === 0) return state;

            return {
                apples: {
                    ...state.apples,
                    ...apples.reduce(
                        (acc, apple) => ({
                            ...acc,
                            [apple.id]: {
                                ...apple,
                                state: "delivered",
                                deliverStartPos: appleRefs[apple.id]?.getWorldPosition(new THREE.Vector3()),
                            },
                        }),
                        {},
                    ),
                },
            };
        }),
}));
