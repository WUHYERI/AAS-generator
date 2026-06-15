import { useUploadStore } from '../../store/useUploadStore';

export default function ManualInputForm() {
  const manualInput = useUploadStore((state) => state.manualInput);
  const updateManualInput = useUploadStore((state) => state.updateManualInput);

  // 입력창 공통 스타일 (보정 반영)
  const inputStyle =
    'w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-accent transition-colors';

  return (
    <div className="flex flex-col w-full bg-white rounded-2xl shadow-lg p-8 gap-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">추가 장비 정보 입력 (선택)</h2>
        <p className="text-slate-500 text-xs mt-1">
          더욱 정확한 AAS 데이터 생성을 위해 장비에 대한 추가 정보를 기입해 주세요.
        </p>
      </div>

      <div className="space-y-6">
        {/* Asset Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            장비명 (Asset Name)
          </label>
          <input
            type="text"
            value={manualInput.assetName}
            onChange={(e) => updateManualInput({ assetName: e.target.value })}
            placeholder="예: 지멘스 모터 (Siemens Motor)"
            className={inputStyle}
          />
        </div>

        {/* Manufacturer */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            제조사 (Manufacturer)
          </label>
          <input
            type="text"
            value={manualInput.manufacturer}
            onChange={(e) => updateManualInput({ manufacturer: e.target.value })}
            placeholder="예: 지멘스 (Siemens)"
            className={inputStyle}
          />
        </div>

        {/* Model Number */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            모델 번호 (Model Number)
          </label>
          <input
            type="text"
            value={manualInput.modelNumber}
            onChange={(e) => updateManualInput({ modelNumber: e.target.value })}
            placeholder="예: SIMOTICS GP"
            className={inputStyle}
          />
        </div>

        {/* Asset Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            장비 유형 (Asset Type)
          </label>
          <select
            value={manualInput.assetType}
            onChange={(e) => updateManualInput({ assetType: e.target.value })}
            className={`${inputStyle} bg-white cursor-pointer`}
          >
            <option value="">장비 유형을 선택하세요</option>
            <option value="Motor">모터 (Motor)</option>
            <option value="Sensor">센서 (Sensor)</option>
            <option value="Pump">펌프 (Pump)</option>
            <option value="Valve">밸브 (Valve)</option>
            <option value="Robot">로봇 (Robot)</option>
            <option value="PLC">PLC</option>
          </select>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            기타 특이사항 (Additional Notes)
          </label>
          <textarea
            value={manualInput.additionalNotes}
            onChange={(e) => updateManualInput({ additionalNotes: e.target.value })}
            placeholder={`장비에 대해 참고할 추가 정보를 입력해 주세요. (예시)
- 공장 내 설치 위치
- 실시간 가동 조건 및 환경
- 주요 점검 및 결함 이슈
- 유지보수 및 점검 이력`}
            rows={5}
            className={`${inputStyle} resize-none text-sm`}
          />
        </div>
      </div>
    </div>
  );
}
