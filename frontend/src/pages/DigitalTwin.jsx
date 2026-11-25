import React, { useState, useRef, Suspense } from 'react';
import FactoryScene from '../components/digitaltwin/FactoryScene';
import TwinOverlay from '../components/digitaltwin/TwinOverlay';
import { Activity, AlertTriangle, RefreshCw } from 'lucide-react';

function SceneLoadingFallback() {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-100 text-slate-800">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
        <Activity className="w-6 h-6 text-blue-600 absolute animate-pulse" />
      </div>
      <div className="mt-5 text-center font-mono">
        <div className="text-sm font-bold tracking-widest text-slate-800 uppercase">
          INITIALIZING INDUSTRIAL NEXUS 3D ENGINE
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Loading smart manufacturing facility & machine digital twins...
        </div>
      </div>
    </div>
  );
}

class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DigitalTwin 3D WebGL Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-950 p-6 text-white font-mono">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-red-200 uppercase tracking-wide">
              3D Viewport Initialization Error
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-sans">
              Could not initialize the 3D WebGL canvas. This may occur if hardware acceleration is disabled in your browser.
            </p>
            <div className="mt-4 p-2.5 bg-black/50 rounded-lg text-left text-[11px] text-red-300 font-mono overflow-x-auto">
              {this.state.error?.message || 'Unknown WebGL context error'}
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Initialization</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function DigitalTwin({
  selectedMachineId: parentSelectedId,
  onSelectMachine: parentOnSelectMachine,
  currentData,
  backendStatus = true,
}) {
  const sceneRef = useRef(null);

  // Initialize selectedMachineId to null on 3D Digital Twin page mount
  // This guarantees all 8 machines are 100% visible and unoccluded by the detail card until clicked
  const [activeSelectedId, setActiveSelectedId] = useState(null);

  const handleSelectMachine = (machineId) => {
    setActiveSelectedId(machineId);
    if (parentOnSelectMachine) {
      parentOnSelectMachine(machineId);
    }
  };

  const handleDeselectMachine = () => {
    setActiveSelectedId(null);
    if (parentOnSelectMachine) {
      parentOnSelectMachine(null);
    }
  };

  const [showSafetyMarkings, setShowSafetyMarkings] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showCeilingStructure, setShowCeilingStructure] = useState(true);
  const [isNightShift, setIsNightShift] = useState(false);

  const handleResetCamera = () => {
    if (sceneRef.current?.resetCamera) {
      sceneRef.current.resetCamera();
    }
  };

  const handleSetCameraView = (presetName) => {
    if (sceneRef.current?.setCameraView) {
      sceneRef.current.setCameraView(presetName);
    }
  };

  return (
    <div
      className={`relative w-full h-[calc(100vh-80px)] rounded-2xl overflow-hidden border shadow-2xl transition-colors duration-500 ${
        isNightShift
          ? 'border-slate-800 bg-[#0f172a]'
          : 'border-slate-300 bg-[#f1f5f9]'
      }`}
    >
      {/* HUD & Viewport Controls Overlay */}
      <TwinOverlay
        onResetCamera={handleResetCamera}
        onSetCameraView={handleSetCameraView}
        showSafetyMarkings={showSafetyMarkings}
        setShowSafetyMarkings={setShowSafetyMarkings}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showCeilingStructure={showCeilingStructure}
        setShowCeilingStructure={setShowCeilingStructure}
        isNightShift={isNightShift}
        setIsNightShift={setIsNightShift}
        selectedMachineId={activeSelectedId}
        onDeselectMachine={handleDeselectMachine}
        currentData={currentData}
        backendStatus={backendStatus}
      />

      {/* 3D Scene Viewport */}
      <WebGLErrorBoundary>
        <Suspense fallback={<SceneLoadingFallback />}>
          <FactoryScene
            ref={sceneRef}
            showSafetyMarkings={showSafetyMarkings}
            showGrid={showGrid}
            showCeilingStructure={showCeilingStructure}
            isNightShift={isNightShift}
            selectedMachineId={activeSelectedId}
            onSelectMachine={handleSelectMachine}
            currentData={currentData}
            backendStatus={backendStatus}
          />
        </Suspense>
      </WebGLErrorBoundary>
    </div>
  );
}

