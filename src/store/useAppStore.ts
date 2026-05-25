import { create } from 'zustand';

type AppStep = 'upload' | 'generating' | 'edit';

interface AppStore {
  step: AppStep;
  setStep: (step: AppStep) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  step: 'upload',
  setStep: (step) => set({ step }),
}));
