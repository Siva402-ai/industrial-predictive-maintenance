import React from 'react';
import {
  BaseFrame,
  MotorBody,
  MachinePlacard,
  StatusBeacon,
  SelectionHalo,
} from './CommonParts';

export default function HydraulicGearPumpE5({
  id = 'M-005',
  name = 'Hydraulic Gear Pump E5',
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
      <SelectionHalo width={4.4} depth={6.2} isSelected={isSelected} />

      {/* Heavy Base Skid Frame (acting as hydraulic reservoir tank) */}
      <BaseFrame width={3.6} length={5.8} height={0.5} color="#1e293b" />

      {/* Hydraulic Fluid Sight Glass Level Gauge on Skid Side */}
      <group position={[1.81, 0.25, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.08, 0.2, 0.9]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 12]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.65} roughness={0.1} />
        </mesh>
      </group>

      {/* 1. Drive Motor (Aft) */}
      <MotorBody
        radius={0.75}
        length={2.0}
        color="#15803d" // Industrial machinery green
        finCount={10}
        hasTerminalBox={true}
        position={[0, 1.25, -1.2]}
      />

      {/* C-Face Motor-to-Pump Intermediate Bellhousing Adapter */}
      <mesh position={[0, 1.25, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.78, 0.78, 0.55, 20]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 2. Hydraulic Gear Pump Body (Forward) */}
      <group position={[0, 1.25, 0.9]}>
        {/* Main Precision Machined Gear Pump Block */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 1.2, 1.3]} />
          <meshStandardMaterial color="#166534" metalness={0.7} roughness={0.35} />
        </mesh>

        {/* Dual Intermeshing Gear Bearing Caps (Front Plate) */}
        <mesh position={[0, 0.25, 0.7]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.12, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.25, 0.7]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.12, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* High-Pressure Discharge Manifold Block (Left Side) */}
        <group position={[-0.75, 0.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.35, 0.55, 0.55]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Steel Braided Hydraulic Line Connection Port */}
          <mesh position={[-0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.25, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Suction Return Port Block (Right Side) */}
        <group position={[0.75, -0.1, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.35, 0.6, 0.6]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.25, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>

        {/* Pressure Relief Valve with Knurled Hand Knob on Top */}
        <group position={[0, 0.85, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.45, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.12, 16]} />
            <meshStandardMaterial color="#eab308" metalness={0.85} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* Identification Nameplate */}
      <MachinePlacard id={id} name={name} position={[0, 0.55, 2.7]} />

      {/* Status Signal Tower */}
      <StatusBeacon status={status} position={[1.5, 2.4, 2.3]} />
    </group>
  );
}

