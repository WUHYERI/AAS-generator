import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import ManualInputForm from '../components/upload/manualInputForm';
import UploadZone from '../components/upload/uploadFilesZone';
import { useUploadStore } from '../store/useUploadStore';
import { useAasApi } from '../hooks/useAasApi';

export default function UploadPage() {
  const navigate = useNavigate();
  const { files, manualInput, clearAllFiles } = useUploadStore();
  const { generateAas } = useAasApi();

  const handleGenerateAAS = async () => {
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
      alert('AAS 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="h-auto w-full max-w-5xl mx-auto flex flex-col items-center gap-6">
      <UploadZone />

      <ManualInputForm />

      <Button onClick={handleGenerateAAS} />
    </div>
  );
}
