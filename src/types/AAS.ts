export type AasNode = AssetAdministrationShell | Submodel | SubmodelElement;

// 기본 공통 타입
export interface LangString {
  language: string;
  text: string;
}

export interface Reference {
  type: string;
  keys: {
    type: string;
    value: string;
  }[];
}

export interface Qualifier {
  type: string;
  valueType: string;
  value?: string;
}

// 참조 가능 객체 인터페이스
export interface Referable {
  idShort: string;
  category?: string;
  description?: LangString[];
  displayName?: LangString[];
}

// 식별 가능 객체 인터페이스
export interface Identifiable extends Referable {
  id: string;
}

// 서브모델 엘리먼트 기본 베이스
export type ModelType =
  | 'Property'
  | 'MultiLanguageProperty'
  | 'Range'
  | 'File'
  | 'Blob'
  | 'Operation'
  | 'SubmodelElementCollection'
  | 'Submodel'
  | 'AssetAdministrationShell';

export interface BaseSubmodelElement extends Referable {
  modelType: ModelType;
  semanticId?: Reference;
  qualifiers?: Qualifier[];
}

// 단일 값/원시 엘리먼트
export interface Property extends BaseSubmodelElement {
  modelType: 'Property';
  valueType: string;
  value?: string;
}

export interface MultiLanguageProperty extends BaseSubmodelElement {
  modelType: 'MultiLanguageProperty';
  value?: LangString[];
}

export interface Range extends BaseSubmodelElement {
  modelType: 'Range';
  valueType: string;
  min?: string;
  max?: string;
}

export interface AasFile extends BaseSubmodelElement {
  modelType: 'File';
  contentType: string;
  value?: string;
}

export interface BlobElement extends BaseSubmodelElement {
  modelType: 'Blob';
  contentType: string;
  value?: string;
}

// 컬렉션 그룹 엘리먼트
export interface SubmodelElementCollection extends BaseSubmodelElement {
  modelType: 'SubmodelElementCollection';
  value?: SubmodelElement[];
}

// 오퍼레이션 함수 엘리먼트
export interface Operation extends BaseSubmodelElement {
  modelType: 'Operation';
}

// 서브모델 엘리먼트 유니온 타입
export type SubmodelElement =
  | Property
  | MultiLanguageProperty
  | Range
  | AasFile
  | BlobElement
  | Operation
  | SubmodelElementCollection;

// 서브모델 구조
export interface Submodel extends Identifiable {
  modelType: 'Submodel';
  kind?: 'Instance' | 'Template';
  submodelElements?: SubmodelElement[];
}

// 자산 관리 쉘 구조
export interface AssetAdministrationShell extends Identifiable {
  modelType: 'AssetAdministrationShell';
  assetInformation?: {
    assetKind?: 'Instance' | 'Type';
    globalAssetId?: string;
  };
  submodels?: (Reference | Submodel)[];
}

export interface UITreeAas extends AssetAdministrationShell {
  submodelNodes?: Submodel[];
}

// AAS 환경 및 파일 구조
export interface AasEnvironment {
  assetAdministrationShells?: AssetAdministrationShell[];
  submodels?: Submodel[];
  conceptDescriptions?: unknown[];
}

export interface AasMappingCandidate {
  candidate_id: string;
  idShort: string;
  submodel?: string;
  source?: string;
  score?: number;
  semanticId?: string;
  eclassIrdi?: string;
  reason?: string;
}

export interface AasMappingProperty {
  semantic_node_id?: string;
  aas_property_id?: string;
  idShort: string;
  semanticId?: string;
  eclassIrdi?: string;
  submodel?: string;
  matchDecision?: string;
  reviewRequired?: boolean;
  candidateSuggestions?: AasMappingCandidate[];
}

export interface AasMappingPlan {
  submodels?: Array<{
    idShort: string;
    properties?: AasMappingProperty[];
  }>;
  reviewQueue?: Array<Record<string, unknown>>;
  generationStatus?: string;
}

// 백엔드 파이프라인 응답 구조
export interface AasPipelineResponse {
  asset_package: Record<string, unknown>;
  semantic_nodes: Record<string, unknown>[];
  aas_json: AasEnvironment;
  aas_validation: {
    is_valid: boolean;
    errors: string[];
  };
}
