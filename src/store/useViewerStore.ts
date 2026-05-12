import { create } from 'zustand';

interface ViewerState {
  rotationAngle: number;
  isModelLoaded: boolean;
  selectedNodeName: string | null; //

  setRotationAngle: (angle: number) => void;
  setIsModelLoaded: (status: boolean) => void;
  setSelectedNodeName: (name: string | null) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  rotationAngle: 0,
  isModelLoaded: false,
  selectedNodeName: null,

  setRotationAngle: (angle) => set({ rotationAngle: angle }),
  setIsModelLoaded: (status) => set({ isModelLoaded: status }),

  setSelectedNodeName: (name) => set({ selectedNodeName: name }),
}));
