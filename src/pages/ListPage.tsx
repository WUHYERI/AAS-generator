import { useEffect } from 'react';
import { useAasStore } from '../store/useAasStore';
import { useBasyxStore } from '../store/useBasyxStore';
import { Server, RefreshCw, FileText } from 'lucide-react';

export default function ListPage() {
  const { registryUrl, connected } = useBasyxStore();
  const { aasList, isLoading, listError, fetchAasLines } = useAasStore();

  useEffect(() => {
    if (connected) {
      fetchAasLines(registryUrl);
    }
  }, [connected, registryUrl, fetchAasLines]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center border border-line/40">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Server className="text-accent" size={22} />
            디지털 트윈 자산(AAS) 목록 조회
          </h1>
          <p className="text-xs text-subtext mt-1">
            연결된 레지스트리 허브:{' '}
            <span className="font-mono text-accent-dark bg-hover-light px-2 py-0.5 rounded-lg border border-accent-line/30">
              {registryUrl}
            </span>
          </p>
        </div>

        <button
          onClick={() => fetchAasLines(registryUrl)}
          disabled={isLoading || !connected}
          className="flex items-center gap-1.5 px-3 py-2 border border-line rounded-xl text-xs font-semibold hover:bg-surface active:scale-95 disabled:opacity-50 transition-all shadow-sm bg-white text-slate-700 cursor-pointer"
        >
          <RefreshCw
            size={12}
            className={`text-slate-500 ${isLoading ? 'animate-spin text-accent' : ''}`}
          />
          새로고침
        </button>
      </div>

      {/* Connection Exception Status */}
      {!connected && (
        <div className="text-center py-12 border-2 border-dashed border-line rounded-2xl text-subtext text-sm bg-white shadow-md">
          상단 네비게이션바에서 Eclipse BaSyx 연결해 주세요.
        </div>
      )}

      {/* Loading Status */}
      {connected && isLoading && (
        <div className="text-center py-12 text-slate-500 text-sm flex flex-col items-center gap-2 bg-white rounded-2xl shadow-md border border-line/30">
          <RefreshCw size={20} className="animate-spin text-accent" />
          <span className="text-subtext">
            BaSyx Registry에서 자산 명단을 안전하게 읽어오는 중입니다...
          </span>
        </div>
      )}

      {/* Error Status */}
      {connected && !isLoading && listError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium shadow-sm">
          ❌ {listError}
        </div>
      )}

      {/* AAS List View */}
      {connected && !isLoading && !listError && (
        <div className="grid gap-4">
          {aasList.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-line rounded-2xl text-subtext text-sm bg-white shadow-lg">
              등록된 자산 관리 쉘(AAS)이 없습니다. 관리자 도구에서 AAS를 추가해 보세요!
            </div>
          ) : (
            aasList.map((aas) => (
              <div
                key={aas.id}
                className="flex items-center justify-between p-5 bg-white border border-line/50 rounded-2xl shadow-md hover:border-accent-line hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-3 bg-hover-light text-accent rounded-xl shrink-0 group-hover:bg-accent group-hover:text-white transition-colors shadow-sm">
                    <FileText size={20} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-accent-dark transition-colors">
                      {aas.idShort}
                    </h3>
                    <p className="text-[10px] text-subtext font-mono mt-1 truncate">
                      Global ID: {aas.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-1 bg-surface text-slate-600 border border-line rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {aas.assetKind || 'Instance'}
                  </span>

                  <button className="px-3 py-2 bg-accent hover:bg-hover-dark active:scale-95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer">
                    대시보드 보기
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
