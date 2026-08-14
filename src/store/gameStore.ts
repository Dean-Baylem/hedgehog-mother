import { create } from "zustand";
import * as THREE from "three";

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
    closeTreeId: number;
    registerTree: (id: number, position: [number, number, number]) => void;
    setCloseTreeId: (id: number) => void;
    hitTree: (treeId: number) => void;

    // Apples
    apples: Record<number, Apple>;
    nextAppleId: number;
    registerApple: (treeId: number, anchorPos: [number, number, number]) => void;
    updateAppleState: (appleId: number, newState: Apple["state"]) => void;
    attachAppleToHedgehog: (appleId: number, position: [number, number, number]) => void;
    applesSwitchCarriedToDelivered: (appleRefs: Record<number, THREE.Mesh>) => void;
}

export const useGameStore = create<GameStore>((set) => ({
    // Trees
    trees: {},
    closeTreeId: 0,
    registerTree: (id, position) =>
        set((state) => {
            if (state.trees[id]) return state;

            return {
                trees: {
                    ...state.trees,
                    [id]: { id, position },
                },
            };
        }),

    setCloseTreeId: (id: number) => set({ closeTreeId: id }),
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
            const id = state.nextAppleId;
            return {
                nextAppleId: id + 1,
                apples: { ...state.apples, [id]: { id, treeId, anchorPos, state: "attached", appleColor: "red" } },
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
