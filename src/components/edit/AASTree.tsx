import { useState } from 'react';
import { ChevronRight, ChevronDown, Package, Database, FileText, Folder } from 'lucide-react';
import pipelineData from '../../../public/mock/robot_arm_a_pipeline_result.json';
// import { useAASStore } from '../../store/useAASStore';

function AASTree() {
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({
    'root-container': true,
    'shell-node': true,
    'sm-folder': true,
  });

  // const { selectedAASNode, setSelectedNode } = useAASStore;

  const toggleOpen = (id: string) => {
    setOpenStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const aas = pipelineData.aas_json.assetAdministrationShells[0];
  const submodels = pipelineData.aas_json.submodels;

  return (
    <div className="w-full h-full bg-white text-[13px] select-none overflow-y-auto font-sans">
      {/* 1단계: Asset Administration Shells 그룹 (전체 컨테이너) */}
      <div className="flex flex-col">
        <div
          onClick={() => toggleOpen('root-container')}
          className="flex items-center gap-2 p-3 bg-surface hover:bg-accent/5 cursor-pointer transition-colors m-1 rounded-md border border-line"
        >
          {openStates['root-container'] ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <Folder className="w-4 h-4 text-accent fill-accent/10" />
          <span className="font-semibold">Asset Administration Shells</span>
        </div>

        {openStates['root-container'] && (
          <div className="ml-4 border-l border-line">
            {/* 2단계 : 실제 SHELL 노드 */}
            <div
              onClick={() => toggleOpen('shell-node')}
              className="flex items-center gap-2 p-2 hover:bg-accent/5 cursor-pointer text-slate-500"
            >
              {openStates['shell-node'] ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
              <Package className="w-5 h-5 text-accent" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-[14px]">{aas.idShort}</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded font-bold uppercase">
                  SHELL
                </span>
              </div>
            </div>

            {openStates['shell-node'] && (
              <div className="ml-4 border-l border-line">
                {/* 3단계: Submodels 폴더 */}
                <div
                  onClick={() => toggleOpen('sm-folder')}
                  className="flex items-center gap-2 p-2 hover:bg-accent/5 cursor-pointer group"
                >
                  {openStates['sm-folder'] ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  )}
                  <Folder className="w-4 h-4 text-slate-300 fill-slate-50" />
                  <span className="text-slate-400 font-medium">Submodels</span>
                </div>

                {openStates['sm-folder'] && (
                  <div className="ml-4 border-l border-line">
                    {submodels.map((sm) => (
                      <div key={sm.id}>
                        {/* 4단계: 개별 Submodel */}
                        <div
                          onClick={() => toggleOpen(sm.idShort)}
                          className="flex items-center gap-2 p-2 hover:bg-accent/5 cursor-pointer group"
                        >
                          <span className="w-3.5">
                            {openStates[sm.idShort] ? (
                              <ChevronDown className="w-3 h-3 text-slate-300" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-slate-300" />
                            )}
                          </span>
                          <Database className="w-4 h-4 text-accent" />
                          <span className="font-medium text-slate-600 group-hover:text-accent">
                            {sm.idShort}
                          </span>
                        </div>

                        {/* 5단계: SubmodelElements 폴더 (Property들을 감싸는 폴더) */}
                        {openStates[sm.idShort] && (
                          <div className="ml-4 border-l border-line">
                            <div className="flex items-center gap-1.5 p-1.5 pl-4 text-slate-300 text-[11px] italic">
                              <Folder className="w-3 h-3 fill-slate-50" />
                              <span>SubmodelElements</span>
                            </div>

                            {/* 6단계: 실제 데이터 (최하위) */}
                            <div className="ml-2">
                              {sm.submodelElements.map((el) => (
                                <div
                                  key={el.idShort}
                                  className="flex items-center justify-between p-1.5 pl-6 hover:bg-accent/5 cursor-pointer group"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-slate-300" />
                                    <span className="text-slate-500 group-hover:text-slate-800">
                                      {el.idShort}
                                    </span>
                                  </div>
                                  {el.value && (
                                    <span className="text-[10px] bg-accent/10 text-accent font-bold px-2 py-0.5 rounded-full border border-accent/20 mr-2 shadow-sm">
                                      {String(el.value)}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AASTree;
