import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2 } from 'lucide-react'; // Loader2 추가
import { useAppStore } from '../../store/useAppStore';

function UploadZone() {
  const files = useAppStore((state) => state.files);
  const addFiles = useAppStore((state) => state.addFiles);
  const removeFile = useAppStore((state) => state.removeFile);
  const clearFiles = useAppStore((state) => state.clearFiles);
  const setStep = useAppStore((state) => state.setStep);
  const step = useAppStore((state) => state.step); // 현재 상태 확인용

  const isGenerating = step === 'generating';

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      addFiles(acceptedFiles);
    },
    [addFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleGenerate = async () => {
    setStep('generating');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStep('edit');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Generate AAS</h1>
        <p className="text-subtext mb-8">Upload images and technical documents</p>

        {/* 드롭존 영역 */}
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
            ${
              isDragActive
                ? 'border-accent bg-hover-light'
                : 'border-line bg-surface hover:border-accent-line hover:bg-hover-light/50'
            }
          `}
        >
          <input {...getInputProps()} />

          <div className="pointer-events-none">
            <div
              className={`
                mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4
                ${isDragActive ? 'bg-accent' : 'bg-hover-light'}
              `}
            >
              <Upload
                className={`
                  w-8 h-8
                  ${isDragActive ? 'text-white' : 'text-accent-dark'}
                `}
              />
            </div>

            <p className={`${isDragActive ? 'text-accent-dark font-medium' : 'text-slate-600'}`}>
              {isDragActive ? 'Drop files here' : 'Drag files or click'}
            </p>

            <p className="text-sm text-slate-400 mt-2">PNG, JPG, PDF, DOCX</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Uploaded Files ({files.length})</h3>

              <button
                onClick={clearFiles}
                className="text-sm text-subtext hover:text-slate-700 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-line transition-all hover:border-accent-line/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-hover-light flex items-center justify-center">
                    <File className="w-5 h-5 text-accent-dark" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-slate-700 font-medium">{file.name}</p>
                    <p className="text-sm text-subtext">{formatFileSize(file.size)}</p>
                  </div>

                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-red-50 rounded-full transition-colors group"
                  >
                    <X className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            {/* 버튼 영역: 정하신 hover-dark 사용 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-6 px-6 py-3 bg-accent hover:bg-hover-dark text-white rounded-lg transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate AAS'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadZone;
