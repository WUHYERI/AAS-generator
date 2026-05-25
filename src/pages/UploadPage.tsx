import Button from '../components/ui/Button';
import ManualInputForm from '../components/upload/manualInputForm';
import UploadZone from '../components/upload/uploadFilesZone';

function UploadPage() {
  return (
    <div className="h-screen flex flex-col items-center p-6 bg-slate-50 gap-5 overflow-auto">
      <UploadZone />
      <ManualInputForm />
      <Button />
    </div>
  );
}
export default UploadPage;
