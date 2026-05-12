import { create } from 'zustand';

export type ManualInput = {
  assetName: string;
  manufacturer: string;
  modelNumber: string;
  assetType: string;
  additionalNotes: string;
};

type UploadStore = {
  files: File[];
  manualInput: ManualInput;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  updateManualInput: (input: Partial<ManualInput>) => void;
};

export const useUploadStore = create<UploadStore>((set) => ({
  files: [],
  manualInput: {
    assetName: '',
    manufacturer: '',
    modelNumber: '',
    assetType: '',
    additionalNotes: '',
  },

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
