export type AASNode = AssetAdministrationShell | Submodel | SubmodelElement;

// ==========================================
// Base Types
// ==========================================

export interface LangString {
  language: string;
  text: string;
}

export interface Reference {
  submodelElements: SubmodelElement[];
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

// ==========================================
// Referable
// ==========================================

export interface Referable {
  idShort: string;

  category?: string;

  description?: LangString[];

  displayName?: LangString[];
}

// ==========================================
// Identifiable
// ==========================================

export interface Identifiable extends Referable {
  id: string;
}

// ==========================================
// Submodel Element Base
// ==========================================

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

// ==========================================
// Primitive Elements
// ==========================================

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

// ==========================================
// Collection
// ==========================================

export interface SubmodelElementCollection extends BaseSubmodelElement {
  modelType: 'SubmodelElementCollection';

  value?: SubmodelElement[];
}

// ==========================================
// Operation
// ==========================================

export interface Operation extends BaseSubmodelElement {
  modelType: 'Operation';
}

// ==========================================
// Union
// ==========================================

export type SubmodelElement =
  | Property
  | MultiLanguageProperty
  | Range
  | AasFile
  | BlobElement
  | Operation
  | SubmodelElementCollection;

// ==========================================
// Submodel
// ==========================================

export interface Submodel extends Identifiable {
  modelType: 'Submodel';

  kind?: 'Instance' | 'Template';

  submodelElements?: SubmodelElement[];
}

// ==========================================
// AAS
// ==========================================

export interface AssetAdministrationShell extends Identifiable {
  modelType: 'AssetAdministrationShell';

  assetInformation?: {
    assetKind?: 'Instance' | 'Type';
    globalAssetId?: string;
  };

  submodels?: Reference[];
}

export interface UITreeAAS extends AssetAdministrationShell {
  submodelNodes?: Submodel[];
}

// ==========================================
// Environment
// ==========================================

export interface AASEnvironment {
  assetAdministrationShells?: AssetAdministrationShell[];

  submodels?: Submodel[];

  conceptDescriptions?: unknown[];
}

// ==========================================
// Backend Response
// ==========================================

export interface AasPipelineResponse {
  asset_package: Record<string, unknown>;

  semantic_nodes: Record<string, unknown>[];

  aas_json: AASEnvironment;

  aas_validation: {
    is_valid: boolean;

    errors: string[];
  };
}
