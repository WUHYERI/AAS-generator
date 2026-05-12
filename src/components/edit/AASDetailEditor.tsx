import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAASStore } from '../../store/useAASStore';
import pipelineDataRaw from '../../../public/mock/robot_arm_a_pipeline_result.json';
import { Edit3, Info, Database } from 'lucide-react';

// 타입 임포트
import type { AasPipelineResponse, Property, Submodel } from '../../types/AAS';

// JSON 데이터를 타입 캐스팅
const pipelineData = pipelineDataRaw as unknown as AasPipelineResponse;

// 폼 데이터의 타입 정의
interface AasFormValues {
  idShort: string;
  category: string;
  value: string;
  valueType: string;
}

function AasDetailEditor() {
  const { selectedAASNode } = useAASStore();

  // react-hook-form 초기화
  const { register, handleSubmit, reset, control } = useForm<AasFormValues>({
    defaultValues: {
      idShort: '',
      category: 'VARIABLE',
      value: '',
      valueType: 'xs:string',
    },
  });

  // watch('valueType') 대신 useWatch 사용
  const valueType = useWatch({
    control,
    name: 'valueType',
  });

  // 트리에서 노드를 선택할 때마다 폼 값을 해당 데이터로 리셋
  useEffect(() => {
    if (selectedAASNode) {
      // any 대신 정의된 타입을 사용하여 데이터 탐색
      const firstSubmodel = pipelineData.aas_json.submodels[0] as Submodel;
      const target = firstSubmodel.submodelElements.find((el) => el.idShort === selectedAASNode) as
        | Property
        | undefined; // Property 타입으로 간주

      if (target) {
        reset({
          idShort: target.idShort,
          category: target.category || 'VARIABLE',
          value: target.value || '',
          valueType: target.valueType || 'xs:string',
        });
      }
    }
  }, [selectedAASNode, reset]);

  const onSubmit = (data: AasFormValues) => {
    console.log('서버로 전송할 최종 데이터:', data);
    alert('변경사항이 로컬에 반영되었습니다.');
  };

  if (!selectedAASNode) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-subtext bg-surface border-r border-line">
        <Database className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-[13px] italic font-medium">항목을 선택하면 상세 정보가 표시됩니다.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full h-full bg-white flex flex-col border-r border-line font-sans"
    >
      {/* 헤더 */}
      <div className="h-10 px-4 flex items-center bg-surface border-b border-line gap-2 shrink-0">
        <Edit3 className="w-4 h-4 text-subtext" />
        <span className="text-[13px] font-bold text-slate-700">AAS Element Editor</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Referable Section */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
            <Info className="w-3 h-3" /> Referable
          </h3>
          <div className="grid grid-cols-[100px_1fr] gap-y-3 text-[13px]">
            <div className="text-subtext py-1">idShort</div>
            <input
              {...register('idShort', { required: true })}
              className="px-2 py-1 bg-surface border border-line rounded focus:border-accent-line outline-none transition-all"
            />

            <div className="text-subtext py-1">Category</div>
            <input
              {...register('category')}
              className="px-2 py-1 bg-surface border border-line rounded focus:border-accent-line outline-none"
              readOnly
            />
          </div>
        </div>

        {/* Value Section */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
            <Database className="w-3 h-3" /> Data Content
          </h3>
          <div className="p-4 bg-hover-light border border-accent-line/30 rounded-lg space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-subtext">Value</label>
              <input
                {...register('value')}
                className="px-3 py-2 bg-white border border-line rounded text-accent-dark font-mono font-bold outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div className="flex justify-between text-[11px] text-subtext px-1">
              <span>Value Type</span>
              <span className="italic font-mono font-medium text-accent-dark">{valueType}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-surface/50 shrink-0">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-1.5 text-[12px] font-medium text-subtext hover:bg-slate-100 rounded transition-colors"
        >
          Reset
        </button>
        <button
          type="submit"
          className="px-5 py-1.5 text-[12px] font-bold text-white bg-accent hover:bg-accent-dark rounded shadow-sm transition-all"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

export default AasDetailEditor;
