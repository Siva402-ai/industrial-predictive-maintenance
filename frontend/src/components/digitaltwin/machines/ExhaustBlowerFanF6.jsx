import React from 'react';
import {
  BaseFrame,
  MotorBody,
  MachinePlacard,
  StatusBeacon,
  SelectionHalo,
} from './CommonParts';

export default function ExhaustBlowerFanF6({
  id = 'M-006',
  name = 'Exhaust Blower Fan F6',
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
      <SelectionHalo width={5.6} depth={6.8} isSelected={isSelected} />

      {/* Structural Support Skid */}
      <BaseFrame width={4.8} length={6.2} height={0.35} color="#1e293b" />

      {/* 1. Large Snail-Shell / Scroll Centrifugal Blower Housing */}
      <group position={[0.7, 1.8, 0]}>
        {/* Main Cylindrical Scroll Body */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[1.65, 1.65, 1.2, 24]} />
          <meshStandardMaterial color="#c2410c" metalness={0.65} roughness={0.35} />
        </mesh>

        {/* Scroll Expansion Tangent Bulge */}
        <mesh position={[-0.8, -0.6, 0]} rotation={[0, 0, 0.5]} castShadow>
          <boxGeometry args={[1.2, 1.8, 1.18]} />
          <meshStandardMaterial color="#ea580c" metalness={0.65} roughness={0.35} />
        </mesh>

        {/* Vertical Exhaust Discharge Duct */}
        <group position={[-1.2, 1.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 1.4, 1.15]} />
            <meshStandardMaterial color="#9a3412" metalness={0.7} roughness={0.35} />
          </mesh>
          {/* Top Bolted Discharge Duct Flange */}
          <mesh position={[0, 0.72, 0]} castShadow>
            <boxGeometry args={[1.1, 0.1, 1.35]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        </group>

        {/* Circular Axial Air Inlet Port (Facing Right / Motor Side) */}
        <group position={[0.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.85, 0.85, 0.2, 24]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Intake Wire Mesh Guard Screen */}
          <mesh position={[0, 0.11, 0]}>
            <circleGeometry args={[0.82, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} wireframe />
          </mesh>
        </group>
      </group>

      {/* 2. Side Pedestal Drive Motor & Belt Drive */}
      <group position={[-1.4, 0, 0]}>
        {/* Drive Motor Foundation Pedestal */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[1.4, 0.5, 2.2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>

        {/* Drive Motor */}
        <MotorBody
          radius={0.65}
          length={1.8}
          color="#334155" // Charcoal dark motor
          finCount={10}
          hasTerminalBox={true}
          position={[0, 1.45, 0]}
        />

        {/* Belt Drive Protective Enclosure Guard connecting to Blower Shaft */}
        <mesh position={[0.9, 1.6, 0]} castShadow>
          <boxGeometry args={[0.35, 1.4, 1.6]} />
          <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Identification Nameplate */}
      <MachinePlacard id={id} name={name} position={[0, 0.45, 2.9]} />

      {/* Status Signal Tower */}
      <StatusBeacon status={status} position={[2.0, 2.8, 2.4]} />
    </group>
  );
}

