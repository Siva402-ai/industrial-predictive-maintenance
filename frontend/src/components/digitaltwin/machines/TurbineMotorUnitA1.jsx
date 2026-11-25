import React from 'react';
import {
  BaseFrame,
  MotorBody,
  ShaftCoupling,
  PipeFlange,
  MachinePlacard,
  StatusBeacon,
  SelectionHalo,
} from './CommonParts';

export default function TurbineMotorUnitA1({
  id = 'M-001',
  name = 'Turbine Motor Unit A1',
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
      <SelectionHalo width={5.2} depth={7.4} isSelected={isSelected} />

      {/* Structural Base Skid Frame */}
      <BaseFrame width={4.2} length={6.8} height={0.4} color="#1e293b" />

      {/* 1. Industrial Drive Motor (Aft Section) */}
      <MotorBody
        radius={0.88}
        length={2.6}
        color="#0891b2" // Cyan/Teal industrial tone
        finCount={12}
        hasTerminalBox={true}
        position={[0, 1.25, -1.6]}
      />

      {/* 2. Shaft Coupling & Protective Cage Shroud */}
      <ShaftCoupling radius={0.34} length={0.5} position={[0, 1.25, 0.05]} />
      <mesh position={[0, 1.25, 0.05]} castShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.65, 16, 1, true]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} wireframe={false} />
      </mesh>

      {/* 3. Turbine Casing Assembly (Forward Section) */}
      <group position={[0, 1.25, 1.7]}>
        {/* Main High-Pressure Turbine Casing (Tapered Cone) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.1, 0.85, 1.6, 24]} />
          <meshStandardMaterial color="#0e7490" metalness={0.65} roughness={0.35} />
        </mesh>

        {/* Flanged Split Casing Rings */}
        {[-0.6, 0.0, 0.6].map((rz, i) => (
          <mesh key={i} position={[0, 0, rz]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[1.18, 1.18, 0.1, 24]} />
            <meshStandardMaterial color="#164e63" metalness={0.8} roughness={0.25} />
          </mesh>
        ))}

        {/* Exhaust Diffuser Bell (Front Cone) */}
        <mesh position={[0, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.35, 1.1, 0.7, 24]} />
          <meshStandardMaterial color="#155e75" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Overhead Steam/Gas Inlet Scroll Flange */}
        <PipeFlange
          pipeRadius={0.28}
          flangeRadius={0.48}
          length={0.9}
          position={[0, 1.35, -0.2]}
          rotation={[0, 0, 0]}
          color="#1e293b"
        />

        {/* Side Bypasses / Lube Oil Lines */}
        <mesh position={[0.95, -0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
      </group>

      {/* Identification Nameplate */}
      <MachinePlacard id={id} name={name} position={[0, 0.5, 3.2]} />

      {/* Status Signal Tower */}
      <StatusBeacon status={status} position={[1.8, 2.4, 2.8]} />
    </group>
  );
}

