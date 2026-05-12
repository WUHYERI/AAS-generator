import { useEffect, useRef } from 'react'; // React 미사용 경고 해결 (React 제거)
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
import 'lucide-react';
import { useViewerStore } from '../../store/useViewerStore';
import { Move, RotateCcw } from 'lucide-react';

function ModelViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const hlRef = useRef<HighlightLayer | null>(null);

  const { selectedNodeName, setSelectedNodeName, setRotationAngle, rotationAngle } =
    useViewerStore();

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

    // '_evt'로 변경하여 미사용 변수 경고 해결
    scene.onPointerDown = (_evt, pickResult) => {
      if (pickResult.hit && pickResult.pickedMesh) {
        setSelectedNodeName(pickResult.pickedMesh.name);
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
    // 의존성 배열에 setSelectedNodeName 추가
  }, [setSelectedNodeName]);

  // 테두리 효과
  useEffect(() => {
    const scene = sceneRef.current;
    const hl = hlRef.current;
    if (!scene || !hl) return;

    hl.removeAllMeshes();

    if (selectedNodeName) {
      // 'as Mesh'를 추가하여 AbstractMesh 타입 에러 해결 (에러 코드 2345)
      const mesh = scene.getMeshByName(selectedNodeName) as Mesh;
      if (mesh) {
        hl.addMesh(mesh, new Color3(0.1, 0.6, 1));
      }
    }
  }, [selectedNodeName]);

  // 회전 제어
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !selectedNodeName) return;

    const target =
      scene.getTransformNodeByName(selectedNodeName) || scene.getMeshByName(selectedNodeName);

    if (target) {
      target.rotation.y = rotationAngle * (Math.PI / 180);
    }
  }, [rotationAngle, selectedNodeName]);

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
              onClick={() => setRotationAngle(0)}
              className="p-1 hover:bg-hover-light rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-subtext" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-subtext uppercase">Rotation (Y)</span>
              <span className="text-accent-dark font-bold">{rotationAngle}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(Number(e.target.value))}
              className="w-full h-1 bg-line rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="w-full h-full outline-none" />
    </div>
  );
}

export default ModelViewer;
