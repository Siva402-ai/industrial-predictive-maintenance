import React, { useMemo } from 'react';
import { createHazardTexture, createConcreteTexture, createBayStripeTexture } from './textures';
import { MACHINE_BAYS } from './constants';

export default function FactoryFloor({ showSafetyMarkings = true, showGrid = true }) {
  const concreteTexture = useMemo(() => {
    const tex = createConcreteTexture(256);
    tex.repeat.set(16, 12);
    return tex;
  }, []);

  const hazardTextureWalkway = useMemo(() => {
    const tex = createHazardTexture(16, 128, 128);
    tex.repeat.set(1, 40);
    return tex;
  }, []);

  const hazardTextureBay = useMemo(() => {
    const tex = createHazardTexture(16, 128, 128);
    tex.repeat.set(1, 14);
    return tex;
  }, []);

  const bayTextures = useMemo(() => {
    return MACHINE_BAYS.map((bay) => createBayStripeTexture(bay.label));
  }, []);

  return (
    <group name="FactoryFloorGroup">
      {/* 1. Main Polished Concrete / Light Industrial Epoxy Slab */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[74, 0.4, 54]} />
        <meshStandardMaterial
          map={concreteTexture}
          roughness={0.65}
          metalness={0.12}
          color="#f1f5f9"
        />
      </mesh>

      {/* 2. Architectural Floor Measurement Grid */}
      {showGrid && (
        <gridHelper
          args={[74, 37, '#94a3b8', '#e2e8f0']}
          position={[0, 0.005, 0]}
        />
      )}

      {/* 3. Central Clean Industrial Logistics Lane / High-Gloss Walkway */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 52]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* 4. Yellow-and-Black Hazard Markings along Central Walkway */}
      {showSafetyMarkings && (
        <>
          {/* West Hazard Border */}
          <mesh position={[-3.65, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.35, 52]} />
            <meshBasicMaterial map={hazardTextureWalkway} />
          </mesh>
          {/* East Hazard Border */}
          <mesh position={[3.65, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.35, 52]} />
            <meshBasicMaterial map={hazardTextureWalkway} />
          </mesh>
        </>
      )}

      {/* 5. 8 Industrial Equipment Bays */}
      {MACHINE_BAYS.map((bay, idx) => {
        const [bx, , bz] = bay.position;
        const padWidth = 12.5;
        const padDepth = 10.5;

        return (
          <group key={bay.id} position={[bx, 0, bz]}>
            {/* Elevated Structural Equipment Plinth (Crisp Graphite Slate for high contrast) */}
            <mesh position={[0, 0.03, 0]} receiveShadow>
              <boxGeometry args={[padWidth, 0.06, padDepth]} />
              <meshStandardMaterial
                color="#334155"
                roughness={0.6}
                metalness={0.25}
              />
            </mesh>

            {/* Inner Machine Bed Plate (Brushed Industrial Steel) */}
            <mesh position={[0, 0.065, 0]} receiveShadow>
              <boxGeometry args={[padWidth - 1.2, 0.01, padDepth - 1.2]} />
              <meshStandardMaterial
                color="#475569"
                roughness={0.45}
                metalness={0.6}
              />
            </mesh>

            {/* Hazard Border Surrounding Bay Perimeter */}
            {showSafetyMarkings && (
              <>
                {/* North & South Hazard Strips */}
                <mesh position={[0, 0.07, -padDepth / 2 + 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[padWidth, 0.35]} />
                  <meshBasicMaterial map={hazardTextureBay} />
                </mesh>
                <mesh position={[0, 0.07, padDepth / 2 - 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[padWidth, 0.35]} />
                  <meshBasicMaterial map={hazardTextureBay} />
                </mesh>
                {/* West & East Hazard Strips */}
                <mesh position={[-padWidth / 2 + 0.2, 0.07, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                  <planeGeometry args={[padDepth, 0.35]} />
                  <meshBasicMaterial map={hazardTextureBay} />
                </mesh>
                <mesh position={[padWidth / 2 - 0.2, 0.07, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                  <planeGeometry args={[padDepth, 0.35]} />
                  <meshBasicMaterial map={hazardTextureBay} />
                </mesh>
              </>
            )}

            {/* Stenciled Equipment Bay ID Plaque */}
            <mesh position={[0, 0.075, padDepth / 2 - 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3.2, 1.4]} />
              <meshBasicMaterial map={bayTextures[idx]} transparent opacity={0.9} />
            </mesh>

            {/* Corner Alignment Indicators (Yellow Painted Brackets) */}
            <group position={[0, 0.072, 0]}>
              {[
                [-padWidth / 2 + 0.6, -padDepth / 2 + 0.6],
                [padWidth / 2 - 0.6, -padDepth / 2 + 0.6],
                [-padWidth / 2 + 0.6, padDepth / 2 - 0.6],
                [padWidth / 2 - 0.6, padDepth / 2 - 0.6],
              ].map(([cx, cz], cIdx) => (
                <mesh key={cIdx} position={[cx, 0, cz]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.7, 0.7]} />
                  <meshBasicMaterial color="#eab308" />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}

      {/* 6. Perimeter Modern Architectural Walls & Base Trim */}
      {/* North Wall */}
      <group position={[0, 4, -27]}>
        <mesh receiveShadow>
          <boxGeometry args={[74, 8, 0.4]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.7} metalness={0.05} />
        </mesh>
        {/* Subtle Horizontal Architectural Reveal Strip */}
        <mesh position={[0, 0, 0.22]}>
          <boxGeometry args={[74, 0.08, 0.05]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* South Boundary: Low architectural viewing threshold (Zero obstruction to camera) */}
      <group position={[0, 0.15, 27]}>
        <mesh receiveShadow>
          <boxGeometry args={[74, 0.3, 0.4]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} metalness={0.2} />
        </mesh>
      </group>

      {/* West Wall */}
      <group position={[-37, 4, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.4, 8, 54]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.7} metalness={0.05} />
        </mesh>
        <mesh position={[0.22, 0, 0]}>
          <boxGeometry args={[0.05, 0.08, 54]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* East Wall */}
      <group position={[37, 4, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.4, 8, 54]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.7} metalness={0.05} />
        </mesh>
        <mesh position={[-0.22, 0, 0]}>
          <boxGeometry args={[0.05, 0.08, 54]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* Perimeter Skirting Base Trim (Clean Architectural Slate) */}
      <mesh position={[0, 0.2, -26.7]} receiveShadow>
        <boxGeometry args={[74, 0.4, 0.15]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.2, 26.7]} receiveShadow>
        <boxGeometry args={[74, 0.4, 0.15]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[-36.7, 0.2, 0]} receiveShadow>
        <boxGeometry args={[0.15, 0.4, 54]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[36.7, 0.2, 0]} receiveShadow>
        <boxGeometry args={[0.15, 0.4, 54]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}
