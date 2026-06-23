import { useEffect, useState } from 'react';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
import { useAasStore } from '../../store/useAasStore';
import {
  Edit3,
  Info,
  Database,
  File as FileIcon,
  FolderTree,
  SlidersHorizontal,
  Globe,
  Plus,
  Trash2,
  Bookmark,
  ShieldCheck,
  CheckCircle2,
  ListChecks,
  Loader2,
} from 'lucide-react';
import type { AasMappingPlan, AasNode } from '../../types/AAS';

interface LangString {
  language: string;
  text: string;
}

interface KeyElement {
  type: string;
  value: string;
}

interface Reference {
  type: string;
  keys: KeyElement[];
}

interface Qualifier {
  type: string;
  valueType: string;
  value?: string;
}

interface AasFormValues {
  idShort: string;
  category: string;
  displayName: LangString[];
  description: LangString[];
  semanticId?: Reference;
  qualifiers?: Qualifier[];
  value?: string;
  valueType?: string;
  contentType?: string;
  min?: string;
  max?: string;
}

const VALUE_TYPE_OPTIONS = [
  'xs:string',
  'xs:boolean',
  'xs:int',
  'xs:double',
  'xs:float',
  'xs:dateTime',
  'xs:anyURI',
];

const semanticIdOf = (node: AasNode) =>
  'semanticId' in node ? node.semanticId?.keys?.[0]?.value : undefined;

const findMappingProperty = (mappingPlan: AasMappingPlan | null, node: AasNode) => {
  if (!mappingPlan) return undefined;
  const semanticId = semanticIdOf(node);
  return mappingPlan.submodels
    ?.flatMap((submodel) => submodel.properties || [])
    .find(
      (property) =>
        property.idShort === node.idShort &&
        (!semanticId || !property.semanticId || property.semanticId === semanticId) &&
        (property.candidateSuggestions?.length || property.reviewRequired),
    );
};

