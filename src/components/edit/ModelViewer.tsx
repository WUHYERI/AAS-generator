import { useEffect, useMemo, useRef } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  ImportMeshAsync,
  Color4,
  HighlightLayer,
  Color3,
  Mesh,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import { useViewerStore } from '../../store/useViewerStore';
import { useAasStore } from '../../store/useAasStore';
import { Move, RotateCcw, Box } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import type { AasEnvironment, SubmodelElement } from '../../types/AAS';

const findModelFileValue = (aasEnvironment: AasEnvironment | null): string | null => {
  const findInElements = (elements: SubmodelElement[] = []): string | null => {
    for (const element of elements) {
      if (
        element.modelType === 'File' &&
        element.idShort === 'ModelFile' &&
        typeof element.value === 'string' &&
        element.value.trim()
      ) {
        return element.value.trim();
      }

      if (element.modelType === 'SubmodelElementCollection') {
        const nested = findInElements(element.value || []);
        if (nested) return nested;
      }
    }

    return null;
  };

  for (const submodel of aasEnvironment?.submodels || []) {
    const modelFileValue = findInElements(submodel.submodelElements || []);
    if (modelFileValue) return modelFileValue;
  }

  return null;
};

const resolveModelUrl = (aasEnvironment: AasEnvironment | null): string | null => {
  const modelFileValue = findModelFileValue(aasEnvironment);
  const assetId = aasEnvironment?.assetAdministrationShells?.[0]?.idShort;

  if (modelFileValue?.startsWith('http://') || modelFileValue?.startsWith('https://')) {
    return modelFileValue;
  }

  if (modelFileValue?.startsWith('/api/')) {
    return apiUrl(modelFileValue);
  }

  if (modelFileValue?.includes('/AAS-BackEnd/') || modelFileValue?.startsWith('/Users/')) {
    return assetId ? apiUrl(`/api/models/${assetId}`) : null;
  }

  if (modelFileValue?.startsWith('/')) {
    return modelFileValue;
  }

  if (modelFileValue && /\.(glb|gltf)$/i.test(modelFileValue)) {
    return apiUrl(`/api/model-files/${modelFileValue.replace(/^\/+/, '')}`);
  }

  return assetId ? apiUrl(`/api/models/${assetId}`) : null;
};

const selectablePartNames = (aasEnvironment: AasEnvironment | null): string[] => {
  const names: string[] = [];

  const findValue = (elements: SubmodelElement[] | undefined, idShort: string): string | null => {
    for (const element of elements || []) {
      if (element.modelType === 'Property' && element.idShort === idShort && element.value) {
        return element.value;
      }
      if (element.modelType === 'SubmodelElementCollection') {
        const nested = findValue(element.value, idShort);
        if (nested) return nested;
      }
    }
    return null;
  };

  const walk = (elements: SubmodelElement[] | undefined) => {
    for (const element of elements || []) {
      if (element.modelType !== 'SubmodelElementCollection') continue;
      if (element.idShort === 'SelectableParts') {
        for (const part of element.value || []) {
          if (part.modelType !== 'SubmodelElementCollection') continue;
          const meshName = findValue(part.value, 'MeshName');
          const partId = findValue(part.value, 'PartId');
          const name = meshName || partId || part.idShort;
          if (name && !names.includes(name)) names.push(name);
        }
      } else {
        walk(element.value);
      }
    }
  };

  for (const submodel of aasEnvironment?.submodels || []) {
    walk(submodel.submodelElements);
  }

  return names;
};

