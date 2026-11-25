import React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Wrench,
  ArrowRight,
  Clock,
  Thermometer,
  Activity,
  Zap,
  Gauge,
  RotateCw,
  Droplets,
  Flame,
  Volume2,
  Radio
} from 'lucide-react';
import { MACHINE_BAYS } from './constants';

function formatVal(val, decimals = 1, unit = '') {
  if (val === undefined || val === null || isNaN(val)) {
    return { display: 'N/A', isAvailable: false, unit };
  }
  const n = Number(val);
  return {
    display: n.toFixed(decimals),
    isAvailable: true,
    unit,
    raw: n,
  };
}

export default function MachineDetailCard({
  selectedMachineId,
  onDeselect,
  currentData,
}) {
  if (!selectedMachineId) return null;

  const bay = MACHINE_BAYS.find((b) => b.id === selectedMachineId);
  if (!bay) return null;

  const machinesTelemetry = currentData?.machines || [];
  const telemetry = machinesTelemetry.find((m) => m.Machine_ID === selectedMachineId);

  // Fallback to top-level focused machine fields if selected machine matches top-level
  const isTopLevelFocused = currentData?.machine_id === selectedMachineId;

  const status = telemetry?.Machine_Status || (isTopLevelFocused ? currentData?.machine_status : 'Operational');
  const healthRaw = telemetry?.Machine_Health ?? (isTopLevelFocused ? currentData?.machine_health : 100);
  const health = typeof healthRaw === 'number' ? healthRaw : parseFloat(healthRaw) || 100;
  const rul = telemetry?.Predicted_RUL ?? (isTopLevelFocused ? currentData?.predicted_rul_days : '--');
  const priority = telemetry?.Inspection_Priority || (isTopLevelFocused ? currentData?.alert_status : 'Low');
  const action = telemetry?.Recommended_Action || 'Continue Normal Operation';
  const timestamp = telemetry?.Timestamp || currentData?.timestamp || new Date().toLocaleTimeString();
  const abnormalIndicators = telemetry?.Abnormal_Indicators || (isTopLevelFocused ? currentData?.abnormal_indicators : []) || [];

  // Extract all 9 Sensor Values (handling case-sensitivity from both backend formats)
  const temp = formatVal(telemetry?.Temperature ?? (isTopLevelFocused ? currentData?.temperature : undefined), 1, '°C');
  const vib = formatVal(telemetry?.Vibration ?? (isTopLevelFocused ? currentData?.vibration : undefined), 2, 'mm/s');
  const curr = formatVal(telemetry?.Motor_Current ?? (isTopLevelFocused ? currentData?.motor_current : undefined), 1, 'A');
  const press = formatVal(telemetry?.Pressure ?? (isTopLevelFocused ? currentData?.pressure : undefined), 1, 'bar');
  const rpm = formatVal(telemetry?.RPM ?? (isTopLevelFocused ? currentData?.rpm : undefined), 0, 'RPM');
  const flow = formatVal(telemetry?.Flow_Rate ?? (isTopLevelFocused ? currentData?.flow_rate : undefined), 1, 'L/min');
  const oilTemp = formatVal(telemetry?.Oil_Temperature ?? (isTopLevelFocused ? currentData?.oil_temperature : undefined), 1, '°C');
  const power = formatVal(telemetry?.Power_Consumption ?? (isTopLevelFocused ? currentData?.power_consumption : undefined), 1, 'kW');
  const noise = formatVal(telemetry?.Acoustic_Noise ?? (isTopLevelFocused ? currentData?.acoustic_noise : undefined), 1, 'dB');

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Critical':
        return {
          bg: 'bg-red-950/90 text-red-300 border-red-700/60',
          dot: 'bg-red-400 animate-ping',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-red-400" />,
        };
      case 'Warning':
      case 'Moderate Wear':
      case 'Slight Wear':
        return {
          bg: 'bg-amber-950/90 text-amber-300 border-amber-700/60',
          dot: 'bg-amber-400',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      default:
        return {
          bg: 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60',
          dot: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
    }
  };

  const badge = getStatusBadge(status);

  // Health Bar Color
  const getHealthBarColor = (h) => {
    if (h >= 80) return 'bg-emerald-500';
    if (h >= 60) return 'bg-blue-500';
    if (h >= 40) return 'bg-amber-500';
    if (h >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const sensors = [
    { label: 'Temperature', val: temp, icon: <Thermometer className="w-3.5 h-3.5 text-amber-400" /> },
    { label: 'Vibration RMS', val: vib, icon: <Activity className="w-3.5 h-3.5 text-blue-400" /> },
    { label: 'Motor Current', val: curr, icon: <Zap className="w-3.5 h-3.5 text-yellow-400" /> },
    { label: 'Pressure', val: press, icon: <Gauge className="w-3.5 h-3.5 text-cyan-400" /> },
    { label: 'Speed', val: rpm, icon: <RotateCw className="w-3.5 h-3.5 text-indigo-400" /> },
    { label: 'Flow Rate', val: flow, icon: <Droplets className="w-3.5 h-3.5 text-sky-400" /> },
    { label: 'Oil Temp', val: oilTemp, icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
    { label: 'Power', val: power, icon: <Radio className="w-3.5 h-3.5 text-emerald-400" /> },
    { label: 'Acoustic Noise', val: noise, icon: <Volume2 className="w-3.5 h-3.5 text-purple-400" /> },
  ];

  return (
    <div className="pointer-events-auto absolute top-20 right-5 z-20 w-84 sm:w-[410px] max-h-[calc(100vh-120px)] overflow-y-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-5 text-white font-sans transition-all animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header: Machine ID + Close Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <span className="px-2.5 py-1 rounded-md bg-blue-950 border border-blue-700/60 text-blue-400 text-xs font-mono font-black">
            {bay.id}
          </span>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            {bay.label}
          </span>
        </div>
        <button
          onClick={onDeselect}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Deselect Machine"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Status */}
      <div className="mt-3">
        <h2 className="text-base font-bold text-slate-100 tracking-tight leading-snug">
          {bay.name}
        </h2>
        <div className="flex items-center space-x-2 mt-2">
          <div className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            <span>{status}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Priority: <strong className="text-slate-200">{priority}</strong>
          </span>
        </div>
      </div>

      {/* Equipment Health & Predicted RUL Banner */}
      <div className="mt-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[11px] font-bold text-slate-300">EQUIPMENT HEALTH</span>
          <span className="font-mono font-bold text-white">{health.toFixed(1)}%</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getHealthBarColor(health)}`}
            style={{ width: `${Math.min(100, Math.max(0, health))}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 uppercase font-bold">Predicted RUL</span>
          <span className="text-base font-bold text-cyan-400 font-mono">
            {rul} <span className="text-xs text-slate-400 font-sans">Days</span>
          </span>
        </div>
      </div>

      {/* Abnormal Indicators (if present) */}
      {abnormalIndicators.length > 0 && (
        <div className="mt-3 p-2.5 bg-amber-950/40 border border-amber-800/50 rounded-xl">
          <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Active Abnormal Deviations</span>
          </div>
          <div className="space-y-1">
            {abnormalIndicators.map((ind, i) => (
              <div key={i} className="text-[11px] text-amber-200 font-mono">
                • {ind}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time 9-Sensor Telemetry Grid */}
      <div className="mt-4">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Live Sensor Telemetry</span>
          <span className="text-[9px] text-slate-500 font-mono">9 CHANNELS</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {sensors.map((s, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between"
            >
              <div className="flex items-center space-x-1 text-slate-400 mb-1">
                {s.icon}
                <span className="text-[9px] font-semibold truncate">{s.label}</span>
              </div>
              <div className="font-mono font-bold text-slate-100 flex items-baseline justify-between mt-0.5">
                <span className={s.val.isAvailable ? 'text-xs text-white' : 'text-xs text-slate-500 italic'}>
                  {s.val.display}
                </span>
                {s.val.isAvailable && s.val.unit && (
                  <span className="text-[9px] text-slate-400 ml-0.5 font-sans">{s.val.unit}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Servicing Action */}
      <div className="mt-4 p-3 bg-blue-950/30 rounded-xl border border-blue-900/40 text-xs">
        <div className="flex items-center space-x-1.5 text-blue-300 font-bold mb-1">
          <Wrench className="w-3.5 h-3.5" />
          <span>Servicing Recommendation</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          {action}
        </p>
      </div>

      {/* Timestamp & Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{timestamp}</span>
        </div>
        <button
          onClick={onDeselect}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
        >
          <span>Deselect</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
