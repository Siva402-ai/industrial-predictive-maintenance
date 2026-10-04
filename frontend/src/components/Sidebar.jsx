import React from 'react';
import {
  LayoutDashboard,
  LineChart,
  Cpu,
  Wrench,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sliders,
  Wifi,
  WifiOff,
  Radio,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const Sidebar = ({
  activeTab,
  setActiveTab,
  currentData,
  backendStatus,
  onControlAction,
  speed,
  setSpeed,
  autoPlay
}) => {
  const isMqtt = currentData?.data_mode === 'mqtt';
  const mqttStatus = currentData?.mqtt_status || {};
  const selectedMachine = currentData?.machine_id
    ? currentData?.machines?.find((m) => m.Machine_ID === currentData.machine_id) || currentData
    : currentData;

  const health = selectedMachine?.Machine_Health ?? selectedMachine?.machine_health ?? 100;
  const statusStr = selectedMachine?.Machine_Status || selectedMachine?.machine_status || 'Healthy';
  const rul = selectedMachine?.Predicted_RUL ?? selectedMachine?.predicted_rul_days ?? '--';
  const machineName = selectedMachine?.Machine_Name || selectedMachine?.machine_name || 'Unit A1';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-56px)] shadow-xs shrink-0 select-none overflow-y-auto">
      <div className="p-3.5 space-y-4">
        
        {/* Navigation Section */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
            Operations Console
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span>Live Monitoring</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LineChart className="w-4 h-4 text-indigo-600" />
              <span>Fleet Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'maintenance'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Maintenance Queue</span>
            </button>
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'evaluation'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Model Evaluation</span>
            </button>
          </nav>
        </div>

        {/* Selected Machine Quick Status */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Target</span>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded whitespace-nowrap shrink-0">
              {selectedMachine?.Machine_ID || 'M-001'}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-800 truncate" title={machineName}>
            {machineName}
          </div>
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-500 text-[11px]">Condition</span>
            <StatusBadge status={statusStr} />
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
            <span className="text-slate-500 text-[11px]">Health / RUL</span>
            <span className="font-semibold text-slate-800 text-[11px] whitespace-nowrap">
              {health}% · <span className="text-blue-700 font-bold">{rul}d</span>
            </span>
          </div>
        </div>

        {/* Data Source & Ingestion Controls */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Data Source Controls</span>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap ${
                isMqtt ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}
            >
              {isMqtt ? 'MQTT LIVE' : 'SIMULATION'}
            </span>
          </div>

          {/* Conditional Ingestion Body */}
          {isMqtt ? (
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Broker:</span>
                <span className="font-mono font-semibold text-slate-800 truncate max-w-[130px]">{mqttStatus.broker || '127.0.0.1:1883'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`font-semibold inline-flex items-center space-x-1 ${
                    mqttStatus.connected ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${mqttStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span>{mqttStatus.connected ? 'Connected' : 'Waiting Broker'}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Topic:</span>
                <span className="font-mono text-[10px] text-slate-700 truncate max-w-[120px]" title={mqttStatus.topic || 'factory/telemetry/#'}>
                  {mqttStatus.topic || 'factory/telemetry/#'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Packets Ingested:</span>
                <span className="font-mono font-bold text-purple-700">{mqttStatus.messages_received || 0}</span>
              </div>
              {selectedMachine?.Timestamp && (
                <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200 text-slate-500">
                  <span>Latest Update:</span>
                  <span className="font-mono text-slate-700">{selectedMachine.Timestamp}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onControlAction('start')}
                  className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                    autoPlay
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start</span>
                </button>
                <button
                  onClick={() => onControlAction('pause')}
                  className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                    !autoPlay
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onControlAction('next')}
                  className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold border border-blue-200"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Step</span>
                </button>
                <button
                  onClick={() => onControlAction('reset')}
                  className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Speed Slider */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Cycle Interval</span>
                  <span className="font-semibold text-slate-800 font-mono">{speed}s</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSpeed(val);
                    onControlAction('set_speed', val);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Auto Play Switch */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[11px] font-medium text-slate-600">Auto Stream</span>
                <button
                  onClick={() => onControlAction(autoPlay ? 'pause' : 'start')}
                  className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoPlay ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      autoPlay ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Connection Status */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center space-x-2 text-xs">
          {backendStatus ? (
            <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-800 text-[11px] truncate">
              {backendStatus ? 'FastAPI Gateway Online' : 'Disconnected'}
            </span>
            <span className="text-[10px] text-slate-400">Port 8000 · REST / SSE</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
