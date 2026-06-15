import { useState } from 'react';
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
  UploadCloud,
} from 'lucide-react';
import { useAasStore } from '../../store/useAasStore';
import type { AasNode, UITreeAas } from '../../types/AAS';

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

const getChildren = (node: AasNode | UITreeAas): AasNode[] => {
  switch (node.modelType) {
    case 'AssetAdministrationShell':
      return 'submodelNodes' in node ? (node.submodelNodes as AasNode[]) || [] : [];

    case 'Submodel':
      return (node.submodelElements as AasNode[]) || [];

    case 'SubmodelElementCollection':
      return (node.value as AasNode[]) || [];

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
  node: AasNode | UITreeAas;
  level?: number;
  selectedNode: AasNode | null;
  onSelect: (node: AasNode) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const children = getChildren(node);
  const hasChildren = children && children.length > 0;

  const isSelected =
    selectedNode !== null &&
    selectedNode.idShort === node.idShort &&
    selectedNode.modelType === node.modelType;

  const { icon } = getAasTypeInfo(node as AasNode);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) setIsOpen(!isOpen);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node as AasNode);
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

export default function AasTree() {
  const { aasEnvironment, selectedAasNode, setSelectedAasNode } = useAasStore();

  const handleNodeSelect = (node: AasNode) => {
    setSelectedAasNode(node);
  };

  const aasData = aasEnvironment?.assetAdministrationShells?.[0];
  const submodelsData = aasEnvironment?.submodels || [];

  const rootNode: UITreeAas | null = aasData
    ? {
        ...aasData,
        submodelNodes: submodelsData,
      }
    : null;

  if (!rootNode) {
    return (
      <div className="w-full h-full bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-6 text-center font-sans">
        <UploadCloud className="w-9 h-9 mb-2 opacity-30 text-blue-500 animate-pulse" />
        <p className="text-[13px] font-semibold text-slate-600 mb-1">
          조회된 AAS 데이터가 없습니다.
        </p>
        <p className="text-[11px] text-slate-400 leading-normal max-w-[210px]">
          가이드 문서나 이미지를 업로드하면 파이프라인이 생성한 AAS 결과가 여기에 실시간으로
          표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white border border-slate-200 overflow-x-hidden overflow-y-auto font-sans shadow-inner">
      {/* Header */}
      <div className="p-2 border-b border-slate-200 bg-slate-50">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Aas Environment
        </h3>
      </div>

      {/* Body */}
      <div className="py-2">
        <TreeNode
          node={rootNode}
          level={0}
          selectedNode={selectedAasNode}
          onSelect={handleNodeSelect}
        />
      </div>
    </div>
  );
}
