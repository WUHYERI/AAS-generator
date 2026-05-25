import { create } from 'zustand';
import type {
  AASEnvironment,
  AssetAdministrationShell,
  Submodel,
  SubmodelElement,
} from '../types/AAS'; // 경로에 맞게 수정

export type AasNode = AssetAdministrationShell | Submodel | SubmodelElement;

interface AASState {
  // 백엔드에서 받아온 전체 AAS JSON 데이터 환경 (트리 전체 소스)
  aasEnvironment: AASEnvironment | null;
  setAasEnvironment: (env: AASEnvironment | null) => void;

  // 현재 트리에서 사용자가 선택한 노드
  selectedAASNode: AasNode | null;
  setSelectedAASNode: (node: AasNode | null) => void;

  // 디테일 에딧 폼에서 수정 버튼을 눌렀을 때, 트리 내의 해당 데이터를 실시간 동기화하는 함수
  updateAASNode: (updatedNode: AasNode) => void;
}

export const useAASStore = create<AASState>((set) => ({
  aasEnvironment: null,
  setAasEnvironment: (env) => set({ aasEnvironment: env }),

  selectedAASNode: null,
  setSelectedAASNode: (node) => set({ selectedAASNode: node }),

  updateAASNode: (updatedNode) =>
    set((state) => {
      if (!state.aasEnvironment) return {};

      // 불변성을 유지하며 깊은 트리 노드를 수정하는 재귀 도우미 함수
      const updateSubmodelElements = (
        elements: SubmodelElement[],
        targetNode: AasNode,
      ): SubmodelElement[] => {
        return elements.map((el) => {
          // idShort가 같고 모델타입이 같으면 교체 (동일 계층 내 식별)
          if (el.idShort === targetNode.idShort && el.modelType === targetNode.modelType) {
            return targetNode as SubmodelElement;
          }
          // Collection 폴더 하위라면 재귀적으로 자식 탐색 수행
          if (el.modelType === 'SubmodelElementCollection' && el.value) {
            return {
              ...el,
              value: updateSubmodelElements(el.value, targetNode),
            };
          }
          return el;
        });
      };

      // 최상위 Environment 데이터 복제 및 갱신 시작
      let nextShells = state.aasEnvironment.assetAdministrationShells
        ? [...state.aasEnvironment.assetAdministrationShells]
        : [];
      let nextSubmodels = state.aasEnvironment.submodels ? [...state.aasEnvironment.submodels] : [];

      // 수정된 노드가 Submodel인 경우
      if (updatedNode.modelType === 'Submodel') {
        nextSubmodels = nextSubmodels.map((sm) =>
          sm.id === updatedNode.id ? (updatedNode as Submodel) : sm,
        );
        // 만약 AAS 쉘 내부에 submodels가 객체 형태로 중첩되어 들어있는 기존 구조를 수용한다면 쉘 내부도 갱신
      }
      // 수정된 노드가 하부 엘리먼트(Property, File 등)인 경우
      else {
        // 최상위 독립 Submodels 순회하며 하부 트리 갱신
        nextSubmodels = nextSubmodels.map((sm) => ({
          ...sm,
          submodelElements: sm.submodelElements
            ? updateSubmodelElements(sm.submodelElements, updatedNode)
            : [],
        }));

        // AAS 쉘 내부에 중첩된 Submodels 트리도 똑같이 갱신
        nextShells = nextShells.map((shell) => ({
          ...shell,
          submodels: shell.submodels?.map((sm) => ({
            ...sm,
            submodelElements: sm.submodelElements
              ? updateSubmodelElements(sm.submodelElements, updatedNode)
              : [],
          })),
        }));
      }

      // 선택된 현재 노드 상태도 실시간으로 수정본 반영
      const isSelectedNodeUpdated =
        state.selectedAASNode &&
        state.selectedAASNode.idShort === updatedNode.idShort &&
        state.selectedAASNode.modelType === updatedNode.modelType;

      return {
        aasEnvironment: {
          ...state.aasEnvironment,
          assetAdministrationShells: nextShells,
          submodels: nextSubmodels,
        },
        selectedAASNode: isSelectedNodeUpdated ? updatedNode : state.selectedAASNode,
      };
    }),
}));
