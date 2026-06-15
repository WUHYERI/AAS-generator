import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, FileText, Box, Image, type LucideIcon } from 'lucide-react';
import { useUploadStore, type FileCategory } from '../../store/useUploadStore';

const CATEGORIES: {
  id: FileCategory;
  title: string;
  desc: string;
  accept: Record<string, string[]>;
  icon: LucideIcon;
}[] = [
  {
    id: 'documents',
    title: '기술 문서',
    desc: 'PDF, DOCX, XLSX 등',
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    icon: FileText,
  },
  {
    id: 'models',
    title: '3D 모델링 파일',
    desc: 'STP, STEP, OBJ, STL 등',
    accept: { 'application/octet-stream': ['.stp', '.step', '.obj', '.stl'] },
    icon: Box,
  },
  {
    id: 'images',
    title: '기기 사진',
    desc: 'PNG, JPG, JPEG',
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    icon: Image,
  },
];

export default function UploadZone() {
  const files = useUploadStore((state) => state.files);
  const addFiles = useUploadStore((state) => state.addFiles);
  const removeFile = useUploadStore((state) => state.removeFile);
  const clearCategory = useUploadStore((state) => state.clearCategory);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">AAS 생성하기</h1>
        <p className="text-subtext mb-8">
          기술문서, 모델링파일, 기기사진을 각각 알맞은 칸에 업로드하세요
        </p>

        {/* Dropzone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex flex-col h-full">
              {/* Category Header */}
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <cat.icon className="w-4 h-4 text-accent-dark" />
                {cat.title}
              </h3>

              {/* Drop Area */}
              <SingleDropzone
                category={cat.id}
                desc={cat.desc}
                accept={cat.accept}
                onFilesDropped={(droppedFiles) => addFiles(cat.id, droppedFiles)}
              />

              {/* File List */}
              {files[cat.id]?.length > 0 && (
                <div className="mt-6 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500">
                      선택됨 ({files[cat.id].length})
                    </span>
                    <button
                      onClick={() => clearCategory(cat.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      비우기
                    </button>
                  </div>

                  <div className="space-y-2">
                    {files[cat.id].map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-2 p-3 bg-surface rounded-lg border border-line text-xs transition-all hover:border-accent-line/50"
                      >
                        <File className="w-4 h-4 text-accent-dark shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-slate-700 font-medium">{file.name}</p>
                          <p className="text-[10px] text-subtext">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          onClick={() => removeFile(cat.id, index)}
                          className="p-1 hover:bg-red-50 rounded-full transition-colors group"
                        >
                          <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SingleDropzoneProps {
  category: FileCategory;
  desc: string;
  accept: Record<string, string[]>;
  onFilesDropped: (files: File[]) => void;
}

function SingleDropzone({ desc, accept, onFilesDropped }: SingleDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesDropped(acceptedFiles);
    },
    [onFilesDropped],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex-1 flex flex-col justify-center items-center min-h-[160px]
        ${
          isDragActive
            ? 'border-accent bg-hover-light'
            : 'border-line bg-surface hover:border-accent-line hover:bg-hover-light/50'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="pointer-events-none flex flex-col items-center">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center mb-3
            ${isDragActive ? 'bg-accent text-white' : 'bg-hover-light text-accent-dark'}
          `}
        >
          <Upload className="w-5 h-5" />
        </div>

        <p
          className={`text-xs font-medium ${isDragActive ? 'text-accent-dark' : 'text-slate-600'}`}
        >
          {isDragActive ? '여기에 놓으세요' : '드래그 또는 클릭'}
        </p>

        <p className="text-[10px] text-slate-400 mt-1">{desc}</p>
      </div>
    </div>
  );
}
