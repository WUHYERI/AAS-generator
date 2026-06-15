import { useState } from 'react';
import { Radio, Link2, RefreshCw } from 'lucide-react';
import { useBasyxStore } from '../../store/useBasyxStore';

interface BasyxConnectPopoverProps {
  onSync?: () => void;
}

export default function BasyxConnectPopover({ onSync }: BasyxConnectPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const {
    connected,
    serverUrl: storedServerUrl,
    registryUrl: storedRegistryUrl,
    setConnected,
    updateUrls,
  } = useBasyxStore();

  const [serverUrl, setServerUrl] = useState(storedServerUrl);
  const [registryUrl, setRegistryUrl] = useState(storedRegistryUrl);

  const handleTogglePopover = () => {
    if (!isOpen) {
      setServerUrl(storedServerUrl);
      setRegistryUrl(storedRegistryUrl);
    }
    setIsOpen(!isOpen);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);

    try {
      const response = await fetch(`${serverUrl}/description`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error('BaSyx 연결 응답 에러');

      updateUrls({ serverUrl, registryUrl });
      setConnected(true);
      setIsOpen(false);

      alert(`Eclipse BaSyx 서버에 연결되었습니다!\n\nAAS 코어: ${serverUrl}`);
    } catch (error) {
      console.error(error);
      setConnected(false);
      alert('BaSyx 연결에 실패했습니다.\n주소가 정확한지, 혹은 서버(CORS) 상태를 확인하세요.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setIsOpen(false);
    alert('Eclipse BaSyx 연결이 해제되었습니다.');
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Sync Action */}
      {connected && onSync && (
        <button
          onClick={onSync}
          className="flex items-center justify-center p-1.5 rounded-full border border-line text-subtext bg-white hover:bg-surface active:scale-95 transition-all shadow-sm"
          title="데이터 동기화"
        >
          <RefreshCw size={14} />
        </button>
      )}

      {/* Status Trigger */}
      <button
        onClick={handleTogglePopover}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all select-none active:scale-95 shadow-sm ${
          connected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50'
            : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/50'
        }`}
      >
        <Radio
          size={14}
          className={`${connected ? 'text-emerald-500 animate-pulse' : 'text-rose-500'}`}
        />
        <span>{connected ? 'BaSyx 온라인' : 'BaSyx 연결하기'}</span>
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-line shadow-xl p-4 z-50 animate-fadeIn">
          <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1">
            <Link2 size={13} className="text-accent-dark" />
            Eclipse BaSyx 실시간 인프라 매핑
          </h3>

          <form onSubmit={handleConnect} className="flex flex-col gap-3">
            {/* AAS Server Endpoint */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-subtext">AAS Server URL</label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="http://localhost:4001"
                className="w-full px-2.5 py-1.5 border border-line rounded-lg text-xs font-mono focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-slate-800"
              />
            </div>

            {/* Registry Endpoint */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-subtext">Registry URL</label>
              <input
                type="text"
                value={registryUrl}
                onChange={(e) => setRegistryUrl(e.target.value)}
                placeholder="http://localhost:4000"
                className="w-full px-2.5 py-1.5 border border-line rounded-lg text-xs font-mono focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-slate-800"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 justify-end mt-1.5">
              {connected ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-medium transition-colors shadow-sm"
                >
                  연결 해제
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-2.5 py-1.5 rounded-md text-xs font-medium text-subtext hover:bg-surface"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={connecting}
                    className="px-3 py-1.5 bg-accent hover:bg-hover-dark disabled:bg-slate-300 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
                  >
                    {connecting ? '확인 중...' : '연결하기'}
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Connected Route Meta */}
          <div className="mt-3 pt-2 border-t border-line text-[9px] text-subtext font-mono flex flex-col gap-0.5">
            <div className="truncate">Core: {storedServerUrl}</div>
            <div className="truncate">Hub: {storedRegistryUrl}</div>
          </div>
        </div>
      )}
    </div>
  );
}
