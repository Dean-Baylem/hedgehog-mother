import { create } from "zustand";
import * as THREE from "three";

interface AttachPoint {
    id: number;
    ref: React.RefObject<THREE.Object3D | null>;
}

interface GameStore {
    trees: Record<number, {id: number, attachPoints: AttachPoint[]}>;
    registerTree: (id: number, attachPoints: AttachPoint[]) => void;
    unregisterTree: (id: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
    trees: {},
    registerTree: (id, attachPoints) => set((state) => ({ trees: { ...state.trees, [id]: { id, attachPoints } } })),
    unregisterTree: (id) =>
        set((state) => {
            const { [id]: _, ...rest } = state.trees;
            return { trees: rest };
        }),
}));

