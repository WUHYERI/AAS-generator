import AasDetailEditor from '../components/edit/AASDetailEditor';
import AasTree from '../components/edit/AASTree';
import ModelViewer from '../components/edit/ModelViewer';

export default function EditPage() {
  return (
    <div className="h-full flex flex-row items-center p-6 bg-slate-50 gap-5 overflow-auto">
      <AasTree />
      <AasDetailEditor />
      <ModelViewer />
    </div>
  );
}