export default function AasDetailEditor() {
  const {
    selectedAasNode,
    updateAasNode,
    mappingPlan,
    applyCandidateSelection,
    saveAasResult,
    isSaving,
    saveError,
  } = useAasStore();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const { register, handleSubmit, reset, control } = useForm<AasFormValues>({
    defaultValues: {
      idShort: '',
      category: 'VARIABLE',
      displayName: [],
      description: [],
      semanticId: { type: 'ExternalReference', keys: [] },
      qualifiers: [],
    },
  });

  const valueType = useWatch({
    control,
    name: 'valueType',
  });

  const {
    fields: displayFields,
    append: appendDisplay,
    remove: removeDisplay,
  } = useFieldArray({
    control,
    name: 'displayName',
  });

  const {
    fields: descFields,
    append: appendDesc,
    remove: removeDesc,
  } = useFieldArray({
    control,
    name: 'description',
  });

  useEffect(() => {
    if (!selectedAasNode) return;

    const formValues: AasFormValues = {
      idShort: selectedAasNode.idShort,
      category: selectedAasNode.category || 'VARIABLE',
      displayName: selectedAasNode.displayName || [],
      description: selectedAasNode.description || [],
      semanticId:
        'semanticId' in selectedAasNode
          ? selectedAasNode.semanticId || { type: 'ExternalReference', keys: [] }
          : { type: 'ExternalReference', keys: [] },
      qualifiers: 'qualifiers' in selectedAasNode ? selectedAasNode.qualifiers || [] : [],
    };

    switch (selectedAasNode.modelType) {
      case 'Property':
        formValues.value = selectedAasNode.value || '';
        formValues.valueType = selectedAasNode.valueType || 'xs:string';
        break;

      case 'File':
        formValues.value = selectedAasNode.value || '';
        formValues.contentType = selectedAasNode.contentType || 'application/pdf';
        break;

      case 'Range':
        formValues.min = selectedAasNode.min || '';
        formValues.max = selectedAasNode.max || '';
        formValues.valueType = selectedAasNode.valueType || 'xs:string';
        break;
    }

    reset(formValues);
  }, [selectedAasNode, reset]);

  const onSubmit = async (data: AasFormValues) => {
    if (!selectedAasNode) return;

    try {
      if (updateAasNode) {
        updateAasNode({
          ...selectedAasNode,
          ...data,
        } as AasNode);
      }
      const persisted = await saveAasResult();
      setSaveMessage(
        persisted
          ? '변경사항을 저장했습니다.'
          : '변경사항을 현재 AAS 화면에 반영했습니다.',
      );
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      setSaveMessage('저장에 실패했습니다.');
    }
  };

  if (!selectedAasNode) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 border-l border-slate-200">
        <Database className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-[13px] italic font-medium">
          트리에서 항목을 선택하면 상세 정보가 표시됩니다.
        </p>
      </div>
    );
  }

  const type = selectedAasNode.modelType || 'Unknown';
  const isProperty = type === 'Property';
  const isFile = type === 'File';
  const isRange = type === 'Range';
  const isCollection = type === 'SubmodelElementCollection' || type === 'Submodel';
  const mappingProperty = findMappingProperty(mappingPlan, selectedAasNode);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full h-full bg-white flex flex-col border-l border-slate-200 text-slate-700 font-sans select-none"
    >
      {/* Header */}
      <div className="h-10 px-4 flex items-center bg-slate-100 border-b border-slate-200 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[12px] font-bold text-slate-800">
            AAS Element Editor
            <span className="text-blue-600 font-mono text-[11px] font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 ml-1">
              {type}
            </span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white text-[12px]">
        {/* Referable */}
        <div className="border border-slate-200 rounded overflow-hidden">
          <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 font-bold text-slate-600 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Referable Identification
          </div>

          <div className="p-3 grid grid-cols-[110px_1fr] gap-y-2.5 items-center">
            <div className="text-slate-500 font-medium">idShort</div>
            <input
              {...register('idShort', { required: true })}
              className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-500 font-mono focus:outline-none cursor-not-allowed"
              readOnly
            />

            <div className="text-slate-500 font-medium">Category</div>
            <input
              {...register('category')}
              className="px-2 py-1 bg-white border border-slate-200 rounded outline-none focus:border-blue-400 font-mono"
            />
          </div>
        </div>

        {/* Language */}
        <div className="border border-slate-200 rounded overflow-hidden">
          <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 font-bold text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              Language Strings
            </span>
          </div>

          <div className="p-3 space-y-4">
            {/* Display Name */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-slate-500 font-semibold">
                <span>Display Name</span>
                <button
                  type="button"
                  onClick={() => appendDisplay({ language: 'en', text: '' })}
                  className="text-blue-600 flex items-center gap-0.5 hover:underline text-[11px] font-bold"
                >
                  <Plus className="w-3 h-3" />
                  추가
                </button>
              </div>

              {displayFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input
                    {...register(`displayName.${index}.language`)}
                    placeholder="ln"
                    className="w-12 text-center px-1 py-1 border border-slate-200 rounded font-mono"
                  />
                  <input
                    {...register(`displayName.${index}.text`)}
                    placeholder="이름 입력"
                    className="flex-1 px-2 py-1 border border-slate-200 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeDisplay(index)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-slate-500 font-semibold">
                <span>Description</span>
                <button
                  type="button"
                  onClick={() => appendDesc({ language: 'en', text: '' })}
                  className="text-blue-600 flex items-center gap-0.5 hover:underline text-[11px] font-bold"
                >
                  <Plus className="w-3 h-3" />
                  추가
                </button>
              </div>

              {descFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input
                    {...register(`description.${index}.language`)}
                    placeholder="ln"
                    className="w-12 text-center px-1 py-1 border border-slate-200 rounded font-mono"
                  />
                  <input
                    {...register(`description.${index}.text`)}
                    placeholder="설명 입력"
                    className="flex-1 px-2 py-1 border border-slate-200 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeDesc(index)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Semantic ID */}
        <div className="border border-slate-200 rounded overflow-hidden">
          <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 font-bold text-slate-600 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-teal-600" />
            Semantic ID
          </div>

          <div className="p-3 grid grid-cols-[110px_1fr] gap-y-2.5 items-center">
            <div className="text-slate-500 font-medium">Ref Type</div>
            <select
              {...register('semanticId.type')}
              className="px-1.5 py-1 bg-white border border-slate-200 rounded outline-none font-mono"
            >
              <option value="ExternalReference">ExternalReference</option>
              <option value="ModelReference">ModelReference</option>
            </select>

            <div className="text-slate-500 font-medium">Keys / IRDI</div>
            <div className="space-y-1.5">
              <input
                {...register('semanticId.keys.0.value')}
                placeholder="0173-1#02-BAA120#008"
                className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono text-[11px] focus:border-teal-400 outline-none"
              />
              <input
                {...register('semanticId.keys.0.type', {
                  value: 'GlobalReference',
                })}
                type="hidden"
              />
            </div>
          </div>
        </div>

        {mappingProperty?.candidateSuggestions?.length ? (
          <div className="border border-violet-200 rounded overflow-hidden bg-violet-50/30">
            <div className="bg-violet-50 px-3 py-1.5 border-b border-violet-200 font-bold text-violet-800 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-violet-600" />
                후보 요소 목록
              </span>
              <span className="text-[10px] font-medium text-violet-600">
                {mappingProperty.reviewRequired ? '확인이 필요한 매칭' : '자동 승인된 매칭'}
              </span>
            </div>
            <div className="p-2 space-y-1.5">
              <p className="px-1 text-[11px] leading-relaxed text-slate-500">
                자동 승인 결과입니다. 더 적합한 후보를 선택한 뒤 변경사항을 저장할 수 있습니다.
              </p>
              {mappingProperty.candidateSuggestions.map((candidate) => {
                const isCurrent = candidate.candidate_id === mappingProperty.aas_property_id;
                return (
                  <button
                    key={candidate.candidate_id}
                    type="button"
                    onClick={() => {
                      applyCandidateSelection(mappingProperty.semantic_node_id, candidate);
                      setSaveMessage(`'${candidate.idShort}' 후보를 선택했습니다. 저장하면 반영됩니다.`);
                    }}
                    className={`w-full rounded border px-2.5 py-2 text-left transition-colors ${
                      isCurrent
                        ? 'border-violet-400 bg-white shadow-sm'
                        : 'border-violet-100 bg-white/60 hover:border-violet-300 hover:bg-white'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-700 truncate">
                        {candidate.idShort}
                      </span>
                      <span className="flex items-center gap-1 shrink-0 text-[10px] font-bold text-violet-700">
                        {isCurrent && <CheckCircle2 className="w-3 h-3" />}
                        {candidate.score !== undefined ? `${Math.round(candidate.score * 100)}%` : ''}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-400">
                      {candidate.submodel || 'Submodel 미지정'} · {candidate.semanticId || 'Semantic ID 없음'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Property */}
        {isProperty && (
          <div className="border border-emerald-200 rounded overflow-hidden">
            <div className="bg-emerald-50 px-3 py-1.5 border-b border-emerald-200 font-bold text-emerald-800 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Property Data Content
            </div>

            <div className="p-3 space-y-3">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-600">Value (값)</label>

                {valueType === 'xs:boolean' ? (
                  <select
                    {...register('value')}
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-800 font-mono font-bold outline-none focus:border-emerald-400"
                  >
                    <option value="">Select boolean value</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : valueType === 'xs:dateTime' ? (
                  <input
                    type="datetime-local"
                    {...register('value')}
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-800 font-mono font-bold outline-none focus:border-emerald-400"
                  />
                ) : valueType === 'xs:int' ||
                  valueType === 'xs:double' ||
                  valueType === 'xs:float' ? (
                  <input
                    type="number"
                    {...register('value')}
                    placeholder="숫자 값을 입력하세요..."
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-800 font-mono font-bold outline-none focus:border-emerald-400"
                  />
                ) : valueType === 'xs:anyURI' ? (
                  <input
                    type="url"
                    {...register('value')}
                    placeholder="https://example.com"
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-800 font-mono font-bold outline-none focus:border-emerald-400"
                  />
                ) : (
                  <input
                    {...register('value')}
                    placeholder="값을 입력하세요..."
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-800 font-mono font-bold outline-none focus:border-emerald-400"
                  />
                )}
              </div>

              <div className="grid grid-cols-[110px_1fr] items-center pt-1 border-t border-emerald-100/70">
                <span className="text-slate-500 font-medium">Value Type Spec</span>
                <select
                  {...register('valueType')}
                  className="px-1 py-0.5 border border-slate-200 rounded bg-white font-mono text-emerald-700 text-[11px] outline-none"
                >
                  {VALUE_TYPE_OPTIONS.map((vOpt) => (
                    <option key={vOpt} value={vOpt}>
                      {vOpt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* File */}
        {isFile && (
          <div className="border border-purple-200 rounded overflow-hidden">
            <div className="bg-purple-50 px-3 py-1.5 border-b border-purple-200 font-bold text-purple-800 flex items-center gap-1.5">
              <FileIcon className="w-3.5 h-3.5 text-purple-600" />
              File Source Specification
            </div>

            <div className="p-3 grid grid-cols-[110px_1fr] gap-y-2.5 items-center">
              <div className="text-slate-600 font-semibold">Path / URL</div>
              <input
                {...register('value')}
                placeholder="/aasx/documents/manual.pdf"
                className="px-2 py-1 bg-white border border-slate-200 rounded outline-none focus:border-purple-400 font-mono"
              />

              <div className="text-slate-600 font-semibold">Content Type</div>
              <input
                {...register('contentType')}
                placeholder="application/pdf"
                className="px-2 py-1 bg-white border border-slate-200 rounded outline-none focus:border-purple-400 font-mono"
              />
            </div>
          </div>
        )}

        {/* Range */}
        {isRange && (
          <div className="border border-amber-200 rounded overflow-hidden">
            <div className="bg-amber-50 px-3 py-1.5 border-b border-amber-200 font-bold text-amber-800 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              Range Boundary Values
            </div>

            <div className="p-3 space-y-3">
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="font-semibold text-slate-600">Minimum Limit</label>
                  <input
                    {...register('min')}
                    className="px-2 py-1 bg-white border border-slate-200 rounded font-mono outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <label className="font-semibold text-slate-600">Maximum Limit</label>
                  <input
                    {...register('max')}
                    className="px-2 py-1 bg-white border border-slate-200 rounded font-mono outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collection */}
        {isCollection && (
          <div className="p-4 border border-dashed border-slate-300 rounded bg-slate-50 flex flex-col items-center justify-center text-slate-400">
            <FolderTree className="w-5 h-5 mb-1.5 opacity-60 text-slate-500" />
            <p className="font-medium text-[11px]">
              이 노드는 복합 하위 요소를 포함하는 컨테이너 객체입니다.
            </p>
          </div>
        )}

        {/* Qualifiers */}
        {!isCollection && (
          <div className="border border-slate-200 rounded overflow-hidden">
            <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 font-bold text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Qualifiers
            </div>

            <div className="p-2 bg-slate-50/50 text-[11px] text-slate-400 text-center italic">
              추후 제약조건 편집기 추가 예정
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 px-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 shrink-0">
        {(saveMessage || saveError) && (
          <span className={`mr-auto self-center text-[11px] ${saveError ? 'text-rose-600' : 'text-emerald-700'}`}>
            {saveError || saveMessage}
          </span>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded active:scale-[0.98] transition-all shadow-sm"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '변경사항 저장'}
        </button>
      </div>
    </form>
  );
}
