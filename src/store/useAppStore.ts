import { create } from 'zustand';

type AppStep = 'upload' | 'generating' | 'edit';

type ManualInput = {
  assetName: string;

  manufacturer: string;

  modelNumber: string;

  assetType: string;

  additionalNotes: string;
};

type AppStore = {
  step: AppStep;

  files: File[];

  manualInput: ManualInput;

  setStep: (step: AppStep) => void;

  addFiles: (files: File[]) => void;

  removeFile: (index: number) => void;

  clearFiles: () => void;

  updateManualInput: (input: Partial<ManualInput>) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  step: 'upload',

  files: [],

  manualInput: {
    assetName: '',

    manufacturer: '',

    modelNumber: '',

    assetType: '',

    additionalNotes: '',
  },

  setStep: (step) =>
    set({
      step,
    }),

  addFiles: (newFiles) =>
    set((state) => ({
      files: [...state.files, ...newFiles],
    })),

  removeFile: (index) =>
    set((state) => ({
      files: state.files.filter((_, i) => i !== index),
    })),

  clearFiles: () =>
    set({
      files: [],
    }),

  updateManualInput: (input) =>
    set((state) => ({
      manualInput: {
        ...state.manualInput,
        ...input,
      },
    })),
}));
