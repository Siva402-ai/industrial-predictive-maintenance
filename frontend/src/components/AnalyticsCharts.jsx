import React, { useRef } from 'react';
import Plot from 'react-plotly.js';
import { calculateAdaptiveYRange } from './LiveChart';
import {
  Thermometer,
  Activity,
  Zap,
  Gauge,
  ShieldAlert,
  BarChart3,
  TrendingDown,
  Layers,
  HeartPulse,
  Flame,
  Droplets,
  RotateCw
} from 'lucide-react';

const SingleTrendPlot = ({
  title,
  yLabel,
  unit,
  trendData,
  actualColor = '#2563EB',
  predictedColor = '#D97706',
  isFullWidth = false,
  minClamp = 0,
  maxClamp = 100,
  minSpan = 1,
  metricType = 'general',
  dtick = null,
  minorDtick = null
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

  const latestVal = actual.length > 0 ? actual[actual.length - 1] : '--';

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col ${isFullWidth ? 'w-full' : ''}`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
        <span className="text-[11px] font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          Latest: {latestVal} {unit}
        </span>
      </div>

      <div className="w-full h-56">
        <Plot
          data={[
            {
              x: xHist,
              y: actual,
              type: 'scatter',
              mode: 'lines',
              name: 'Actual Telemetry',
              line: { color: actualColor, width: 2.5, shape: 'spline', smoothing: 0.3 },
              hovertemplate: `Day %{x}: %{y:.2f} ${unit}<extra></extra>`,
            },
            {
              x: xFuture,
              y: predicted,
              type: 'scatter',
              mode: 'lines',
              name: 'Predicted Future',
              line: { color: predictedColor, width: 2, dash: 'dash' },
              hovertemplate: `Proj %{x}: %{y:.2f} ${unit}<extra></extra>`,
            },
          ]}
          layout={{
            autosize: true,
            margin: { l: 44, r: 16, t: 8, b: 32 },
            paper_bgcolor: '#FFFFFF',
            plot_bgcolor: '#F8FAFC',
            font: { family: 'inherit', size: 9, color: '#475569' },
            showlegend: true,
            legend: { orientation: 'h', x: 0.5, y: 1.14, xanchor: 'center', font: { size: 9, color: '#475569' } },
            xaxis: {
              range: [visibleMin, visibleMax],
              gridcolor: '#E2E8F0',
              zeroline: false,
              tickfont: { size: 9, color: '#64748B' },
              title: { text: 'Operating Timeline (Days)', font: { size: 9, color: '#64748B' } },
            },
            yaxis: {
              range: adaptiveRange,
              gridcolor: '#E2E8F0',
              zeroline: false,
              tickfont: { size: 9, color: '#64748B' },
              title: { text: `${yLabel} (${unit})`, font: { size: 9, color: '#64748B' } },
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

const AnalyticsCharts = ({ historyData, selectedMachineId }) => {
  const fleetComp = historyData?.fleet_comparison || {};
  const machineIds = Object.keys(fleetComp).length > 0 ? Object.keys(fleetComp) : ['M-001', 'M-002', 'M-003', 'M-004', 'M-005', 'M-006', 'M-007', 'M-008'];

  // Calculate fleet stats
  const latestHealths = machineIds.map((mId) => {
    const arr = fleetComp[mId]?.machine_health || [];
    return arr.length > 0 ? arr[arr.length - 1] : 100;
  });

  const latestRuls = machineIds.map((mId) => {
    const arr = fleetComp[mId]?.predicted_rul || [];
    return arr.length > 0 ? arr[arr.length - 1] : 250;
  });

  const avgHealth = Math.round((latestHealths.reduce((a, b) => a + b, 0) / (latestHealths.length || 1)) * 10) / 10;
  const avgRul = Math.round(latestRuls.reduce((a, b) => a + b, 0) / (latestRuls.length || 1));
  const criticalCount = latestHealths.filter((h) => h < 20).length;
  const attentionCount = latestHealths.filter((h) => h >= 20 && h < 80).length;

  // Find extremes
  let minHealthIdx = 0;
  let maxHealthIdx = 0;
  latestHealths.forEach((h, idx) => {
    if (h < latestHealths[minHealthIdx]) minHealthIdx = idx;
    if (h > latestHealths[maxHealthIdx]) maxHealthIdx = idx;
  });

  const healthiestId = machineIds[maxHealthIdx] || 'M-001';
  const weakestId = machineIds[minHealthIdx] || 'M-008';

  return (
    <div className="space-y-6">
      
      {/* 1. FLEET ANALYTICS KPI SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Average Fleet Health</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{avgHealth}%</div>
          <span className="text-[11px] text-slate-400">Aggregated condition index</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Average Remaining Life</span>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">{avgRul} Days</div>
          <span className="text-[11px] text-slate-400">Mean time to overhaul</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Machines Needing Attention</span>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">{attentionCount}</div>
          <span className="text-[11px] text-amber-600">Slight & moderate wear</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Critical Assets</span>
          <div className="text-2xl font-bold font-mono text-red-700 mt-1">{criticalCount}</div>
          <span className="text-[11px] text-red-600">Immediate servicing required</span>
        </div>
      </div>

      {/* 2. FLEET COMPARISON OVERLAYS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Fleet Comparative Distribution</h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Side-by-side health degradation and remaining useful life ranking across all 8 machines
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
              Healthiest: <strong>{healthiestId}</strong> ({latestHealths[maxHealthIdx]}%)
            </span>
            <span className="text-[11px] text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200 font-medium">
              Highest Risk: <strong>{weakestId}</strong> ({latestRuls[minHealthIdx]}d RUL)
            </span>
          </div>
        </div>

        {/* 2 Comparison Plots (Health & RUL Bar charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Health Comparison Bar Chart */}
          <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-200">
            <span className="text-xs font-bold text-slate-800 block mb-2">Machine Health Index by Asset (%)</span>
            <div className="w-full h-52">
              <Plot
                data={[
                  {
                    x: machineIds,
                    y: latestHealths,
                    type: 'bar',
                    marker: {
                      color: latestHealths.map((h) => (h < 20 ? '#EF4444' : h < 60 ? '#F59E0B' : h < 80 ? '#3B82F6' : '#10B981')),
                    },
                    text: latestHealths.map((h) => `${h}%`),
                    textposition: 'auto',
                    hovertemplate: `%{x}: %{y:.1f}% Health<extra></extra>`,
                  },
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 36, r: 16, t: 8, b: 28 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: '#FFFFFF',
                  yaxis: { range: [0, 105], gridcolor: '#E2E8F0', zeroline: false, title: { text: 'Health (%)', font: { size: 9, color: '#64748B' } } },
                  xaxis: { tickfont: { size: 10, color: '#334155' } },
                }}
                useResizeHandler
                style={{ width: '100%', height: '100%' }}
                config={{ displayModeBar: false, responsive: true }}
              />
            </div>
          </div>

          {/* RUL Comparison Bar Chart */}
          <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-200">
            <span className="text-xs font-bold text-slate-800 block mb-2">Remaining Useful Life (Days)</span>
            <div className="w-full h-52">
              <Plot
                data={[
                  {
                    x: machineIds,
                    y: latestRuls,
                    type: 'bar',
                    marker: { color: '#2563EB' },
                    text: latestRuls.map((r) => `${r}d`),
                    textposition: 'auto',
                    hovertemplate: `%{x}: %{y} Days RUL<extra></extra>`,
                  },
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 36, r: 16, t: 8, b: 28 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: '#FFFFFF',
                  yaxis: { range: [0, 300], gridcolor: '#E2E8F0', zeroline: false, title: { text: 'RUL (Days)', font: { size: 9, color: '#64748B' } } },
                  xaxis: { tickfont: { size: 10, color: '#334155' } },
                }}
                useResizeHandler
                style={{ width: '100%', height: '100%' }}
                config={{ displayModeBar: false, responsive: true }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* 3. ALL TELEMETRY FEATURES BY ENGINEERING CATEGORY */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {selectedMachineId} · Complete Diagnostic Telemetry Horizons
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">Historical traces with 20-step ML trend projections</span>
        </div>

        <div className="space-y-4">
          
          {/* CATEGORY A: THERMAL DYNAMICS */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span>Thermal Channels</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SingleTrendPlot
                title="Operating Temperature"
                yLabel="Temperature"
                unit="°C"
                trendData={historyData?.temperature_trend}
                actualColor="#2563EB"
                minClamp={55}
                maxClamp={95}
                minSpan={6}
                metricType="temperature"
              />
              <SingleTrendPlot
                title="Lube Oil Temperature"
                yLabel="Oil Temp"
                unit="°C"
                trendData={historyData?.oil_temperature_trend}
                actualColor="#2563EB"
                minClamp={35}
                maxClamp={95}
                minSpan={6}
                metricType="temperature"
              />
            </div>
          </div>

          {/* CATEGORY B: MECHANICAL DYNAMICS */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>Mechanical Channels</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SingleTrendPlot
                title="Vibration Velocity (RMS)"
                yLabel="Vibration"
                unit="mm/s"
                trendData={historyData?.vibration_trend}
                actualColor="#2563EB"
                minClamp={0}
                maxClamp={8}
                minSpan={1}
                metricType="vibration"
              />
              <SingleTrendPlot
                title="Shaft Rotational Speed"
                yLabel="Speed"
                unit="RPM"
                trendData={historyData?.rpm_trend}
                actualColor="#2563EB"
                minClamp={1200}
                maxClamp={2100}
                minSpan={100}
                metricType="rpm"
              />
            </div>
          </div>

          {/* CATEGORY C: PROCESS & FLUID */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-500" />
              <span>Process & Fluid Channels</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SingleTrendPlot
                title="System Hydraulic Pressure"
                yLabel="Pressure"
                unit="PSI"
                trendData={historyData?.pressure_trend}
                actualColor="#2563EB"
                minClamp={0}
                maxClamp={95}
                minSpan={10}
                metricType="pressure"
              />
              <SingleTrendPlot
                title="Fluid Flow Rate"
                yLabel="Flow"
                unit="L/min"
                trendData={historyData?.flow_rate_trend}
                actualColor="#2563EB"
                minClamp={20}
                maxClamp={180}
                minSpan={15}
                metricType="flow"
              />
            </div>
          </div>

          {/* CATEGORY D: ELECTRICAL & POWER */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Electrical & Power Channels</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SingleTrendPlot
                title="Motor Stator Current"
                yLabel="Current"
                unit="A"
                trendData={historyData?.motor_current_trend}
                actualColor="#2563EB"
                minClamp={5}
                maxClamp={30}
                minSpan={4}
                metricType="current"
              />
              <SingleTrendPlot
                title="Power Demand Consumption"
                yLabel="Power"
                unit="kW"
                trendData={historyData?.power_consumption_trend}
                actualColor="#2563EB"
                minClamp={10}
                maxClamp={55}
                minSpan={6}
                metricType="power"
              />
            </div>
          </div>

          {/* CATEGORY E: CONDITION & RUL TRAJECTORY */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
              <span>Asset Lifecycle Degradation</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SingleTrendPlot
                title="Health Index Decay Curve"
                yLabel="Health"
                unit="%"
                trendData={historyData?.machine_health_trend}
                actualColor="#10B981"
                minClamp={0}
                maxClamp={100}
                metricType="health"
              />
              <SingleTrendPlot
                title="Remaining Useful Life (RUL) Trajectory"
                yLabel="RUL"
                unit="Days"
                trendData={historyData?.rul_trend}
                actualColor="#2563EB"
                minClamp={0}
                maxClamp={300}
                metricType="rul"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AnalyticsCharts;
