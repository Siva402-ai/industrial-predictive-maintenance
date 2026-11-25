import React from 'react';
import MachineDetailCard from './MachineDetailCard';
import {
  RotateCcw,
  Compass,
  Eye,
  Grid,
  Sun,
  Moon,
  Layers,
  Box,
  Shield,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

export default function TwinOverlay({
  onResetCamera,
  onSetCameraView,
  showSafetyMarkings,
  setShowSafetyMarkings,
  showGrid,
  setShowGrid,
  showCeilingStructure,
  setShowCeilingStructure,
  isNightShift,
  setIsNightShift,
  selectedMachineId,
  onDeselectMachine,
  currentData,
  backendStatus = true,
}) {
  const machines = currentData?.machines || [];
  const totalMachines = currentData?.fleet_size || machines.length || 8;
  const healthyCount =
    currentData?.fleet_kpi?.healthy_count ??
    machines.filter((m) => m.Machine_Status === 'Healthy').length;
  const warningCount = currentData?.fleet_kpi
    ? (currentData.fleet_kpi.monitor_count || 0) + (currentData.fleet_kpi.warning_count || 0)
    : machines.filter((m) => ['Warning', 'Slight Wear', 'Moderate Wear'].includes(m.Machine_Status)).length;
  const criticalCount =
    currentData?.fleet_kpi?.critical_count ??
    machines.filter((m) => m.Machine_Status === 'Critical').length;

  const timestamp = currentData?.timestamp || '';

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-5 select-none font-sans">
      {/* Selected Machine Inspection Panel */}
      <MachineDetailCard
        selectedMachineId={selectedMachineId}
        onDeselect={onDeselectMachine}
        currentData={currentData}
      />

      {/* ========================================================================= */}
      {/* TOP BAR: BRANDING + FLEET SUMMARY + CAMERA & VIEW CONTROLS                */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left: Platform Title, Backend Connection Status & Fleet Summary */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl p-3.5 shadow-2xl text-white space-y-2.5 max-w-md">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h1 className="text-xs font-black tracking-wider text-slate-100 uppercase">
                INDUSTRIAL NEXUS
              </h1>
              <span className="bg-blue-950/80 text-blue-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-blue-800/60 font-mono">
                3D TWIN v1.0
              </span>
            </div>

            {/* API Connection Indicator */}
            <div>
              {!backendStatus ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-700/60 animate-pulse">
                  <WifiOff className="w-3 h-3" />
                  <span>API DISCONNECTED</span>
                </span>
              ) : !currentData ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>SYNCING SCADA...</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-mono">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>LIVE (1s)</span>
                </span>
              )}
            </div>
          </div>

          {/* STEP 5 — Compact Fleet Summary Status Bar */}
          <div className="pt-2 border-t border-slate-800/90 flex items-center space-x-2 font-mono text-[11px]">
            <div className="bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 flex items-center space-x-1.5">
              <span className="text-slate-400 text-[9px] uppercase font-sans font-bold">Total</span>
              <span className="font-bold text-white">{totalMachines}</span>
            </div>

            <div className="bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800/50 flex items-center space-x-1.5 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 text-[9px] uppercase font-sans font-bold">Healthy</span>
              <span className="font-bold">{healthyCount}</span>
            </div>

            <div className="bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-800/50 flex items-center space-x-1.5 text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 text-[9px] uppercase font-sans font-bold">Warning</span>
              <span className="font-bold">{warningCount}</span>
            </div>

            <div className="bg-red-950/60 px-2 py-1 rounded-lg border border-red-800/50 flex items-center space-x-1.5 text-red-300">
              <span className={`w-1.5 h-1.5 rounded-full bg-red-400 ${criticalCount > 0 ? 'animate-ping' : ''}`} />
              <span className="text-red-400 text-[9px] uppercase font-sans font-bold">Critical</span>
              <span className="font-bold">{criticalCount}</span>
            </div>
          </div>

          {timestamp && (
            <div className="text-[10px] text-slate-500 font-mono">
              LAST TICK: {timestamp}
            </div>
          )}
        </div>

        {/* Right: Camera Presets & Display Controls */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-xl p-1.5 shadow-2xl">
          {/* Camera View Presets */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/50">
            <button
              onClick={() => onSetCameraView('isometric')}
              className="px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center space-x-1"
              title="Isometric 45-degree angle"
            >
              <Box className="w-3.5 h-3.5 text-blue-400" />
              <span>Isometric</span>
            </button>
            <button
              onClick={() => onSetCameraView('top')}
              className="px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center space-x-1"
              title="Top-down floor plan view"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Top-Down</span>
            </button>
            <button
              onClick={() => onSetCameraView('aisle')}
              className="px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center space-x-1"
              title="Center walkway eye-level perspective"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Aisle View</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-700/80 mx-0.5" />

          {/* Reset Camera Button */}
          <button
            onClick={onResetCamera}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="Reset camera position and target"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Camera</span>
          </button>

          <div className="h-5 w-px bg-slate-700/80 mx-0.5" />

          {/* Scene Layer Toggles */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showGrid
                  ? 'bg-blue-900/40 text-blue-300 border-blue-700/50'
                  : 'text-slate-400 border-transparent hover:bg-slate-800'
              }`}
              title="Toggle Grid Overlay"
            >
              <Grid className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSafetyMarkings(!showSafetyMarkings)}
              className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showSafetyMarkings
                  ? 'bg-amber-900/40 text-amber-300 border-amber-700/50'
                  : 'text-slate-400 border-transparent hover:bg-slate-800'
              }`}
              title="Toggle Yellow/Black Hazard Stripes"
            >
              <Shield className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowCeilingStructure(!showCeilingStructure)}
              className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showCeilingStructure
                  ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50'
                  : 'text-slate-400 border-transparent hover:bg-slate-800'
              }`}
              title="Toggle Roof Girders & Gantry Crane"
            >
              <Layers className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsNightShift(!isNightShift)}
              className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isNightShift
                  ? 'bg-purple-900/40 text-purple-300 border-purple-700/50'
                  : 'text-slate-400 border-transparent hover:bg-slate-800'
              }`}
              title="Toggle Night Shift Industrial Lighting"
            >
              {isNightShift ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM BAR: ORBIT CONTROLS HELPER + FACILITY TELEMETRY HUD                 */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        {/* Left: Interactive Navigation Guide */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-300 shadow-xl max-w-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Navigation Controls
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Rotate: Left Click</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Pan: Right Click</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Zoom: Scroll</span>
            </div>
          </div>
        </div>

        {/* Right: Facility Environment Metric Cards */}
        <div className="pointer-events-auto flex items-center space-x-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 text-xs text-slate-200 shadow-xl font-mono">
          <div className="px-2 border-r border-slate-700/80">
            <div className="text-[9px] text-slate-400 uppercase font-sans font-bold">Fleet Health</div>
            <div className="text-xs font-bold text-emerald-400">
              {currentData?.fleet_avg_health ? `${currentData.fleet_avg_health.toFixed(1)}%` : '100.0%'}
            </div>
          </div>
          <div className="px-2 border-r border-slate-700/80">
            <div className="text-[9px] text-slate-400 uppercase font-sans font-bold">Avg RUL</div>
            <div className="text-xs font-bold text-cyan-400">
              {currentData?.fleet_kpi?.avg_predicted_rul !== undefined ? `${currentData.fleet_kpi.avg_predicted_rul}d` : '--'}
            </div>
          </div>
          <div className="px-2">
            <div className="text-[9px] text-slate-400 uppercase font-sans font-bold">Lighting Mode</div>
            <div className="text-xs font-bold text-amber-300">{isNightShift ? 'Night Shift' : 'Day Shift'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
