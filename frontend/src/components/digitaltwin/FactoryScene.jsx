import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FactoryFloor from './FactoryFloor';
import FactoryPillars from './FactoryPillars';
import FactoryWalkways from './FactoryWalkways';
import FactoryLighting from './FactoryLighting';
import MachineFleet from './machines/MachineFleet';

// Redesigned frontal, slightly elevated isometric perspective
// Ensures all 8 machines are immediately visible, centered, and distinguishable without occlusion
const DEFAULT_CAMERA = {
  position: [0, 35.0, 45.0],
  target: [0, 0.5, -2.0],
};

const CAMERA_PRESETS = {
  isometric: { position: [0, 34.0, 44.0], target: [0, 0.5, 0] },
  top: { position: [0, 52, 0.1], target: [0, 0, 0] },
  aisle: { position: [0, 3.8, 25], target: [0, 1.8, -6] },
};

function SceneController({ controlsRef, imperativeRef }) {
  const { camera } = useThree();

  useImperativeHandle(imperativeRef, () => ({
    resetCamera: () => {
      if (controlsRef.current) {
        camera.position.set(...DEFAULT_CAMERA.position);
        controlsRef.current.target.set(...DEFAULT_CAMERA.target);
        controlsRef.current.update();
      }
    },
    setCameraView: (presetName) => {
      const preset = CAMERA_PRESETS[presetName] || DEFAULT_CAMERA;
      if (controlsRef.current) {
        camera.position.set(...preset.position);
        controlsRef.current.target.set(...preset.target);
        controlsRef.current.update();
      }
    },
  }));

  return null;
}

const FactoryScene = forwardRef(function FactoryScene(
  {
    showSafetyMarkings = true,
    showGrid = true,
    showCeilingStructure = true,
    isNightShift = false,
    selectedMachineId = null,
    onSelectMachine = null,
    currentData = null,
  },
  ref
) {
  const controlsRef = useRef();
  const bgColor = isNightShift ? '#0f172a' : '#f1f5f9';
  const fogColor = isNightShift ? '#0f172a' : '#e2e8f0';

  return (
    <div className={`w-full h-full relative overflow-hidden ${isNightShift ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
      <Canvas
        shadows
        onPointerMissed={(e) => {
          if (e.type === 'click' && onSelectMachine) {
            onSelectMachine(null);
          }
        }}
        camera={{
          position: DEFAULT_CAMERA.position,
          fov: 44,
          near: 0.1,
          far: 250,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]} // Crisp on high-DPI, throttles safely for performance
      >
        {/* Modern Clean Facility Atmospheric Horizon & Soft Fog */}
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[fogColor, 45, 130]} />

        {/* OrbitControls with smooth damping and floor constraints */}
        <OrbitControls
          ref={controlsRef}
          target={DEFAULT_CAMERA.target}
          enableDamping
          dampingFactor={0.06}
          minDistance={6}
          maxDistance={90}
          maxPolarAngle={Math.PI / 2 - 0.04} // Prevents camera from dipping below the floor
        />

        <SceneController controlsRef={controlsRef} imperativeRef={ref} />

        {/* Lighting Setup */}
        <FactoryLighting isNightShift={isNightShift} />

        {/* Factory Architecture Components */}
        <FactoryFloor showSafetyMarkings={showSafetyMarkings} showGrid={showGrid} />
        <FactoryPillars showCeilingStructure={showCeilingStructure} />
        <FactoryWalkways />

        {/* 8 Interactive 3D Industrial Machine Units */}
        <MachineFleet
          selectedMachineId={selectedMachineId}
          onSelectMachine={onSelectMachine}
          currentData={currentData}
        />
      </Canvas>
    </div>
  );
});

export default FactoryScene;
