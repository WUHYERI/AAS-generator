import { useEffect, useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Package,
  Database,
  FolderTree,
  FileDigit,
  Globe,
  Image as ImageIcon,
  Zap,
  FileText,
} from 'lucide-react';
import pipelineData from '../../../public/mock/robot_arm_a_pipeline_result.json';
import { useAASStore } from '../../store/useAASStore'; // Zustand 스토어 경로 확인 필요
import type { AasNode } from '../../store/useAASStore';
import type { AASEnvironment, AASNode, UITreeAAS } from '../../types/AAS';

// ==========================================
// 1. AAS 표준 메타모델에 따른 아이콘 및 타입 판별
// ==========================================
const getAasTypeInfo = (node: AasNode) => {
  const type = node.modelType;

  switch (type) {
    case 'AssetAdministrationShell':
      return { icon: <Package className="w-[15px] h-[15px] text-blue-600" />, label: 'AAS' };
    case 'Submodel':
      return { icon: <Database className="w-[15px] h-[15px] text-emerald-600" />, label: 'SM' };
    case 'SubmodelElementCollection':
      return { icon: <FolderTree className="w-[15px] h-[15px] text-amber-500" />, label: 'SMC' };
    case 'Property':
      return { icon: <FileDigit className="w-[15px] h-[15px] text-slate-500" />, label: 'Prop' };
    case 'MultiLanguageProperty':
      return { icon: <Globe className="w-[15px] h-[15px] text-indigo-500" />, label: 'MLP' };
    case 'File':
    case 'Blob':
      return { icon: <ImageIcon className="w-[15px] h-[15px] text-purple-500" />, label: 'File' };
    case 'Operation':
      return { icon: <Zap className="w-[15px] h-[15px] text-yellow-500" />, label: 'Op' };
    default:
      return { icon: <FileText className="w-[15px] h-[15px] text-slate-400" />, label: 'Element' };
  }
};

// ==========================================
// 2. 재귀 노드 컴포넌트 (TreeNode)
// ==========================================
const getChildren = (node: AASNode | UITreeAAS): AASNode[] => {
  switch (node.modelType) {
    case 'AssetAdministrationShell':
      return 'submodelNodes' in node ? node.submodelNodes || [] : [];

    case 'Submodel':
      return node.submodelElements || [];

    case 'SubmodelElementCollection':
      return node.value || [];

    default:
      return [];
  }
};

function TreeNode({
  node,
  level = 0,
  selectedNode,
  onSelect,
}: {
  node: AASNode | UITreeAAS;
  level?: number;
  selectedNode: AasNode | null;
  onSelect: (node: AasNode) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  // AAS 자식 요소 결합 로직
  const children = getChildren(node);
  const hasChildren = children && children.length > 0;

  // 객체 대 객체 비교를 위해 idShort와 modelType 조합으로 선택 여부 판별
  const isSelected =
    selectedNode !== null &&
    selectedNode.idShort === node.idShort &&
    selectedNode.modelType === node.modelType;

  const { icon } = getAasTypeInfo(node);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) setIsOpen(!isOpen);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node); // ID 대신 노드 객체 통째로 전달
  };

  return (
    <div className="w-full select-none flex flex-col">
      <div
        onClick={handleSelect}
        onDoubleClick={handleToggle}
        className={`flex items-center w-full py-1 cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-100/70 border-blue-400 text-blue-900'
            : 'hover:bg-slate-100 text-slate-700'
        }`}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
      >
        <div
          onClick={handleToggle}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 transition-colors mr-0.5"
        >
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            )
          ) : (
            <span className="w-3.5 h-3.5" />
          )}
        </div>

        <div className="mr-1.5 flex-shrink-0">{icon}</div>

        <span className={`text-[13px] truncate ${isSelected ? 'font-semibold' : ''}`}>
          {node.idShort || 'Unnamed Node'}
        </span>
      </div>

      {isOpen && hasChildren && (
        <div className="w-full relative">
          <div
            className="absolute left-[13px] top-0 bottom-0 w-px bg-slate-200"
            style={{ marginLeft: `${level * 16}px` }}
          ></div>
          {children.map((child, index) => (
            <TreeNode
              key={child.idShort || index}
              node={child}
              level={level + 1}
              selectedNode={selectedNode}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. 메인 트리 뷰어 컴포넌트
// ==========================================
export default function AASTree() {
  // Zustand 스토어의 모든 상태 연결
  const { aasEnvironment, setAasEnvironment, selectedAASNode, setSelectedAASNode } = useAASStore();

  // 컴포넌트 마운트 시 mock 데이터를 Zustand 전역 상태에 탑재 (API 연동 시 이 부분을 fetch 코드로 대체)
  useEffect(() => {
    if (!aasEnvironment) {
      setAasEnvironment(pipelineData.aas_json as AASEnvironment);
    }
  }, [aasEnvironment, setAasEnvironment]);

  const handleNodeSelect = (node: AasNode) => {
    setSelectedAASNode(node);
  };

  // Zustand Store의 실시간 데이터를 기반으로 루트 트리 구성
  const aasData = aasEnvironment?.assetAdministrationShells?.[0];
  const submodelsData = aasEnvironment?.submodels || [];

  const rootNode: UITreeAAS | null = aasData
    ? {
        ...aasData,
        submodelNodes: submodelsData,
      }
    : null;

  if (!rootNode)
    return <div className="p-4 text-sm text-slate-500">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="w-full h-full bg-white border border-slate-200 overflow-x-hidden overflow-y-auto font-sans shadow-inner">
      <div className="p-2 border-b border-slate-200 bg-slate-50">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          AAS Environment
        </h3>
      </div>

      <div className="py-2">
        <TreeNode
          node={rootNode}
          level={0}
          selectedNode={selectedAASNode}
          onSelect={handleNodeSelect}
        />
      </div>
    </div>
  );
}
