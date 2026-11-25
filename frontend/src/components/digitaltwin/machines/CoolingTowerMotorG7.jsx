import React from 'react';
import {
  BaseFrame,
  MachinePlacard,
  StatusBeacon,
  SelectionHalo,
} from './CommonParts';

export default function CoolingTowerMotorG7({
  id = 'M-007',
  name = 'Cooling Tower Motor G7',
  status = 'Operational',
  isSelected = false,
  onClick,
  onPointerOver,
  onPointerOut,
}) {
  return (
    <group
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      cursor={onClick ? 'pointer' : 'default'}
    >
      <SelectionHalo width={5.4} depth={6.4} isSelected={isSelected} />

      {/* Heavy Base Skid Frame */}
      <BaseFrame width={4.4} length={5.8} height={0.35} color="#1e293b" />

      {/* Elevated Structural Support Stanchions (Cooling Tower Deck Mount) */}
      {[
        [-1.6, -1.8],
        [1.6, -1.8],
        [-1.6, 1.8],
        [1.6, 1.8],
      ].map(([sx, sz], i) => (
        <group key={i} position={[sx, 0.95, sz]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.08, 1.5, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Base Gusset Plate */}
          <mesh position={[0, -0.7, 0]}>
            <boxGeometry args={[0.35, 0.08, 0.35]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
      ))}

      {/* Elevated Motor Mounting Ring Platform */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[1.9, 1.9, 0.12, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* 1. Vertical-Shaft Drive Motor (Center Mounted Under Fan) */}
      <group position={[0, 2.3, 0]}>
        {/* Vertical Cylindrical Motor Housing */}
        <mesh castShadow>
          <cylinderGeometry args={[0.75, 0.75, 1.4, 20]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Vertical Cooling Ribs */}
        {Array.from({ length: 12 }).map((_, fIdx) => {
          const angle = (fIdx / 12) * Math.PI * 2;
          const fx = Math.cos(angle) * 0.81;
          const fz = Math.sin(angle) * 0.81;
          return (
            <mesh key={fIdx} position={[fx, 0, fz]} rotation={[0, -angle, 0]} castShadow>
              <boxGeometry args={[0.04, 1.25, 0.12]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
          );
        })}

        {/* Top Vertical Shaft Extension */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.35, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>

        {/* Weatherproof Terminal Connection Box */}
        <mesh position={[0.78, 0.1, 0]} castShadow>
          <boxGeometry args={[0.35, 0.45, 0.45]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} />
        </mesh>
      </group>

      {/* 2. Aerofoil Multi-Blade Fan Hub & 6 Blades (Top Mounted, Y = 3.25) */}
      <group position={[0, 3.25, 0]}>
        {/* Central Cast Fan Hub */}
        <mesh castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.22, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>

        {/* 6 Aerofoil Fan Blades */}
        {Array.from({ length: 6 }).map((_, bIdx) => {
          const angle = (bIdx / 6) * Math.PI * 2;
          return (
            <group key={bIdx} rotation={[0, angle, 0.15]}>
              <mesh position={[1.1, 0, 0]} castShadow>
                <boxGeometry args={[1.45, 0.05, 0.32]} />
                <meshStandardMaterial color="#facc15" metalness={0.5} roughness={0.3} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 3. Outer Protective Cylindrical Fan Cowl / Shroud Ring */}
      <group position={[0, 3.25, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[2.0, 2.0, 0.65, 32, 1, true]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} side={2} />
        </mesh>
        {/* Top Protective Mesh Screen Wireframe */}
        <mesh position={[0, 0.33, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.98, 24]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} wireframe />
        </mesh>
      </group>

      {/* Identification Nameplate */}
      <MachinePlacard id={id} name={name} position={[0, 0.45, 2.7]} />

      {/* Status Signal Tower */}
      <StatusBeacon status={status} position={[1.8, 2.6, 2.3]} />
    </group>
  );
}