export default function ModelViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const hlRef = useRef<HighlightLayer | null>(null);
  const selectedNodeNameRef = useRef<string | null>(null);

  const { aasEnvironment } = useAasStore();
  const {
    selectedNodeName,
    setSelectedNodeName,
    setIsModelLoaded,
    rotationAnglesX,
    rotationAnglesY,
    setRotationAngleX,
    setRotationAngleY,
  } = useViewerStore();

  const currentAngleX = selectedNodeName ? rotationAnglesX[selectedNodeName] || 0 : 0;
  const currentAngleY = selectedNodeName ? rotationAnglesY[selectedNodeName] || 0 : 0;

  const modelUrl = resolveModelUrl(aasEnvironment);
  const partNames = useMemo(() => selectablePartNames(aasEnvironment), [aasEnvironment]);

  useEffect(() => {
    selectedNodeNameRef.current = selectedNodeName;
  }, [selectedNodeName]);

  useEffect(() => {
    if (!canvasRef.current) return;

    setIsModelLoaded(false);
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    sceneRef.current = scene;
    scene.clearColor = new Color4(0.96, 0.97, 0.98, 1);

    const camera = new ArcRotateCamera('camera', 1.5, 1.2, 5, Vector3.Zero(), scene);
    camera.wheelPrecision = 150;
    camera.pinchPrecision = 150;
    camera.minZ = 0.01;
    camera.lowerRadiusLimit = 0.08;
    camera.panningSensibility = 2000;
    camera.panningInertia = 0.6;
    camera.attachControl(canvasRef.current, true);

    new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    const hl = new HighlightLayer('hl', scene);
    hlRef.current = hl;

    if (modelUrl) {
      engine.displayLoadingUI();

      ImportMeshAsync(modelUrl, scene)
        .then((result) => {
          const root = result.meshes[0];
          if (root) {
            camera.setTarget(root.getAbsolutePivotPoint().clone());
          }
          setIsModelLoaded(true);
          engine.hideLoadingUI();
        })
        .catch((err) => {
          console.error('3D 모델 로드 실패:', err);
          setIsModelLoaded(false);
          engine.hideLoadingUI();
        });
    }

    scene.onPointerDown = (_evt, pickResult) => {
      if (pickResult.hit && pickResult.pickedMesh) {
        const pickedName = pickResult.pickedMesh.name;
        const baseName = pickedName.split('_primitive')[0].split('.')[0];
        setSelectedNodeName(selectedNodeNameRef.current === baseName ? null : baseName);
      } else {
        setSelectedNodeName(null);
      }
    };

    engine.runRenderLoop(() => scene.render());
    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engine.dispose();
      setIsModelLoaded(false);
    };
  }, [modelUrl, setIsModelLoaded, setSelectedNodeName]);

  useEffect(() => {
    const scene = sceneRef.current;
    const hl = hlRef.current;
    if (!scene || !hl) return;

    hl.removeAllMeshes();

    if (selectedNodeName) {
      scene.meshes.forEach((mesh) => {
        if (mesh.name.includes(selectedNodeName) && mesh instanceof Mesh) {
          hl.addMesh(mesh, new Color3(0.1, 0.6, 1));
        }
      });
    }
  }, [selectedNodeName]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    scene.meshes.forEach((mesh) => {
      const baseName = mesh.name.split('_primitive')[0].split('.')[0];
      const degX = rotationAnglesX[baseName] || 0;
      const degY = rotationAnglesY[baseName] || 0;
      const radX = degX * (Math.PI / 180);
      const radY = degY * (Math.PI / 180);

      if (mesh.rotationQuaternion) {
        mesh.rotationQuaternion = null;
      }
      mesh.rotation.x = radX;
      mesh.rotation.y = radY;
      mesh.computeWorldMatrix(true);
    });
  }, [rotationAnglesX, rotationAnglesY]);

  const handleResetAngles = () => {
    if (selectedNodeName) {
      setRotationAngleX(selectedNodeName, 0);
      setRotationAngleY(selectedNodeName, 0);
    }
  };

  if (!modelUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 font-sans p-6 text-center select-none border border-slate-200 rounded-xl">
        <Box className="w-10 h-10 mb-3 opacity-20 text-slate-500" />
        <p className="text-[13px] font-bold text-slate-600 mb-0.5">3D 시뮬레이터 준비됨</p>
        <p className="text-[11px] text-slate-400 max-w-[240px] leading-normal">
          파일 업로드 후 백엔드 파이프라인 처리가 완료되면 경량화 디지털 트윈(GLB) 모델이 실시간으로
          동기화됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-surface">
      {/* Component Indicator */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-md shadow-sm border border-line px-3 py-1.5 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[12px] font-bold text-slate-700">
            {selectedNodeName || 'Select Component'}
          </span>
        </div>
      </div>

      {partNames.length > 0 && (
        <div className="absolute top-14 left-4 z-10 max-w-[70%] flex flex-wrap gap-1.5">
          {partNames.map((partName) => {
            const active = selectedNodeName === partName;
            return (
              <button
                key={partName}
                onClick={() => setSelectedNodeName(active ? null : partName)}
                className={`h-7 max-w-36 truncate rounded-md border px-2 text-[11px] font-semibold shadow-sm transition-colors ${
                  active
                    ? 'border-accent bg-accent text-white'
                    : 'border-line bg-white/90 text-slate-600 hover:bg-hover-light'
                }`}
                title={partName}
              >
                {partName}
              </button>
            );
          })}
        </div>
      )}

      {/* Controller */}
      {selectedNodeName && (
        <div className="absolute bottom-6 right-6 z-10 w-64 bg-white/95 backdrop-blur-md shadow-xl border border-line rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-[12px]">
              <Move className="w-3.5 h-3.5 text-accent" /> 시뮬레이션 제어
            </div>
            <button
              onClick={handleResetAngles}
              className="p-1 hover:bg-hover-light rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-subtext" />
            </button>
          </div>

          <div className="space-y-4">
            {/* X-Axis Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-subtext uppercase">Rotation (X)</span>
                <span className="text-accent-dark font-bold">{currentAngleX}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={currentAngleX}
                onChange={(e) => setRotationAngleX(selectedNodeName, Number(e.target.value))}
                className="w-full h-1 bg-line rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Y-Axis Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-subtext uppercase">Rotation (Y)</span>
                <span className="text-accent-dark font-bold">{currentAngleY}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={currentAngleY}
                onChange={(e) => setRotationAngleY(selectedNodeName, Number(e.target.value))}
                className="w-full h-1 bg-line rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="w-full h-full outline-none" />
    </div>
  );
}
