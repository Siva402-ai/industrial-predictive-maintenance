import React from 'react';
import {
  Thermometer,
  Activity,
  Zap,
  ShieldAlert,
  Server,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Gauge,
  Flame,
  RotateCw,
  Wind,
  Droplets,
  Volume2,
  ChevronRight,
  TrendingUp,
  AlertOctagon,
  Clock
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LiveChart from '../components/LiveChart';
import SensorTable from '../components/SensorTable';

const Dashboard = ({ currentData, historyData, logs, selectedMachineId, onSelectMachine }) => {
  const machines = currentData?.machines || [];
  const selectedMachine = machines.find((m) => m.Machine_ID === selectedMachineId) || currentData || {};

  const health = selectedMachine?.Machine_Health ?? selectedMachine?.machine_health ?? 100;
  const statusStr = selectedMachine?.Machine_Status || selectedMachine?.machine_status || 'Healthy';
  const machineName = selectedMachine?.Machine_Name || selectedMachine?.machine_name || selectedMachineId || 'Turbine Motor Unit A1';
  const predictedRul = selectedMachine?.Predicted_RUL ?? selectedMachine?.predicted_rul_days ?? '--';
  const recommendedAction = selectedMachine?.Recommended_Action || selectedMachine?.recommended_action || 'Continue Normal Operation';
  const inspectionPriority = selectedMachine?.Inspection_Priority || selectedMachine?.inspection_priority || 'Low';
  const nextInspectionWindow = selectedMachine?.Next_Inspection_Window || selectedMachine?.next_inspection_window || 'Routine inspection within 90–120 days';
  const activeEvent = selectedMachine?.Active_Event || selectedMachine?.active_event || 'None';

  // Dynamic Fleet KPIs
  const kpi = currentData?.fleet_kpi || {
    total_machines: machines.length || 8,
    healthy_count: machines.filter((m) => m.Machine_Status === 'Healthy').length,
    monitor_count: machines.filter((m) => ['Slight Wear', 'Moderate Wear'].includes(m.Machine_Status)).length,
    warning_count: machines.filter((m) => m.Machine_Status === 'Warning').length,
    critical_count: machines.filter((m) => m.Machine_Status === 'Critical').length,
    high_priority_count: machines.filter((m) => m.Inspection_Priority === 'High').length,
    urgent_priority_count: machines.filter((m) => m.Inspection_Priority === 'Urgent').length,
    critical_priority_count: machines.filter((m) => m.Inspection_Priority === 'Critical').length,
    avg_health: currentData?.fleet_avg_health || 100,
    avg_predicted_rul: Math.round(machines.reduce((acc, m) => acc + (m.Predicted_RUL || 0), 0) / (machines.length || 1)),
    critical_alerts_count: machines.filter((m) => ['Urgent', 'Critical'].includes(m.Inspection_Priority)).length,
  };

  const needsAttentionCount = kpi.monitor_count + kpi.warning_count;

  // Real telemetry baseline deviation indicators
  const abnormalIndicators = selectedMachine?.Abnormal_Indicators || selectedMachine?.abnormal_indicators || [];

  // Sorted Priority Machines (Highest attention first)
  const priorityOrder = { Critical: 0, Urgent: 1, High: 2, Moderate: 3, Low: 4 };
  const priorityMachines = [...machines].sort((a, b) => {
    const pA = priorityOrder[a.Inspection_Priority] ?? 5;
    const pB = priorityOrder[b.Inspection_Priority] ?? 5;
    if (pA !== pB) return pA - pB;
    return (a.Machine_Health || 0) - (b.Machine_Health || 0);
  }).slice(0, 4);

  // 8 Telemetry Feature Values
  const tempVal = parseFloat(selectedMachine?.Temperature ?? selectedMachine?.temperature ?? 62.0);
  const oilTempVal = parseFloat(selectedMachine?.Oil_Temperature ?? selectedMachine?.oil_temperature ?? 50.0);
  const vibVal = parseFloat(selectedMachine?.Vibration ?? selectedMachine?.vibration ?? 0.20);
  const rpmVal = parseFloat(selectedMachine?.RPM ?? selectedMachine?.rpm ?? 1750.0);
  const pressVal = parseFloat(selectedMachine?.Pressure ?? selectedMachine?.pressure ?? 60.0);
  const flowVal = parseFloat(selectedMachine?.Flow_Rate ?? selectedMachine?.flow_rate ?? 50.0);
  const currVal = parseFloat(selectedMachine?.Motor_Current ?? selectedMachine?.motor_current ?? 8.0);
  const pwrVal = parseFloat(selectedMachine?.Power_Consumption ?? selectedMachine?.power_consumption ?? 25.0);
  const noiseVal = parseFloat(selectedMachine?.Acoustic_Noise ?? selectedMachine?.acoustic_noise ?? 45.0);

  const getHealthBarColor = (val) => {
    if (val >= 80) return 'bg-emerald-500';
    if (val >= 60) return 'bg-blue-500';
    if (val >= 40) return 'bg-amber-500';
    if (val >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 pb-8">
      
      {/* ========================================================================= */}
      {/* 1. FLEET OVERVIEW HEADER & KPI CARDS                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Industrial Fleet Overview</h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded border border-blue-200">
                {kpi.total_machines} Units Monitored
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time condition monitoring across the active machine fleet.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Fleet Health:</span>
            <span className="text-sm font-bold text-slate-900 font-mono">{kpi.avg_health}%</span>
          </div>
        </div>

        {/* 7 Enterprise KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Fleet</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-1">{kpi.total_machines}</div>
            <span className="text-[10px] text-slate-400">Active Turbines</span>
          </div>

          <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Healthy</span>
            <div className="text-xl font-bold text-emerald-700 font-mono mt-1">{kpi.healthy_count}</div>
            <span className="text-[10px] text-emerald-600 font-medium">Optimal Status</span>
          </div>

          <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Needs Attention</span>
            <div className="text-xl font-bold text-amber-700 font-mono mt-1">{needsAttentionCount}</div>
            <span className="text-[10px] text-amber-600 font-medium">Early/Mod Wear</span>
          </div>

          <div className="bg-red-50/50 rounded-lg p-3 border border-red-200">
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Critical</span>
            <div className="text-xl font-bold text-red-700 font-mono mt-1">{kpi.critical_count}</div>
            <span className="text-[10px] text-red-600 font-medium">Urgent Servicing</span>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fleet Avg Health</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-1">{kpi.avg_health}%</div>
            <span className="text-[10px] text-slate-400">Calculated Index</span>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avg Fleet RUL</span>
            <div className="text-xl font-bold text-blue-700 font-mono mt-1">{kpi.avg_predicted_rul}d</div>
            <span className="text-[10px] text-slate-400">Days to Overhaul</span>
          </div>

          <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-200 col-span-2 sm:col-span-4 lg:col-span-1">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Active Alerts</span>
            <div className="text-xl font-bold text-purple-700 font-mono mt-1">{kpi.critical_alerts_count}</div>
            <span className="text-[10px] text-purple-600 font-medium">High/Urgent Priority</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRIORITY MACHINES (High Risk Attention Queue)                          */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-red-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Priority Machines (Action Queue)</h2>
          </div>
          <span className="text-[11px] text-slate-500">Highest operational risk ranked first</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {priorityMachines.map((m) => {
            const isSelected = m.Machine_ID === selectedMachineId;
            return (
              <div
                key={m.Machine_ID}
                onClick={() => onSelectMachine && onSelectMachine(m.Machine_ID)}
                className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-150 ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900 whitespace-nowrap shrink-0">{m.Machine_ID}</span>
                  <StatusBadge status={m.Machine_Status} />
                </div>
                <div className="text-xs font-bold text-slate-800 truncate mb-2">{m.Machine_Name || m.Machine_ID}</div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Health Index</span>
                    <span className="font-bold font-mono text-slate-800 whitespace-nowrap">{m.Machine_Health}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${getHealthBarColor(m.Machine_Health)}`}
                      style={{ width: `${Math.max(2, m.Machine_Health)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-100 mt-2">
                    <span className="whitespace-nowrap">RUL: <strong className="font-mono text-slate-800">{m.Predicted_RUL}d</strong></span>
                    <span className="font-semibold text-slate-700 whitespace-nowrap">{m.Inspection_Priority} Priority</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FULL 8-MACHINE FLEET OVERVIEW GRID                                     */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Fleet Equipment Matrix</h2>
          </div>
          <span className="text-[11px] text-slate-500">Click any machine to inspect live telemetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5">
          {machines.map((m) => {
            const isSelected = m.Machine_ID === selectedMachineId;
            return (
              <button
                key={m.Machine_ID}
                onClick={() => onSelectMachine && onSelectMachine(m.Machine_ID)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all duration-150 flex flex-col justify-between min-h-[96px] min-w-0 ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="min-w-0 w-full">
                  <div className="flex items-center justify-between mb-1 gap-1 min-w-0">
                    <span className="text-xs font-bold font-mono text-slate-900 whitespace-nowrap shrink-0">{m.Machine_ID}</span>
                    <span className="text-[10px] font-bold text-slate-700 font-mono whitespace-nowrap shrink-0">{m.Machine_Health}%</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600 truncate mb-1.5 min-w-0 leading-tight" title={m.Machine_Name}>
                    {m.Machine_Name?.split(' ')[0] || m.Machine_ID}
                  </div>
                </div>

                <div className="w-full space-y-1.5 min-w-0">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${getHealthBarColor(m.Machine_Health)}`}
                      style={{ width: `${Math.max(2, m.Machine_Health)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] gap-1 min-w-0">
                    <span className="font-mono text-blue-700 font-bold whitespace-nowrap shrink-0">{m.Predicted_RUL}d</span>
                    <span className="text-[9px] font-semibold text-slate-500 truncate text-right min-w-0">{m.Machine_Status}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SELECTED MACHINE DETAILED CONSOLE & ACTION DIRECTIVE                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        
        {/* Machine Banner & State */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="px-3 py-1.5 h-10 min-w-[3.75rem] rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-mono font-bold text-sm tracking-tight whitespace-nowrap shrink-0">
              {selectedMachineId}
            </div>
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <h2 className="text-sm font-bold text-slate-900 whitespace-nowrap">{machineName}</h2>
                <StatusBadge status={statusStr} />
                {activeEvent !== 'None' && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300 animate-pulse whitespace-nowrap">
                    EVENT: {activeEvent}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Operating Day {selectedMachine?.Day ?? '--'} · Timestamp: {selectedMachine?.Timestamp ?? '--'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Health Index</span>
              <span className="text-base font-bold font-mono text-slate-900">{health}%</span>
            </div>
            <div className="text-right border-l border-slate-200 pl-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Predicted RUL</span>
              <span className="text-base font-bold font-mono text-blue-700">{predictedRul} Days</span>
            </div>
          </div>
        </div>

        {/* Recommended Action & Abnormal Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Recommended Action Card */}
          <div className="lg:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Prescriptive Action Directive</span>
                </span>
                <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                  Priority: {inspectionPriority}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {recommendedAction}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span className="text-slate-500 text-[11px] flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Servicing Window:</span>
              </span>
              <span className="font-semibold text-slate-800">{nextInspectionWindow}</span>
            </div>
          </div>

          {/* Anomaly Deviations / Status summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Detected Condition Anomalies
            </span>
            {abnormalIndicators.length > 0 ? (
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 text-xs">
                {abnormalIndicators.map((ind, i) => (
                  <div key={i} className="flex items-start space-x-1.5 text-amber-900 bg-amber-50/80 p-1.5 rounded border border-amber-200/60 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All 8 sensor parameters operating within expected baseline thresholds.</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. LIVE TELEMETRY BY 5 ENGINEERING CATEGORIES                             */}
        {/* ========================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3 pt-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              SCADA Telemetry Channels (Engineering Classification)
            </span>
            <span className="text-[11px] text-slate-400">Calibrated real-time metrics</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            
            {/* THERMAL CATEGORY */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-1.5 text-slate-500 border-b border-slate-200/70 pb-1.5">
                <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Thermal</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[11px] text-slate-500">Operating Temp:</span>
                  <span className="font-bold font-mono text-slate-900">{tempVal.toFixed(1)} °C</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[11px] text-slate-500">Oil Temp:</span>
                  <span className="font-bold font-mono text-slate-900">{oilTempVal.toFixed(1)} °C</span>
                </div>
              </div>
            </div>

            {/* MECHANICAL CATEGORY */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-1.5 text-slate-500 border-b border-slate-200/70 pb-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Mechanical</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[11px] text-slate-500">Vibration RMS:</span>
                  <span className="font-bold font-mono text-slate-900">{vibVal.toFixed(2)} mm/s</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[11px] text-slate-500">Shaft Speed:</span>
                  <span className="font-bold font-mono text-slate-900">{rpmVal.toFixed(0)} RPM</span>
                </div>
              </div>
            </div>

            {/* PROCESS CATEGORY */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-1.5 text-slate-500 border-b border-slate-200/70 pb-1.5">
                <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Process</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[11px] text-slate-500">Pressure:</span>
                  <span className="font-bold font-mono text-slate-900">{pressVal.toFixed(1)} PSI</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[11px] text-slate-500">Flow Rate:</span>
                  <span className="font-bold font-mono text-slate-900">{flowVal.toFixed(1)} L/m</span>
                </div>
              </div>
            </div>

            {/* ELECTRICAL CATEGORY */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-1.5 text-slate-500 border-b border-slate-200/70 pb-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Electrical</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[11px] text-slate-500">Motor Current:</span>
                  <span className="font-bold font-mono text-slate-900">{currVal.toFixed(1)} A</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[11px] text-slate-500">Power Demand:</span>
                  <span className="font-bold font-mono text-slate-900">{pwrVal.toFixed(1)} kW</span>
                </div>
              </div>
            </div>

            {/* ACOUSTIC CATEGORY */}
            <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200 space-y-2 col-span-2 sm:col-span-1">
              <div className="flex items-center space-x-1.5 text-slate-500 border-b border-slate-200/70 pb-1.5">
                <Volume2 className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Acoustic</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[11px] text-slate-500">Sound Level:</span>
                  <span className="font-bold font-mono text-slate-900">{noiseVal.toFixed(1)} dB</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[11px] text-slate-500">State:</span>
                  <span className="font-semibold text-slate-700">{noiseVal > 70 ? 'Elevated' : 'Nominal'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 6. PREDICTIVE VIEW (Interactive Streaming Graph)                          */}
      {/* ========================================================================= */}
      <LiveChart historyData={historyData} />

      {/* ========================================================================= */}
      {/* 7. RECENT OPERATIONAL LOGS TABLE                                          */}
      {/* ========================================================================= */}
      <SensorTable logs={logs} />

    </div>
  );
};

export default Dashboard;
