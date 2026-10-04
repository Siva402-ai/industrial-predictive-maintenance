import React from 'react';
import StatusBadge from './StatusBadge';
import { ListFilter } from 'lucide-react';

const SensorTable = ({ logs }) => {
  const logList = logs || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent SCADA Telemetry Stream
            </h3>
            <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {logList.length} Entries Buffered
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Synchronized multi-channel sensor logs with real-time inference tags
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-600">
          <thead className="text-[10px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 font-bold tracking-wider">
            <tr>
              <th scope="col" className="px-3 py-2.5">Timestamp</th>
              <th scope="col" className="px-3 py-2.5">Temp (°C)</th>
              <th scope="col" className="px-3 py-2.5">Oil T (°C)</th>
              <th scope="col" className="px-3 py-2.5">Vib (mm/s)</th>
              <th scope="col" className="px-3 py-2.5">RPM</th>
              <th scope="col" className="px-3 py-2.5">Press (PSI)</th>
              <th scope="col" className="px-3 py-2.5">Flow (L/m)</th>
              <th scope="col" className="px-3 py-2.5">Curr (A)</th>
              <th scope="col" className="px-3 py-2.5">Pwr (kW)</th>
              <th scope="col" className="px-3 py-2.5">Pred RUL</th>
              <th scope="col" className="px-3 py-2.5">Health</th>
              <th scope="col" className="px-3 py-2.5">Condition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {logList.length === 0 ? (
              <tr>
                <td colSpan="12" className="px-3 py-6 text-center text-slate-400 font-sans">
                  No telemetry log entries available yet
                </td>
              </tr>
            ) : (
              logList.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-3 py-2 text-slate-900 font-sans whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">{log.temperature}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">{log.oil_temperature ?? '--'}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">{log.vibration}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">{log.rpm ?? '--'}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">{log.pressure ?? '--'}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">{log.flow_rate ?? '--'}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">{log.motor_current}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">{log.power_consumption ?? '--'}</td>
                  <td className="px-3 py-2 font-bold text-blue-700 font-sans">{log.predicted_rul}d</td>
                  <td className="px-3 py-2 font-semibold text-slate-900">{log.machine_health}%</td>
                  <td className="px-3 py-2 font-sans">
                    <StatusBadge status={log.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SensorTable;
