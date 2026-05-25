import { useEffect, useRef } from 'react';
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
import { Move, RotateCcw } from 'lucide-react';

function ModelViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const hlRef = useRef<HighlightLayer | null>(null);

  // 개별 맵 구조로 변경된 스토어 구독
  const {
    selectedNodeName,
    setSelectedNodeName,
    rotationAnglesX,
    rotationAnglesY,
    setRotationAngleX,
    setRotationAngleY,
  } = useViewerStore();

  // 현재 선택된 부품의 고유 각도 꺼내기 (기본값 0)
  const currentAngleX = selectedNodeName ? rotationAnglesX[selectedNodeName] || 0 : 0;
  const currentAngleY = selectedNodeName ? rotationAnglesY[selectedNodeName] || 0 : 0;

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    engine.displayLoadingUI();

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

    ImportMeshAsync('/mock/Untitled.glb', scene).then((result) => {
      const root = result.meshes[0];
      camera.setTarget(root.getAbsolutePivotPoint().clone());
      engine.hideLoadingUI();
    });

    // 클릭 핸들러: 대표 파츠 문자열 추출
    scene.onPointerDown = (_evt, pickResult) => {
      if (pickResult.hit && pickResult.pickedMesh) {
        const pickedName = pickResult.pickedMesh.name;
        const baseName = pickedName.split('_primitive')[0].split('.')[0];
        setSelectedNodeName(baseName);
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
    };
  }, [setSelectedNodeName]);

  // 테두리(하이라이트) 효과 구현
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

  // ★ 개별 부품 독립 회전 제어 구현
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // 스토어에 기록된 모든 부품들의 개별 각도를 씬 전체 메쉬에 각각 주입
    scene.meshes.forEach((mesh) => {
      // 메쉬의 원래 기하학적 baseName 추출
      const baseName = mesh.name.split('_primitive')[0].split('.')[0];

      // 해당 부품 이름으로 저장된 각도가 있다면 가져옴 (없으면 0)
      const degX = rotationAnglesX[baseName] || 0;
      const degY = rotationAnglesY[baseName] || 0;

      const radX = degX * (Math.PI / 180);
      const radY = degY * (Math.PI / 180);

      // 쿼터니언 해제 및 개별 회전 적용
      if (mesh.rotationQuaternion) {
        mesh.rotationQuaternion = null;
      }
      mesh.rotation.x = radX;
      mesh.rotation.y = radY;
      mesh.computeWorldMatrix(true);
    });
  }, [rotationAnglesX, rotationAnglesY]); // 모든 각도 맵의 변화를 감지하여 유기적 연동

  // 현재 선택된 관절 초기화
  const handleResetAngles = () => {
    if (selectedNodeName) {
      setRotationAngleX(selectedNodeName, 0);
      setRotationAngleY(selectedNodeName, 0);
    }
  };

  return (
    <div className="w-full h-full relative bg-surface">
      {/* 부품 표시 UI */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-md shadow-sm border border-line px-3 py-1.5 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[12px] font-bold text-slate-700">
            {selectedNodeName || 'Select Component'}
          </span>
        </div>
      </div>

      {/* 우측 하단 제어기 */}
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
            {/* X축 제어 슬라이더 */}
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

            {/* Y축 제어 슬라이더 */}
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

export default ModelViewer;
