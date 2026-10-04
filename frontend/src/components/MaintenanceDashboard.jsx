import React, { useRef } from 'react';
import {
  Wrench,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  Layers,
  Activity,
  ArrowRight
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import Plot from 'react-plotly.js';
import { calculateAdaptiveYRange } from './LiveChart';

const SingleTrendPlot = ({
  title,
  yLabel,
  trendData,
  actualColor = '#2563EB',
  isFullWidth = false,
  minClamp = 0,
  maxClamp = 100,
  minSpan = 1,
  metricType = 'general',
}) => {
  const actual = trendData?.actual || [];
  const predicted = trendData?.predicted_future || [];
  const rangeRef = useRef(null);

  const xHist = actual.map((_, i) => i + 1);
  const latestDay = xHist.length > 0 ? xHist[xHist.length - 1] : 1;
  const xFuture = actual.length > 0 ? predicted.map((_, i) => latestDay + i) : [];

  const visibleMin = Math.max(1, latestDay - 100);
  const visibleMax = latestDay + 20;

  const adaptiveRange = metricType === 'health'
    ? [0, 105]
    : calculateAdaptiveYRange(actual, minClamp, maxClamp, minSpan, metricType, rangeRef);

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col ${isFullWidth ? 'w-full' : ''}`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
        {actual.length > 0 && (
          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Latest: {actual[actual.length - 1]} {yLabel}
          </span>
        )}
      </div>

      <div className="w-full h-64">
        <Plot
          data={[
            {
              x: xHist,
              y: actual,
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Historical Reading',
              line: { color: actualColor, width: 2.5, shape: 'spline', smoothing: 0.3 },
              marker: { size: 3, color: actualColor },
              hovertemplate: `Day %{x}: %{y:.2f} ${yLabel}<extra></extra>`,
            },
            {
              x: xFuture,
              y: predicted,
              type: 'scatter',
              mode: 'lines',
              name: '20-Step Trend Extrapolation',
              line: { color: '#D97706', width: 2.5, dash: 'dash' },
              hovertemplate: `Proj %{x}: %{y:.2f} ${yLabel}<extra></extra>`,
            },
          ]}
          layout={{
            autosize: true,
            margin: { l: 44, r: 16, t: 8, b: 32 },
            paper_bgcolor: '#FFFFFF',
            plot_bgcolor: '#F8FAFC',
            font: { family: 'inherit', size: 9, color: '#475569' },
            xaxis: {
              title: { text: 'Operating Day / Step', font: { size: 9, color: '#64748B' } },
              gridcolor: '#E2E8F0',
              zeroline: false,
              range: [visibleMin, visibleMax],
              tickfont: { size: 9, color: '#64748B' },
            },
            yaxis: {
              title: { text: yLabel, font: { size: 9, color: '#64748B' } },
              gridcolor: '#E2E8F0',
              zeroline: false,
              range: adaptiveRange,
              tickfont: { size: 9, color: '#64748B' },
            },
            legend: {
              orientation: 'h',
              x: 0.5,
              y: 1.12,
              xanchor: 'center',
              font: { size: 9, color: '#475569' },
            },
            hovermode: 'x unified',
          }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>
    </div>
  );
};

const MaintenanceDashboard = ({ maintenanceData, historyData, selectedMachineId, onSelectMachine }) => {
  const rawList = maintenanceData?.maintenance_list || [];

  // Enforce Priority ordering: Critical -> Urgent -> High -> Moderate -> Low
  const prioOrder = { Critical: 0, Urgent: 1, High: 2, Moderate: 3, Low: 4 };
  const sortedMaintenanceList = [...rawList].sort(
    (a, b) => (prioOrder[a.inspection_priority] ?? 5) - (prioOrder[b.inspection_priority] ?? 5)
  );

  const selectedOrTop = sortedMaintenanceList.find((m) => m.machine_id === selectedMachineId) || sortedMaintenanceList[0] || {};

  const predictedRul = selectedOrTop?.predicted_rul_days ?? maintenanceData?.predicted_rul_days ?? '--';
  const status = selectedOrTop?.maintenance_status || maintenanceData?.maintenance_status || 'Healthy';
  const action = selectedOrTop?.recommended_action || maintenanceData?.recommended_action || 'Continue Normal Operation';
  const priority = selectedOrTop?.inspection_priority || maintenanceData?.inspection_priority || 'Low';
  const window = selectedOrTop?.next_inspection_window || maintenanceData?.next_inspection_window || 'Routine inspection within 90–120 days';

  // Summary counts
  const criticalCount = sortedMaintenanceList.filter((m) => m.inspection_priority === 'Critical').length;
  const urgentCount = sortedMaintenanceList.filter((m) => m.inspection_priority === 'Urgent').length;
  const moderateCount = sortedMaintenanceList.filter((m) => ['High', 'Moderate'].includes(m.inspection_priority)).length;
  const lowCount = sortedMaintenanceList.filter((m) => m.inspection_priority === 'Low').length;

  const getPriorityBadgeClass = (p) => {
    switch (p) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'Urgent':
        return 'bg-orange-50 text-orange-700 border-orange-200 font-bold';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      case 'Moderate':
        return 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP MAINTENANCE KPI SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-red-50/60 rounded-xl border border-red-200 p-3.5">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Critical Action</span>
          <div className="text-2xl font-bold font-mono text-red-700 mt-1">{criticalCount}</div>
          <span className="text-[11px] text-red-600 font-medium">Immediate intervention</span>
        </div>

        <div className="bg-orange-50/60 rounded-xl border border-orange-200 p-3.5">
          <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">Urgent Priority</span>
          <div className="text-2xl font-bold font-mono text-orange-700 mt-1">{urgentCount}</div>
          <span className="text-[11px] text-orange-600 font-medium">Servicing in 3–5 days</span>
        </div>

        <div className="bg-blue-50/60 rounded-xl border border-blue-200 p-3.5">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Moderate Attention</span>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">{moderateCount}</div>
          <span className="text-[11px] text-blue-600 font-medium">Scheduled inspection</span>
        </div>

        <div className="bg-emerald-50/60 rounded-xl border border-emerald-200 p-3.5">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Low Risk</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">{lowCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Standard baseline</span>
        </div>
      </div>

      {/* 2. MAINTENANCE PRIORITY QUEUE TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-3 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Maintenance Priority Queue ({sortedMaintenanceList.length} Units)
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ranked work order prioritization based on real-time multi-sensor degradation and remaining useful life
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            Total Queue: {sortedMaintenanceList.length} Assets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Asset ID</th>
                <th className="py-2.5 px-3">Machine Name</th>
                <th className="py-2.5 px-3">Health %</th>
                <th className="py-2.5 px-3">Pred RUL</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Recommended Action</th>
                <th className="py-2.5 px-3">Servicing Window</th>
                <th className="py-2.5 px-3">Abnormal Indicators</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {sortedMaintenanceList.map((m, idx) => {
                const isSelected = m.machine_id === selectedMachineId;
                const isUrgentOrCrit = ['Critical', 'Urgent'].includes(m.inspection_priority);
                const indicators = m.abnormal_indicators || [];

                return (
                  <tr
                    key={m.machine_id}
                    onClick={() => onSelectMachine && onSelectMachine(m.machine_id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 font-medium'
                        : isUrgentOrCrit
                        ? 'bg-red-50/30 hover:bg-red-50/60'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{m.machine_id}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 whitespace-nowrap">
                      {m.machine_name || m.machine_id}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{m.machine_health}%</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700">{m.predicted_rul_days}d</td>
                    <td className="py-2.5 px-3 font-sans">
                      <StatusBadge status={m.maintenance_status} />
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${getPriorityBadgeClass(m.inspection_priority)}`}>
                        {m.inspection_priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-800 max-w-[200px] truncate" title={m.recommended_action}>
                      {m.recommended_action}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 whitespace-nowrap">{m.next_inspection_window}</td>
                    <td className="py-2.5 px-3 font-sans max-w-[220px]">
                      {indicators.length > 0 ? (
                        <div className="space-y-0.5">
                          {indicators.slice(0, 2).map((ind, i) => (
                            <span key={i} className="block text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 truncate" title={ind}>
                              {ind}
                            </span>
                          ))}
                          {indicators.length > 2 && (
                            <span className="text-[9px] text-slate-400">+{indicators.length - 2} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-emerald-700 text-[10px]">Nominal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. SELECTED ASSET LIFECYCLE RUL PROJECTION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 whitespace-nowrap shrink-0">
                {selectedOrTop.machine_id}
              </span>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {selectedOrTop.machine_name} · Lifecycle RUL Projection Horizon
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Extrapolated remaining useful life degradation curve based on multivariate random forest inference
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-600">Current Health: <strong className="text-slate-900 font-mono">{selectedOrTop.machine_health}%</strong></span>
            <span className="text-xs text-slate-600">RUL: <strong className="text-blue-700 font-mono">{selectedOrTop.predicted_rul_days} Days</strong></span>
          </div>
        </div>

        <SingleTrendPlot
          title={`${selectedOrTop.machine_id} RUL Degradation Trajectory (Days)`}
          yLabel="RUL Days"
          trendData={historyData?.rul_trend}
          actualColor="#2563EB"
          isFullWidth={true}
          minClamp={0}
          maxClamp={300}
          minSpan={20}
          metricType="rul"
        />
      </div>

    </div>
  );
};

export default MaintenanceDashboard;
