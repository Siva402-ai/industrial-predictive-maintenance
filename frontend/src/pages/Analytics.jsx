import React from 'react';
import AnalyticsCharts from '../components/AnalyticsCharts';

const Analytics = ({ historyData, selectedMachineId, onSelectMachine }) => {
  const machineList = [
    { id: 'M-001', name: 'Turbine Motor Unit A1' },
    { id: 'M-002', name: 'Centrifugal Feed Pump B2' },
    { id: 'M-003', name: 'Reciprocating Compressor C3' },
    { id: 'M-004', name: 'Primary Induction Motor D4' },
    { id: 'M-005', name: 'Hydraulic Gear Pump E5' },
    { id: 'M-006', name: 'Exhaust Blower Fan F6' },
    { id: 'M-007', name: 'Cooling Tower Motor G7' },
    { id: 'M-008', name: 'Heavy Duty Gearbox H8' },
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Page Header & Machine Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Fleet Analytics</h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded border border-indigo-200">
              Multi-Channel Diagnostics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical telemetry, degradation trends and predictive signals across the industrial fleet.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <label className="text-xs font-semibold text-slate-600">Target Asset:</label>
          <select
            value={selectedMachineId || 'M-001'}
            onChange={(e) => onSelectMachine && onSelectMachine(e.target.value)}
            className="px-2.5 py-1 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          >
            {machineList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} — {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Charts Component */}
      <AnalyticsCharts
        historyData={historyData}
        selectedMachineId={selectedMachineId}
        onSelectMachine={onSelectMachine}
      />
    </div>
  );
};

export default Analytics;
