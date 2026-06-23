import { create } from 'zustand';
import axios from 'axios';
import { apiUrl } from '../lib/api';
import type {
  AasEnvironment,
  AssetAdministrationShell,
  Submodel,
  SubmodelElement,
  AasNode,
  AasMappingCandidate,
  AasMappingPlan,
} from '../types/AAS';

export interface AasDescriptor {
  resultId?: number;
  sourceUrl?: string;
  idShort: string;
  id: string;
  assetKind: string;
  assetType?: string;
  createdAt?: string;
  propertyCount?: number;
  submodels?: Submodel[];
}

interface AasState {
  aasEnvironment: AasEnvironment | null;
  setAasEnvironment: (env: AasEnvironment | null) => void;
  currentResultId: number | null;
  mappingPlan: AasMappingPlan | null;
  setAasResult: (env: AasEnvironment, resultId?: number, mappingPlan?: AasMappingPlan) => void;
  selectedAasNode: AasNode | null;
  setSelectedAasNode: (node: AasNode | null) => void;
  updateAasNode: (updatedNode: AasNode) => void;
  applyCandidateSelection: (mappingNodeId: string | undefined, candidate: AasMappingCandidate) => void;
  isSaving: boolean;
  saveError: string | null;
  saveAasResult: () => Promise<boolean>;
  aasList: AasDescriptor[];
  isLoading: boolean;
  listError: string | null;
  fetchAasLines: (registryUrl?: string) => Promise<void>;
  loadAasResult: (resultId?: number, sourceUrl?: string) => Promise<void>;
}

export const useAasStore = create<AasState>((set, get) => ({
  aasEnvironment: null,
  setAasEnvironment: (env) => set({ aasEnvironment: env }),
  currentResultId: null,
  mappingPlan: null,
  setAasResult: (env, resultId, mappingPlan) =>
    set({
      aasEnvironment: env,
      currentResultId: resultId ?? null,
      mappingPlan: mappingPlan ?? null,
      selectedAasNode: null,
    }),
  selectedAasNode: null,
  setSelectedAasNode: (node) => set({ selectedAasNode: node }),
  aasList: [],
  isLoading: false,
  listError: null,

  // FastAPI 중계를 통한 AAS 목록 조회
  fetchAasLines: async (registryUrl) => {
    set({ isLoading: true, listError: null });
    try {
      const response = await axios.get(apiUrl('/api/aas-list'), {
        params: registryUrl ? { registryUrl } : undefined,
      });

      // BaSyx v3.0 레지스트리 표준 구조({ result: [...] })와 로컬 백엔드 배열 응답 모두 대응
      const list = response.data.result || response.data || [];
      const backendList = Array.isArray(list) ? list : [];
      set({ aasList: backendList });
    } catch (err: unknown) {
      console.error('FastAPI AAS List Fetch Error:', err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail || err.message
        : err instanceof Error
          ? err.message
          : 'AAS 목록을 불러오지 못했습니다.';
      set({ aasList: [], listError: message });
    } finally {
      set({ isLoading: false });
    }
  },

  loadAasResult: async (resultId, sourceUrl) => {
    set({ isLoading: true, listError: null });
    try {
      if (!resultId && !sourceUrl) {
        throw new Error('불러올 AAS 결과가 지정되지 않았습니다.');
      }

      const response = sourceUrl
        ? await axios.get(sourceUrl)
        : await axios.get(apiUrl(`/api/results/${resultId}`));

      const environment = sourceUrl ? response.data : response.data.aas_json;
      set({
        aasEnvironment: environment,
        currentResultId: sourceUrl ? null : resultId ?? null,
        mappingPlan: sourceUrl ? null : response.data.mapping_plan ?? null,
        selectedAasNode: null,
      });
    } catch (err: unknown) {
      console.error('FastAPI AAS Result Fetch Error:', err);

      let errorMsg = 'AAS 결과를 불러오지 못했습니다.';

      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      set({ listError: errorMsg });
      throw err;
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
          if (el === state.selectedAasNode) {
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

      return {
        aasEnvironment: {
          ...state.aasEnvironment,
          assetAdministrationShells: nextShells,
          submodels: nextSubmodels,
        },
        selectedAasNode: updatedNode,
      };
    }),

  applyCandidateSelection: (mappingNodeId, candidate) => {
    const selectedNode = get().selectedAasNode;
    if (!selectedNode) return;

    const nextSemanticId = candidate.semanticId
      ? {
          type: 'ExternalReference',
          keys: [{ type: 'GlobalReference', value: candidate.semanticId }],
        }
      : 'semanticId' in selectedNode
        ? selectedNode.semanticId
        : undefined;

    get().updateAasNode({
      ...selectedNode,
      idShort: candidate.idShort,
      semanticId: nextSemanticId,
    } as AasNode);

    if (!mappingNodeId) return;
    set((state) => ({
      mappingPlan: state.mappingPlan
        ? {
            ...state.mappingPlan,
            submodels: state.mappingPlan.submodels?.map((submodel) => ({
              ...submodel,
              properties: submodel.properties?.map((property) =>
                property.semantic_node_id === mappingNodeId
                  ? {
                      ...property,
                      aas_property_id: candidate.candidate_id,
                      idShort: candidate.idShort,
                      semanticId: candidate.semanticId,
                      eclassIrdi: candidate.eclassIrdi,
                      matchDecision: 'user_selected',
                      reviewRequired: false,
                    }
                  : property,
              ),
            })),
          }
        : null,
    }));
  },

  isSaving: false,
  saveError: null,
  saveAasResult: async () => {
    const { currentResultId, aasEnvironment, mappingPlan } = get();
    if (!currentResultId || !aasEnvironment) return false;

    set({ isSaving: true, saveError: null });
    try {
      const response = await axios.put(apiUrl(`/api/results/${currentResultId}`), {
        aas_json: aasEnvironment,
        mapping_plan: mappingPlan,
      });
      set({ mappingPlan: response.data.mapping_plan ?? mappingPlan });
      return true;
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail || err.message
        : err instanceof Error
          ? err.message
          : 'AAS 변경사항을 저장하지 못했습니다.';
      set({ saveError: message });
      return false;
    } finally {
      set({ isSaving: false });
    }
  },
}));
