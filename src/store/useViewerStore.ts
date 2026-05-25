import { create } from 'zustand';

interface ViewerState {
  selectedNodeName: string | null;
  isModelLoaded: boolean;

  // 부품별 각도를 관리하는 객체 형태 { "PR44_F01_WEB_ASM": 130, "다른부품": 45 }
  rotationAnglesX: Record<string, number>;
  rotationAnglesY: Record<string, number>;

  setSelectedNodeName: (name: string | null) => void;
  setIsModelLoaded: (status: boolean) => void;

  // 특정 부품의 각도를 업데이트하는 액션
  setRotationAngleX: (nodeName: string, angle: number) => void;
  setRotationAngleY: (nodeName: string, angle: number) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  selectedNodeName: null,
  isModelLoaded: false,
  rotationAnglesX: {},
  rotationAnglesY: {},

  setSelectedNodeName: (name) => set({ selectedNodeName: name }),
  setIsModelLoaded: (status) => set({ isModelLoaded: status }),

  setRotationAngleX: (nodeName, angle) =>
    set((state) => ({
      rotationAnglesX: { ...state.rotationAnglesX, [nodeName]: angle },
    })),
  setRotationAngleY: (nodeName, angle) =>
    set((state) => ({
      rotationAnglesY: { ...state.rotationAnglesY, [nodeName]: angle },
    })),
}));
