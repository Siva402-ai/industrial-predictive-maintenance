import React from 'react';

/**
 * Modern Factory Safety Walkways & Demarcations
 * Designed with open sightlines so zero railings obstruct the 8 machine bays.
 */
export default function FactoryWalkways() {
  // Safety boundary bollards positioned at bay corners (leaving machine front facades 100% open)
  const bollardPositions = [
    // West bays safety bollards
    [-23.5, 0, -8.6],
    [-8.5, 0, -8.6],
    [8.5, 0, -8.6],
    [23.5, 0, -8.6],
    [-23.5, 0, 8.6],
    [-8.5, 0, 8.6],
    [8.5, 0, 8.6],
    [23.5, 0, 8.6],
  ];

  return (
    <group name="FactoryWalkwaysGroup">
      {/* 1. Modern Safety Bollards (Compact, professional boundary markers) */}
      {bollardPositions.map(([bx, by, bz], bIdx) => (
        <group key={bIdx} position={[bx, by, bz]}>
          {/* Base flange plate */}
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Safety Yellow Bollard Post */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.86, 16]} />
            <meshStandardMaterial color="#facc15" roughness={0.3} metalness={0.4} />
          </mesh>
          {/* High-visibility reflective band */}
          <mesh position={[0, 0.72, 0]}>
            <cylinderGeometry args={[0.105, 0.105, 0.12, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          {/* Stainless steel domed top */}
          <mesh position={[0, 0.88, 0]}>
            <sphereGeometry args={[0.1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* 2. Elevated Inspection Catwalk (North Perimeter, Z = -22, Y = 2.4m) */}
      <group position={[-14, 2.2, -22]}>
        {/* Catwalk Floor Platform - Galvanized steel grating finish */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[26, 0.12, 2.6]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Platform Support Stanchions to Ground */}
        {[-12, -4, 4, 12].map((stX, stIdx) => (
          <mesh key={stIdx} position={[stX, -1.1, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 2.2, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}

        {/* Catwalk Safety Handrail (Front Edge) */}
        <group position={[0, 0, 1.25]}>
          <mesh position={[0, 1.05, 0]} castShadow>
            <boxGeometry args={[26, 0.05, 0.05]} />
            <meshStandardMaterial color="#facc15" metalness={0.4} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[26, 0.035, 0.035]} />
            <meshStandardMaterial color="#facc15" metalness={0.4} roughness={0.3} />
          </mesh>
          {Array.from({ length: 9 }).map((_, cpIdx) => (
            <mesh key={cpIdx} position={[-12 + cpIdx * 3, 0.55, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, 1.1, 8]} />
              <meshStandardMaterial color="#facc15" metalness={0.4} />
            </mesh>
          ))}
        </group>

        {/* Catwalk Access Stairs */}
        <group position={[13, -1.1, 0]}>
          {Array.from({ length: 8 }).map((_, stepIdx) => {
            const stepY = -1.1 + stepIdx * 0.275;
            const stepX = stepIdx * 0.45;
            return (
              <mesh key={stepIdx} position={[stepX, stepY, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.45, 0.08, 1.8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  );
}

