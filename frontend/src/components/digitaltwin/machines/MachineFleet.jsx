import React, { useCallback } from 'react';
import { Html } from '@react-three/drei';
import { MACHINE_BAYS } from '../constants';
import TurbineMotorUnitA1 from './TurbineMotorUnitA1';
import CentrifugalPumpB2 from './CentrifugalPumpB2';
import ReciprocatingCompressorC3 from './ReciprocatingCompressorC3';
import InductionMotorDriveD4 from './InductionMotorDriveD4';
import HydraulicGearPumpE5 from './HydraulicGearPumpE5';
import ExhaustBlowerFanF6 from './ExhaustBlowerFanF6';
import CoolingTowerMotorG7 from './CoolingTowerMotorG7';
import HeavyDutyGearboxH8 from './HeavyDutyGearboxH8';

const MACHINE_COMPONENTS = {
  'M-001': TurbineMotorUnitA1,
  'M-002': CentrifugalPumpB2,
  'M-003': ReciprocatingCompressorC3,
  'M-004': InductionMotorDriveD4,
  'M-005': HydraulicGearPumpE5,
  'M-006': ExhaustBlowerFanF6,
  'M-007': CoolingTowerMotorG7,
  'M-008': HeavyDutyGearboxH8,
};

export default function MachineFleet({
  selectedMachineId,
  onSelectMachine,
  currentData,
}) {
  const machinesTelemetry = currentData?.machines || [];

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
  }, []);

  return (
    <group name="MachineFleetGroup">
      {MACHINE_BAYS.map((bay) => {
        const Component = MACHINE_COMPONENTS[bay.id];
        if (!Component) return null;

        const isSelected = selectedMachineId === bay.id;

        // Get status and live telemetry from current backend telemetry if available
        const teleRec = machinesTelemetry.find((m) => m.Machine_ID === bay.id);
        const status = teleRec?.Machine_Status || 'Operational';
        const rawTemp = teleRec?.Temperature ?? teleRec?.temperature;
        const tempStr = rawTemp !== undefined && rawTemp !== null ? `${Number(rawTemp).toFixed(1)}°C` : '--';
        const rawHealth = teleRec?.Machine_Health ?? teleRec?.machine_health;
        const healthStr = rawHealth !== undefined && rawHealth !== null ? `${Number(rawHealth).toFixed(0)}%` : '--';

        const isHealthy = status === 'Healthy' || status === 'Operational';
        const isCritical = status === 'Critical';
        const isWarning = !isHealthy && !isCritical;

        const statusDot = isCritical
          ? 'bg-red-500 animate-ping'
          : isWarning
          ? 'bg-amber-400'
          : 'bg-emerald-400';

        const badgeBorder = isSelected
          ? 'border-cyan-400 ring-2 ring-cyan-400/40 bg-slate-900/95 text-cyan-300'
          : isCritical
          ? 'border-red-500/70 bg-slate-900/90 text-red-200'
          : isWarning
          ? 'border-amber-500/70 bg-slate-900/90 text-amber-200'
          : 'border-slate-700/80 bg-slate-900/85 text-slate-200';

        const handleClick = (e) => {
          e.stopPropagation();
          if (onSelectMachine) {
            // Toggle selection if clicked again or select new
            onSelectMachine(isSelected ? null : bay.id);
          }
        };

        return (
          <group key={bay.id} position={bay.position}>
            {/* Scaled machine model (1.25x) for maximum visual prominence and mechanical clarity */}
            <group scale={[1.25, 1.25, 1.25]}>
              <Component
                id={bay.id}
                name={bay.name}
                status={status}
                isSelected={isSelected}
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
              />
            </group>

            {/* Floating 3D Machine Spatial Telemetry Tag positioned cleanly above model */}
            <Html
              position={[0, 4.9, 0]}
              center
              distanceFactor={28}
              className="pointer-events-auto select-none"
            >
              <div
                data-machine-id={bay.id}
                onClick={handleClick}
                className={`cursor-pointer px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold shadow-xl backdrop-blur-md flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${badgeBorder}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                <span className="tracking-wider">{bay.id}</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300 font-sans font-medium">{tempStr}</span>
                <span className="text-slate-500">|</span>
                <span className={isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>
                  {healthStr}
                </span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

