import React from 'react';
import {
  BaseFrame,
  MachinePlacard,
  StatusBeacon,
  SelectionHalo,
} from './CommonParts';

export default function HeavyDutyGearboxH8({
  id = 'M-008',
  name = 'Heavy Duty Gearbox H8',
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
      <SelectionHalo width={5.4} depth={6.8} isSelected={isSelected} />

      {/* Heavy Structural Mounting Skid Frame */}
      <BaseFrame width={4.6} length={6.2} height={0.4} color="#1e293b" />

      {/* 1. Heavy Industrial Reduction Gearbox Housing Assembly */}
      <group position={[0, 1.45, 0]}>
        {/* Lower Sump Casing Half */}
        <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 1.0, 3.2]} />
          <meshStandardMaterial color="#991b1b" metalness={0.65} roughness={0.4} />
        </mesh>

        {/* Upper Casing Half (Stepped Multi-Stage Shape) */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.9, 3.0]} />
          <meshStandardMaterial color="#b91c1c" metalness={0.65} roughness={0.4} />
        </mesh>

        {/* Heavy Flanged Center Parting Line Seam */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[3.0, 0.14, 3.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Reinforcement / Stiffening Gusset Ribs across housing */}
        {[-1.1, 0, 1.1].map((rz, i) => (
          <group key={i} position={[0, 0.45, rz]}>
            <mesh position={[-1.35, 0, 0]} castShadow>
              <boxGeometry args={[0.12, 0.8, 0.16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            <mesh position={[1.35, 0, 0]} castShadow>
              <boxGeometry args={[0.12, 0.8, 0.16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Top Inspection Access Cover Plate (Bolted) */}
        <group position={[0, 0.95, -0.2]}>
          <mesh castShadow>
            <boxGeometry args={[1.5, 0.08, 1.6]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Cover Plate Fasteners */}
          {[-0.6, 0.6].map((bx, xIdx) =>
            [-0.6, 0.6].map((bz, zIdx) => (
              <mesh key={`${xIdx}-${zIdx}`} position={[bx, 0.06, bz]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.06, 6]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} />
              </mesh>
            ))
          )}
          {/* Air Breather Vent Cap */}
          <group position={[0, 0.25, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.12, 0.12, 0.35, 12]} />
              <meshStandardMaterial color="#eab308" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.08, 16]} />
              <meshStandardMaterial color="#ca8a04" metalness={0.8} />
            </mesh>
          </group>
        </group>

        {/* High-Speed Input Shaft (Rear / -Z) */}
        <group position={[0, -0.15, -1.8]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.8, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Keyway */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[0.06, 0.06, 0.45]} />
            <meshStandardMaterial color="#475569" metalness={0.9} />
          </mesh>
          {/* Bearing Retainer Flange */}
          <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.48, 0.48, 0.12, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        </group>

        {/* Heavy Low-Speed Output Shaft (Front / +Z) */}
        <group position={[0, -0.15, 1.8]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.48, 0.48, 0.95, 20]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Heavy Keyway */}
          <mesh position={[0, 0.48, 0]} castShadow>
            <boxGeometry args={[0.1, 0.1, 0.6]} />
            <meshStandardMaterial color="#475569" metalness={0.9} />
          </mesh>
          {/* Large Bearing Retainer Flange */}
          <mesh position={[0, 0, -0.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.72, 0.72, 0.15, 20]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        </group>

        {/* Oil Level Sight Glass (Right Side) */}
        <group position={[1.42, -0.4, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          <mesh position={[0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.11, 0.11, 0.06, 16]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
        </group>
      </group>

      {/* Identification Nameplate */}
      <MachinePlacard id={id} name={name} position={[0, 0.45, 2.9]} />

      {/* Status Signal Tower */}
      <StatusBeacon status={status} position={[1.8, 2.6, 2.5]} />
    </group>
  );
}

