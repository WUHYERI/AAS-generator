import { create } from 'zustand';

type BasyxStore = {
  connected: boolean;
  serverUrl: string;
  registryUrl: string;
  setConnected: (connected: boolean) => void;
  updateUrls: (urls: { serverUrl: string; registryUrl: string }) => void;
};

export const useBasyxStore = create<BasyxStore>((set) => ({
  connected: false, // 기본 연결 상태 오프라인
  serverUrl: 'http://localhost:4001',
  registryUrl: 'http://localhost:4000',

  setConnected: (connected) => set({ connected }),
  updateUrls: (urls) => set({ serverUrl: urls.serverUrl, registryUrl: urls.registryUrl }),
}));
