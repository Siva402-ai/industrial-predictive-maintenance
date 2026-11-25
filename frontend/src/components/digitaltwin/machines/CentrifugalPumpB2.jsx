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

export default function CentrifugalPumpB2({
  id = 'M-002',
  name = 'Centrifugal Pump B2',
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
      <SelectionHalo width={4.6} depth={6.6} isSelected={isSelected} />

      {/* Structural Mounting Skid */}
      <BaseFrame width={3.8} length={6.2} height={0.35} color="#1e293b" />

      {/* 1. Drive Motor (Aft) */}
      <MotorBody
        radius={0.8}
        length={2.2}
        color="#1d4ed8" // Industrial blue
        finCount={10}
        hasTerminalBox={true}
        position={[0, 1.15, -1.4]}
      />

      {/* 2. Bearing Frame Pedestal & Coupling */}
      <group position={[0, 1.15, 0.2]}>
        <ShaftCoupling radius={0.3} length={0.4} position={[0, 0, -0.3]} />
        {/* Cast Bearing Housing */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.8, 0.7]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Oil Sump Cap */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.12, 12]} />
          <meshStandardMaterial color="#eab308" metalness={0.8} />
        </mesh>
      </group>

      {/* 3. Centrifugal Pump Volute Casing (Forward) */}
      <group position={[0, 1.15, 1.4]}>
        {/* Spiral Volute Main Body */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[1.1, 1.1, 0.65, 24]} />
          <meshStandardMaterial color="#1e40af" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Volute Spiral Bulge Accent */}
        <mesh position={[0.45, 0.35, 0]} rotation={[0, 0, -0.4]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.62, 16]} />
          <meshStandardMaterial color="#1d4ed8" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Suction Inlet Pipe (Axial, Facing Front) */}
        <PipeFlange
          pipeRadius={0.32}
          flangeRadius={0.52}
          length={0.9}
          position={[0, 0, 0.6]}
          rotation={[Math.PI / 2, 0, 0]}
          color="#334155"
        />

        {/* Discharge Outlet Pipe (Vertical, Facing Up) */}
        <PipeFlange
          pipeRadius={0.26}
          flangeRadius={0.46}
          length={1.2}
          position={[0.45, 1.0, 0]}
          rotation={[0, 0, 0]}
          color="#334155"
        />

        {/* Pressure Gauge on Discharge Spool */}
        <group position={[0.45, 1.4, 0.3]}>
          <mesh rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.06, 16]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.2} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* Identification Nameplate */}
      <MachinePlacard id={id} name={name} position={[0, 0.45, 2.9]} />

      {/* Status Signal Tower */}
      <StatusBeacon status={status} position={[1.6, 2.3, 2.5]} />
    </group>
  );
}

