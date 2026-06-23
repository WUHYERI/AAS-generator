import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronDown, ChevronUp, Clock3, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import ManualInputForm from '../components/upload/manualInputForm';
import UploadZone from '../components/upload/uploadFilesZone';
import { useUploadStore } from '../store/useUploadStore';
import { useAasApi } from '../hooks/useAasApi';

export default function UploadPage() {
  const navigate = useNavigate();
  const { files, manualInput, clearAllFiles } = useUploadStore();
  const { generateAas, loading, error, progress, checkProgress } = useAasApi();
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  const handleGenerateAAS = async () => {
    setIsProgressOpen(true);
    try {
      const formData = new FormData();

      // Form Data Assembly
      files.documents.forEach((file) => formData.append('documents', file));
      files.models.forEach((file) => formData.append('models', file));
      files.images.forEach((file) => formData.append('images', file));

      formData.append('manualInput', JSON.stringify(manualInput));

      await generateAas(formData);
      clearAllFiles();
      navigate('/edit');
    } catch (e) {
      console.error('AAS 생성 오류:', e);
    }
  };

  return (
    <div className="h-auto w-full max-w-5xl mx-auto flex flex-col items-center gap-6">
      <UploadZone />

      <ManualInputForm />

      {error && (
        <div className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      {progress && (
        <div className="w-full rounded-xl border border-accent-line/60 bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setIsProgressOpen((open) => !open);
              void checkProgress();
            }}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-hover-light/40 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Activity size={16} className="text-accent" />
              생성 진척도 확인
              {loading && <RefreshCw size={13} className="animate-spin text-accent" />}
            </span>
            {isProgressOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isProgressOpen && (
            <div className="px-4 pb-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-subtext">{progress.message}</span>
                <span className="font-bold text-accent">{progress.percent}%</span>
              </div>
              <div
                className="h-2.5 rounded-full overflow-hidden bg-slate-100 border border-line/60"
                role="progressbar"
                aria-label="AAS 생성 진행률"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress.percent}
              >
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="flex items-center gap-1 text-[11px] text-subtext">
                <Clock3 size={12} />
                {progress.status === 'completed'
                  ? '생성 완료'
                  : progress.status === 'failed'
                    ? progress.error || '생성에 실패했습니다.'
                    : `남은 진행률 ${100 - progress.percent}%`}
              </p>
            </div>
          )}
        </div>
      )}

      <Button onClick={handleGenerateAAS} isGenerating={loading} disabled={loading}>
        AAS 생성
      </Button>
    </div>
  );
}
