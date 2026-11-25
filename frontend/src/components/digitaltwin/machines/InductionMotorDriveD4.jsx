import React from 'react';
import {
  BaseFrame,
  MotorBody,
  MachinePlacard,
  StatusBeacon,
  SelectionHalo,
} from './CommonParts';

export default function InductionMotorDriveD4({
  id = 'M-004',
  name = 'Induction Motor Drive D4',
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
      <SelectionHalo width={4.4} depth={6.4} isSelected={isSelected} />

      {/* Heavy Base Skid Frame */}
      <BaseFrame width={3.6} length={5.8} height={0.35} color="#1e293b" />

      {/* Elevated Motor Foundation Pedestals (Front & Rear Cast Feet) */}
      {[-1.2, 1.2].map((fz, i) => (
        <group key={i} position={[0, 0.45, fz]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.4, 0.3, 0.6]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Mounting Bolt Fasteners */}
          {[-0.9, 0.9].map((bx, bIdx) => (
            <mesh key={bIdx} position={[bx, 0.18, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.12, 6]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Main Induction Motor Assembly */}
      <MotorBody
        radius={1.05}
        length={3.2}
        color="#2563eb" // Classic industrial motor royal blue
        finCount={16}
        hasTerminalBox={true}
        position={[0, 1.65, 0]}
      />

      {/* Prominent Drive Shaft with Machined Step */}
      <group position={[0, 1.65, 2.0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.9, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Shaft Keyway Key */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.5]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} />
        </mesh>
      </group>

      {/* Rear Cooling Fan Cowl Guard Screen */}
      <mesh position={[0, 1.65, -1.82]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[1.0, 1.0, 0.05, 24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Lifting Eye Bolt on Top */}
      <group position={[0, 2.85, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.16, 0.04, 8, 16]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} />
        </mesh>
      </group>

      {/* Identification Nameplate */}
      <MachinePlacard id={id} name={name} position={[0, 0.45, 2.7]} />

      {/* Status Signal Tower */}
      <StatusBeacon status={status} position={[1.5, 2.6, 2.2]} />
    </group>
  );
}

