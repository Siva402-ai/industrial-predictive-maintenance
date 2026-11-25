import React, { useMemo } from 'react';
import { createHazardTexture } from './textures';

/**
 * Modern Factory Perimeter Structural Columns
 * All columns are positioned along the North backdrop and outer side walls.
 * Centerline (X = 0) is completely open with zero visual obstructions.
 */
export default function FactoryPillars({ showCeilingStructure = true }) {
  const hazardPillarTexture = useMemo(() => {
    const tex = createHazardTexture(12, 128, 128);
    tex.repeat.set(1, 4);
    return tex;
  }, []);

  // Columns positioned symmetrically along the NORTH background wall (Z = -26)
  // leaving the center aisle (X = 0) completely open and clear
  const backgroundColumns = [
    [-30, 0, -26],
    [-14, 0, -26],
    [14, 0, -26],
    [30, 0, -26],
    // Outer side columns flush against West and East walls
    [-36.5, 0, -12],
    [-36.5, 0, 12],
    [36.5, 0, -12],
    [36.5, 0, 12],
  ];

  const pillarHeight = 11;

  return (
    <group name="FactoryStructuralGroup">
      {/* 1. Perimeter Structural Columns */}
      {backgroundColumns.map(([px, py, pz], idx) => (
        <group key={idx} position={[px, py, pz]}>
          {/* Concrete Base Pedestal - Modern Light Architectural Finish */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.3, 0.8, 1.3]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.7} metalness={0.1} />
          </mesh>

          {/* Yellow Hazard Skirt on Pedestal */}
          <mesh position={[0, 0.4, 0.66]}>
            <planeGeometry args={[1.2, 0.55]} />
            <meshBasicMaterial map={hazardPillarTexture} />
          </mesh>
          <mesh position={[0, 0.4, -0.66]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[1.2, 0.55]} />
            <meshBasicMaterial map={hazardPillarTexture} />
          </mesh>

          {/* Modern Off-White / Steel H-Beam Column (Central Web) */}
          <mesh position={[0, pillarHeight / 2 + 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.18, pillarHeight, 0.7]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.6} />
          </mesh>

          {/* Modern Steel H-Beam Column (Left Flange) */}
          <mesh position={[-0.32, pillarHeight / 2 + 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.08, pillarHeight, 0.9]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.6} />
          </mesh>

          {/* Modern Steel H-Beam Column (Right Flange) */}
          <mesh position={[0.32, pillarHeight / 2 + 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.08, pillarHeight, 0.9]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.6} />
          </mesh>

          {/* Top Column Capital & Gusset Bracket */}
          <mesh position={[0, pillarHeight + 0.8, 0]} castShadow>
            <boxGeometry args={[1.1, 0.25, 1.1]} />
            <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* 2. North Wall Top Header Beam (Background Only) */}
      {showCeilingStructure && (
        <group name="RoofTrusses">
          <mesh position={[0, pillarHeight + 0.9, -26]} castShadow>
            <boxGeometry args={[72, 0.45, 0.5]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.5} metalness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
}
