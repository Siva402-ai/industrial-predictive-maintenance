import React from 'react';
import {
  BaseFrame,
  MotorBody,
  PipeFlange,
  MachinePlacard,
  StatusBeacon,
  SelectionHalo,
} from './CommonParts';

export default function ReciprocatingCompressorC3({
  id = 'M-003',
  name = 'Reciprocating Compressor C3',
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

      {/* Heavy Structural Mounting Skid */}
      <BaseFrame width={4.8} length={6.4} height={0.35} color="#1e293b" />

      {/* 1. Drive Motor (Left / Offset Aft) */}
      <MotorBody
        radius={0.75}
        length={2.2}
        color="#475569" // Slate industrial gray
        finCount={10}
        hasTerminalBox={true}
        position={[-1.2, 1.1, -1.2]}
      />

      {/* Belt Guard Shroud connecting motor to compressor flywheel */}
      <mesh position={[-0.2, 1.25, -1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <boxGeometry args={[0.3, 1.6, 1.8]} />
        <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* 2. Heavy Cast Crankcase Assembly (Right / Forward) */}
      <group position={[1.1, 0, 0]}>
        {/* Main Crankcase Housing Block */}
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 1.2, 2.2]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Side Crankcase Inspection Cover Plate */}
        <mesh position={[0.82, 1.0, 0]} castShadow>
          <boxGeometry args={[0.06, 0.75, 1.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Dual Compression Cylinders (Front and Rear Vertical Columns) */}
        {[-0.55, 0.55].map((cz, i) => (
          <group key={i} position={[0, 1.6, cz]}>
            {/* Cylinder Barrel */}
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.42, 0.45, 0.9, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Cylinder Cooling Fin Discs */}
            {[0.2, 0.4, 0.6, 0.8].map((fy, fIdx) => (
              <mesh key={fIdx} position={[0, fy, 0]} castShadow>
                <cylinderGeometry args={[0.52, 0.52, 0.04, 16]} />
                <meshStandardMaterial color="#0f172a" metalness={0.85} />
              </mesh>
            ))}

            {/* Finned Cylinder Valve Head Cap */}
            <mesh position={[0, 1.0, 0]} castShadow>
              <boxGeometry args={[0.88, 0.28, 0.88]} />
              <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Pulsation Damper Bottle / Accumulator (Horizontal Header Tank) */}
        <group position={[0, 3.0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 2.2, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.75} roughness={0.3} />
          </mesh>
          {/* Domed Ends */}
          <mesh position={[-1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <sphereGeometry args={[0.34, 16, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.75} />
          </mesh>
          <mesh position={[1.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <sphereGeometry args={[0.34, 16, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.75} />
          </mesh>
        </group>

        {/* Manifold Connecting Pipes from Cylinder Heads to Damper */}
        {[-0.55, 0.55].map((cz, i) => (
          <mesh key={i} position={[0, 2.5, cz]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.75, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.85} />
          </mesh>
        ))}

        {/* Discharge Outlet Flange */}
        <PipeFlange
          pipeRadius={0.18}
          flangeRadius={0.35}
          length={0.8}
          position={[0, 3.0, 1.4]}
          rotation={[Math.PI / 2, 0, 0]}
          color="#334155"
        />
      </group>

      {/* Identification Nameplate */}
      <MachinePlacard id={id} name={name} position={[0, 0.45, 3.0]} />

      {/* Status Signal Tower */}
      <StatusBeacon status={status} position={[2.0, 2.6, 2.6]} />
    </group>
  );
}

