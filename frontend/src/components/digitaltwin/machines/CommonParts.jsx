import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Creates a procedural canvas texture for machine identification plates.
 */
function createPlacardTexture(id, name) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  // Brushed aluminum dark background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 96);

  // Border outline
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.strokeRect(3, 3, 250, 90);

  // Machine ID badge
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(id, 14, 14);

  // Machine Name
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(name.toUpperCase().slice(0, 26), 14, 58);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Industrial Skid Base Frame with Anchor Feet
 */
export function BaseFrame({ width = 3.6, length = 6.0, height = 0.35, color = '#1e293b' }) {
  return (
    <group position={[0, height / 2, 0]}>
      {/* Main Structural Skid Plate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Side Channel Lip Trim */}
      <mesh position={[-width / 2 + 0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.15, height + 0.08, length]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[width / 2 - 0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.15, height + 0.08, length]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 4 Corner Anchor Bolt Pads */}
      {[
        [-width / 2 + 0.35, -length / 2 + 0.35],
        [width / 2 - 0.35, -length / 2 + 0.35],
        [-width / 2 + 0.35, length / 2 - 0.35],
        [width / 2 - 0.35, length / 2 - 0.35],
      ].map(([bx, bz], i) => (
        <group key={i} position={[bx, height / 2, bz]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.08, 6]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.12, 6]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Standardized Industrial Electric Drive Motor (TEFC)
 */
export function MotorBody({
  radius = 0.85,
  length = 2.4,
  color = '#2563eb',
  finCount = 10,
  hasTerminalBox = true,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Main Motor Cylindrical Barrel */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, length, 24]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Longitudinal Cooling Fins */}
      {finCount > 0 &&
        Array.from({ length: finCount }).map((_, fIdx) => {
          const angle = (fIdx / finCount) * Math.PI * 2;
          const fx = Math.cos(angle) * (radius + 0.06);
          const fy = Math.sin(angle) * (radius + 0.06);
          return (
            <mesh
              key={fIdx}
              position={[fx, fy, 0]}
              rotation={[Math.PI / 2, 0, angle]}
              castShadow
            >
              <boxGeometry args={[0.04, length * 0.88, 0.16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
            </mesh>
          );
        })}

      {/* Drive-End Bearing End-Bell */}
      <mesh position={[0, 0, length / 2 + 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.95, radius, 0.18, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Non-Drive End Fan Shroud Cowl */}
      <mesh position={[0, 0, -length / 2 - 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.98, radius * 0.95, 0.42, 24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Terminal Connection Box */}
      {hasTerminalBox && (
        <group position={[0, radius + 0.22, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.55, 0.42, 0.65]} />
            <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Conduit Port */}
          <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.12, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>
      )}

      {/* Drive Shaft Output */}
      <mesh position={[0, 0, length / 2 + 0.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.24, radius * 0.24, 0.55, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
}

/**
 * Flexible Shaft Coupling
 */
export function ShaftCoupling({ radius = 0.32, length = 0.45, position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Driving Hub */}
      <mesh position={[0, 0, -length / 3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, length / 3, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Flexible Insert Elastomer */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, length / 4, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.2} roughness={0.7} />
      </mesh>
      {/* Driven Hub */}
      <mesh position={[0, 0, length / 3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, length / 3, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Bolted Industrial Pipe Flange
 */
export function PipeFlange({
  pipeRadius = 0.22,
  flangeRadius = 0.42,
  length = 0.8,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#475569',
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Straight Pipe Barrel */}
      <mesh castShadow>
        <cylinderGeometry args={[pipeRadius, pipeRadius, length, 16]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Connection Flange Ring */}
      <mesh position={[0, length / 2 - 0.05, 0]} castShadow>
        <cylinderGeometry args={[flangeRadius, flangeRadius, 0.1, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Bolt Heads around Flange Ring */}
      {Array.from({ length: 6 }).map((_, bIdx) => {
        const bAngle = (bIdx / 6) * Math.PI * 2;
        const bx = Math.cos(bAngle) * (pipeRadius + (flangeRadius - pipeRadius) * 0.55);
        const bz = Math.sin(bAngle) * (pipeRadius + (flangeRadius - pipeRadius) * 0.55);
        return (
          <mesh key={bIdx} position={[bx, length / 2, bz]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.06, 6]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Machine Identification Placard attached to the machine base
 */
export function MachinePlacard({ id, name, position = [0, 0.4, 2.5] }) {
  const texture = useMemo(() => createPlacardTexture(id, name), [id, name]);

  return (
    <group position={position}>
      {/* Mounting Standoff Bracket */}
      <mesh position={[0, 0, -0.04]} castShadow>
        <boxGeometry args={[1.5, 0.55, 0.06]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Stenciled Nameplate */}
      <mesh castShadow>
        <planeGeometry args={[1.4, 0.48]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}

/**
 * Multi-Segment Industrial Signal Tower / Status Beacon
 */
export function StatusBeacon({ status = 'Operational', position = [1.2, 2.2, 1.2] }) {
  // Color mapping based on operational status: Green (Healthy), Yellow (Warning/Wear), Red (Critical)
  const isHealthy = status === 'Healthy' || status === 'Operational';
  const isCritical = status === 'Critical';
  const isWarning = status === 'Warning' || status === 'Moderate Wear' || status === 'Slight Wear';

  const greenEmissive = isHealthy ? 1.8 : 0.1;
  const amberEmissive = isWarning ? 2.5 : 0.1;
  const redEmissive = isCritical ? 3.0 : 0.1;

  return (
    <group position={position}>
      {/* Pole Stanchion */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {/* Red Light Section */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.14, 12]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={redEmissive}
          roughness={0.2}
        />
      </mesh>

      {/* Amber Light Section */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.14, 12]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={amberEmissive}
          roughness={0.2}
        />
      </mesh>

      {/* Green Light Section */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.14, 12]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={greenEmissive}
          roughness={0.2}
        />
      </mesh>

      {/* Cap */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.05, 12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Subtle Local Accent Glow */}
      <pointLight
        position={[0, 0.2, 0]}
        color={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'}
        intensity={1.2}
        distance={4.0}
        decay={2}
      />
    </group>
  );
}

/**
 * Glowing Selection Halo & Corner Brackets displayed on the floor when machine is clicked
 */
export function SelectionHalo({ width = 5.2, depth = 7.0, isSelected = false }) {
  if (!isSelected) return null;

  return (
    <group position={[0, 0.08, 0]}>
      {/* Glowing Outer Boundary Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4 Glowing Cyber Corner Brackets */}
      {[
        [-width / 2, -depth / 2],
        [width / 2, -depth / 2],
        [-width / 2, depth / 2],
        [width / 2, depth / 2],
      ].map(([cx, cz], i) => (
        <group key={i} position={[cx, 0.01, cz]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.48, 16]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}

      {/* Pulsing Selection Spotlight */}
      <pointLight position={[0, 2.5, 0]} color="#38bdf8" intensity={4.5} distance={7.5} decay={2} />
    </group>
  );
}

