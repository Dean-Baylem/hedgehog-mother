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
}

interface GameStore {
    // Trees
    trees: Record<number, Tree>;
    closeTreeId: number;
    registerTree: (id: number, position: [number, number, number]) => void;
    setCloseTreeId: (id: number) => void;

    // Apples
    apples: Record<number, Apple>;
    nextAppleId: number;
    registerApple: (treeId: number, anchorPos: [number, number, number]) => void;
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

    // Apples
    apples: {},
    nextAppleId: 1,
    registerApple: (treeId: number, anchorPos: [number, number, number]) =>
        set((state) => {
            const id = state.nextAppleId;
            return {
                nextAppleId: id + 1,
                apples: { ...state.apples, [id]: { id, treeId, anchorPos, state: "attached" } },
            };
        }),
}));

