import React from 'react';

/**
 * Modern High-Luminance Industrial Lighting Rig
 * Designed for clean, daylight smart-manufacturing visibility and iGPU performance.
 */
export default function FactoryLighting({ isNightShift = false }) {
  // Overhead Modern High-Bay Luminaire Fixtures
  const lampPositions = [
    [-24, 11, -14],
    [-8, 11, -14],
    [8, 11, -14],
    [24, 11, -14],
    [-24, 11, 14],
    [-8, 11, 14],
    [8, 11, 14],
    [24, 11, 14],
    [0, 11.2, 0], // Central aisle high-bay
  ];

  return (
    <group name="FactoryLightingGroup">
      {/* 1. Daylight Sky + Ground Bounce Hemisphere Lighting */}
      <hemisphereLight
        args={['#ffffff', '#cbd5e1', isNightShift ? 0.45 : 1.15]}
      />

      {/* 2. Global Ambient Uniform Fill (Ensures machine undercuts/recesses stay clearly visible) */}
      <ambientLight
        color="#f8fafc"
        intensity={isNightShift ? 0.35 : 0.65}
      />

      {/* 3. Primary Directional Daylight Sunlight (Frontal-side angle illuminates machine faces directly) */}
      <directionalLight
        position={[16, 40, 30]}
        intensity={isNightShift ? 0.4 : 1.45}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={110}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={38}
        shadow-camera-bottom={-38}
        shadow-bias={-0.0003}
      />

      {/* 4. Secondary Soft Cool Fill Light */}
      <directionalLight
        position={[-22, 28, -20]}
        intensity={isNightShift ? 0.2 : 0.55}
        color="#e2e8f0"
      />

      {/* 5. Modern Smart Factory Pendant LED Fixtures */}
      {lampPositions.map(([lx, ly, lz], idx) => (
        <group key={idx} position={[lx, ly, lz]}>
          {/* Suspension Conduit Wire */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>

          {/* Modern White Industrial Reflector Fixture */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.65, 0.35, 16, 1, true]} />
            <meshStandardMaterial
              color="#e2e8f0"
              metalness={0.2}
              roughness={0.4}
              side={2}
            />
          </mesh>

          {/* Clean Daylight LED Diffuser Lens */}
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.26, 16, 12]} />
            <meshStandardMaterial
              color="#f8fafc"
              emissive="#f8fafc"
              emissiveIntensity={isNightShift ? 1.5 : 0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

