// 1. 공통 기본 타입
export interface Referable {
  idShort: string;
  category?: string;
}

// 2. 각 요소별 상세 타입 정의
export interface Property extends Referable {
  modelType: 'Property';
  value?: string;
  valueType: string;
}

export interface AasFile extends Referable {
  modelType: 'File';
  value?: string;
  contentType: string;
}

export interface Range extends Referable {
  modelType: 'Range';
  min?: string;
  max?: string;
  valueType: string;
}

// 3. 재귀적 구조 (Collection 안에 또 다른 요소들이 들어갈 수 있음)
export interface SubmodelElementCollection extends Referable {
  modelType: 'SubmodelElementCollection';
  value: SubmodelElement[]; // 재귀적 정의
}

// 4. 모든 요소를 포함하는 유니온 타입 (Discriminated Union)
export type SubmodelElement = Property | AasFile | Range | SubmodelElementCollection;

// 5. 상위 구조 정의
export interface Submodel extends Referable {
  submodelElements: SubmodelElement[];
}

export interface AssetAdministrationShell extends Referable {
  id: string;
  submodels: Submodel[];
}

/** * 백엔드 전체 응답 구조
 * any를 사용했던 부분을 Record나 구체적인 타입으로 대체
 */
export interface AasPipelineResponse {
  asset_package: Record<string, unknown>; // any 대신 Record 사용
  semantic_nodes: Record<string, unknown>[];
  aas_json: {
    assetAdministrationShells: AssetAdministrationShell[];
    submodels: Submodel[];
    conceptDescriptions?: Record<string, unknown>[];
  };
  aas_validation: {
    is_valid: boolean;
    errors: string[];
  };
}
