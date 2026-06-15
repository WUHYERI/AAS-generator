import { create } from 'zustand';

// 파일 분류를 위한 카테고리 타입 추가
export type FileCategory = 'documents' | 'models' | 'images';

export type ManualInput = {
  assetName: string;
  manufacturer: string;
  modelNumber: string;
  assetType: string;
  additionalNotes: string;
};

type UploadStore = {
  // files 구조를 배열에서 카테고리별 객체 구조로 변경
  files: {
    documents: File[];
    models: File[];
    images: File[];
  };
  manualInput: ManualInput;
  // 3. 카테고리를 지정해서 제어할 수 있도록 액션(함수)들 수정
  addFiles: (category: FileCategory, files: File[]) => void;
  removeFile: (category: FileCategory, index: number) => void;
  clearCategory: (category: FileCategory) => void; // 특정 카테고리만 비우기
  clearAllFiles: () => void; // 전체 파일 한 번에 비우기
  updateManualInput: (input: Partial<ManualInput>) => void;
};

export const useUploadStore = create<UploadStore>((set) => ({
  // 초기 상태도 카테고리별로 빈 배열 세팅
  files: {
    documents: [],
    models: [],
    images: [],
  },
  manualInput: {
    assetName: '',
    manufacturer: '',
    modelNumber: '',
    assetType: '',
    additionalNotes: '',
  },

  // 특정 카테고리에 파일 추가
  addFiles: (category, newFiles) =>
    set((state) => ({
      files: {
        ...state.files,
        [category]: [...state.files[category], ...newFiles],
      },
    })),

  // 특정 카테고리의 특정 인덱스 파일 삭제
  removeFile: (category, index) =>
    set((state) => ({
      files: {
        ...state.files,
        [category]: state.files[category].filter((_, i) => i !== index),
      },
    })),

  // 특정 카테고리만 초기화
  clearCategory: (category) =>
    set((state) => ({
      files: {
        ...state.files,
        [category]: [],
      },
    })),

  // 모든 카테고리 파일 전체 초기화
  clearAllFiles: () =>
    set(() => ({
      files: {
        documents: [],
        models: [],
        images: [],
      },
    })),

  // 수동 입력 데이터 업데이트
  updateManualInput: (input) =>
    set((state) => ({
      manualInput: {
        ...state.manualInput,
        ...input,
      },
    })),
}));
