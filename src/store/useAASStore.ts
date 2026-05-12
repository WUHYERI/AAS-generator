import { create } from 'zustand';

interface AASState {
  selectedAASNode: string | null;
  setSelectedAASNode: (idShort: string | null) => void;
}

export const useAASStore = create<AASState>((set) => ({
  selectedAASNode: null,
  setSelectedAASNode: (idShort) => set({ selectedAASNode: idShort }),
}));
