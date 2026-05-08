import { useAppStore } from '../../store/useAppStore';

function ManualInputForm() {
  const manualInput = useAppStore((state) => state.manualInput);
  const updateManualInput = useAppStore((state) => state.updateManualInput);

  // 입력창 공통 스타일을 변수로 빼두면 관리가 더 편해요!
  const inputStyle =
    'w-full px-4 py-3 rounded-lg border border-line focus:outline-none focus:border-accent transition-colors';

  return (
    <div className="flex flex-col w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 gap-8">
      <div className="">
        <h2 className="text-2xl font-bold text-slate-800">Optional Asset Information</h2>
        <p className="text-subtext mt-1">
          Add additional asset information to improve AAS generation
        </p>
      </div>

      <div className="space-y-6">
        {/* Asset Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Asset Name</label>
          <input
            type="text"
            value={manualInput.assetName}
            onChange={(e) => updateManualInput({ assetName: e.target.value })}
            placeholder="Siemens Motor"
            className={inputStyle}
          />
        </div>

        {/* Manufacturer */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Manufacturer</label>
          <input
            type="text"
            value={manualInput.manufacturer}
            onChange={(e) => updateManualInput({ manufacturer: e.target.value })}
            placeholder="Siemens"
            className={inputStyle}
          />
        </div>

        {/* Model Number */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Model Number</label>
          <input
            type="text"
            value={manualInput.modelNumber}
            onChange={(e) => updateManualInput({ modelNumber: e.target.value })}
            placeholder="SIMOTICS GP"
            className={inputStyle}
          />
        </div>

        {/* Asset Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Asset Type</label>
          <select
            value={manualInput.assetType}
            onChange={(e) => updateManualInput({ assetType: e.target.value })}
            className={`${inputStyle} bg-white cursor-pointer`}
          >
            <option value="">Select asset type</option>
            <option value="Motor">Motor</option>
            <option value="Sensor">Sensor</option>
            <option value="Pump">Pump</option>
            <option value="Valve">Valve</option>
            <option value="Robot">Robot</option>
            <option value="PLC">PLC</option>
          </select>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={manualInput.additionalNotes}
            onChange={(e) => updateManualInput({ additionalNotes: e.target.value })}
            placeholder={`Additional information about the asset...
- Factory location
- Operating conditions
- Known issues
- Maintenance history`}
            rows={5}
            className={`${inputStyle} resize-none`}
          />
        </div>
      </div>
    </div>
  );
}

export default ManualInputForm;
