import { create } from 'zustand';
import axios from 'axios';
import type {
  AasEnvironment,
  AssetAdministrationShell,
  Submodel,
  SubmodelElement,
  AasNode,
} from '../types/AAS';

export interface AasDescriptor {
  idShort: string;
  id: string;
  assetKind: string;
  assetType?: string;
  submodels?: Submodel[];
}

interface AasState {
  aasEnvironment: AasEnvironment | null;
  setAasEnvironment: (env: AasEnvironment | null) => void;
  selectedAasNode: AasNode | null;
  setSelectedAasNode: (node: AasNode | null) => void;
  updateAasNode: (updatedNode: AasNode) => void;
  aasList: AasDescriptor[];
  isLoading: boolean;
  listError: string | null;
  fetchAasLines: (registryUrl: string) => Promise<void>;
}

export const useAasStore = create<AasState>((set) => ({
  aasEnvironment: null,
  setAasEnvironment: (env) => set({ aasEnvironment: env }),
  selectedAasNode: null,
  setSelectedAasNode: (node) => set({ selectedAasNode: node }),
  aasList: [],
  isLoading: false,
  listError: null,

  // FastAPI 중계를 통한 AAS 목록 조회
  fetchAasLines: async (registryUrl) => {
    set({ isLoading: true, listError: null });
    try {
      const response = await axios.get('http://localhost:8000/api/aas-list', {
        params: { registryUrl },
      });

      // BaSyx v3.0 레지스트리 표준 구조({ result: [...] }) 대응 파싱
      const list = response.data.result || response.data || [];
      set({ aasList: list });
    } catch (err: unknown) {
      console.error('FastAPI AAS List Fetch Error:', err);

      let errorMsg = 'AAS 목록을 불러오지 못했습니다.';

      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      set({ listError: errorMsg });
    } finally {
      set({ isLoading: false });
    }
  },

  updateAasNode: (updatedNode) =>
    set((state) => {
      if (!state.aasEnvironment) return {};

      const updateSubmodelElements = (
        elements: SubmodelElement[],
        targetNode: AasNode,
      ): SubmodelElement[] => {
        return elements.map((el) => {
          if (el.idShort === targetNode.idShort && el.modelType === targetNode.modelType) {
            return targetNode as SubmodelElement;
          }
          if (el.modelType === 'SubmodelElementCollection' && el.value) {
            return {
              ...el,
              value: updateSubmodelElements(el.value, targetNode),
            };
          }
          return el;
        });
      };

      let nextShells = state.aasEnvironment.assetAdministrationShells
        ? [...state.aasEnvironment.assetAdministrationShells]
        : [];
      let nextSubmodels = state.aasEnvironment.submodels ? [...state.aasEnvironment.submodels] : [];

      if (updatedNode.modelType === 'AssetAdministrationShell') {
        nextShells = nextShells.map((shell) =>
          shell.id === updatedNode.id ? (updatedNode as AssetAdministrationShell) : shell,
        );
      } else if (updatedNode.modelType === 'Submodel') {
        nextSubmodels = nextSubmodels.map((sm) =>
          sm.id === updatedNode.id ? (updatedNode as Submodel) : sm,
        );
      } else {
        nextSubmodels = nextSubmodels.map((sm) => ({
          ...sm,
          submodelElements: sm.submodelElements
            ? updateSubmodelElements(sm.submodelElements, updatedNode)
            : [],
        }));

        nextShells = nextShells.map((shell) => ({
          ...shell,
          submodels: shell.submodels?.map((sm) => {
            if (!('submodelElements' in sm)) return sm;

            return {
              ...sm,
              submodelElements: sm.submodelElements
                ? updateSubmodelElements(sm.submodelElements, updatedNode)
                : [],
            };
          }),
        }));
      }

      const isSelectedNodeUpdated =
        state.selectedAasNode &&
        state.selectedAasNode.idShort === updatedNode.idShort &&
        state.selectedAasNode.modelType === updatedNode.modelType;

      return {
        aasEnvironment: {
          ...state.aasEnvironment,
          assetAdministrationShells: nextShells,
          submodels: nextSubmodels,
        },
        selectedAasNode: isSelectedNodeUpdated ? updatedNode : state.selectedAasNode,
      };
    }),
}));
