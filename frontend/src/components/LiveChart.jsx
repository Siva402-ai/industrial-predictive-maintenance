import React, { useState, useRef } from 'react';
import Plot from 'react-plotly.js';

export function calculateAdaptiveYRange(dataArray, minClamp, maxClamp, minSpan, type, rangeRef) {
  if (!dataArray || dataArray.length === 0) {
    return [minClamp, maxClamp];
  }

  const rawMin = Math.min(...dataArray);
  const rawMax = Math.max(...dataArray);

  let targetMin, targetMax;

  if (type === 'temperature') {
    targetMin = Math.floor(rawMin - 1.0);
    targetMax = Math.ceil(rawMax + 1.0);
  } else if (type === 'vibration') {
    targetMin = rawMin - 0.15;
    targetMax = rawMax + 0.15;
  } else if (type === 'current') {
    targetMin = rawMin - 0.5;
    targetMax = rawMax + 0.5;
  } else if (type === 'rul') {
    targetMin = rawMin - 40.0;
    targetMax = rawMax + 40.0;
  } else {
    targetMin = rawMin - 1.0;
    targetMax = rawMax + 1.0;
  }

  if (targetMax - targetMin < minSpan) {
    const mid = (targetMax + targetMin) / 2;
    targetMin = mid - minSpan / 2;
    targetMax = mid + minSpan / 2;
  }

  targetMin = Math.max(minClamp, targetMin);
  targetMax = Math.min(maxClamp, targetMax);

  if (targetMax - targetMin < minSpan) {
    if (targetMin === minClamp) {
      targetMax = Math.min(maxClamp, targetMin + minSpan);
    } else if (targetMax === maxClamp) {
      targetMin = Math.max(minClamp, targetMax - minSpan);
    }
  }

  // 15% Hysteresis check
  if (rangeRef && rangeRef.current) {
    const [cMin, cMax] = rangeRef.current;
    const cSpan = cMax - cMin;
    const thresh = 0.15 * cSpan;

    if (rawMin > cMin + thresh && rawMax < cMax - thresh) {
      return rangeRef.current;
    }
  }

  const res = [Math.round(targetMin * 100) / 100, Math.round(targetMax * 100) / 100];
  if (rangeRef) {
    rangeRef.current = res;
  }
  return res;
}

const LiveChart = ({ historyData }) => {
  const [selectedMetric, setSelectedMetric] = useState('Temperature');
  const [isDeviationView, setIsDeviationView] = useState(false);
  const currentRangeRef = useRef(null);

  const metricConfigs = {
    Temperature: { label: 'Operating Temp', key: 'temperature_trend', color: '#2563EB', unit: '°C', minClamp: 55, maxClamp: 95, minSpan: 6, type: 'temperature', dtick: 5, minorDtick: 1 },
    Vibration: { label: 'Vibration RMS', key: 'vibration_trend', color: '#2563EB', unit: 'mm/s', minClamp: 0, maxClamp: 8, minSpan: 1, type: 'vibration', dtick: 1, minorDtick: 0.2 },
    Motor_Current: { label: 'Motor Current', key: 'motor_current_trend', color: '#2563EB', unit: 'A', minClamp: 5, maxClamp: 30, minSpan: 4, type: 'current', dtick: 5, minorDtick: 1 },
    Pressure: { label: 'Pressure', key: 'pressure_trend', color: '#2563EB', unit: 'PSI', minClamp: 0, maxClamp: 95, minSpan: 10, type: 'pressure', dtick: 10, minorDtick: 2 },
    RPM: { label: 'Shaft Speed', key: 'rpm_trend', color: '#2563EB', unit: 'RPM', minClamp: 1200, maxClamp: 2100, minSpan: 100, type: 'rpm', dtick: 100, minorDtick: 25 },
    Flow_Rate: { label: 'Fluid Flow', key: 'flow_rate_trend', color: '#2563EB', unit: 'L/min', minClamp: 20, maxClamp: 180, minSpan: 15, type: 'flow', dtick: 20, minorDtick: 5 },
    Oil_Temperature: { label: 'Lube Oil Temp', key: 'oil_temperature_trend', color: '#2563EB', unit: '°C', minClamp: 35, maxClamp: 95, minSpan: 6, type: 'temperature', dtick: 5, minorDtick: 1 },
    Power_Consumption: { label: 'Power Demand', key: 'power_consumption_trend', color: '#2563EB', unit: 'kW', minClamp: 10, maxClamp: 55, minSpan: 6, type: 'power', dtick: 10, minorDtick: 2 },
  };

  const config = metricConfigs[selectedMetric] || metricConfigs.Temperature;
  const trend = historyData?.[config.key] || { actual: [], predicted_future: [] };

  const xHist = trend.actual.map((_, i) => i + 1);
  const latestDay = xHist.length > 0 ? xHist[xHist.length - 1] : 1;
  const xFuture = trend.actual.length > 0
    ? trend.predicted_future.map((_, i) => latestDay + i)
    : [];

  const visibleMin = Math.max(1, latestDay - 100);
  const visibleMax = latestDay + 20;

  const baseline = trend.actual.length > 0 ? trend.actual[0] : 0;
  const yActual = isDeviationView ? trend.actual.map((v) => Number((v - baseline).toFixed(2))) : trend.actual;
  const yPredicted = isDeviationView ? trend.predicted_future.map((v) => Number((v - baseline).toFixed(2))) : trend.predicted_future;

  const adaptiveYRange = calculateAdaptiveYRange(
    yActual,
    isDeviationView ? -10 : config.minClamp,
    isDeviationView ? 25 : config.maxClamp,
    config.minSpan,
    config.type,
    currentRangeRef
  );

  const currentVal = trend.actual.length > 0 ? trend.actual[trend.actual.length - 1] : '--';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Telemetry Stream & Predictive Horizon
              </h3>
              <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                {currentVal} {config.unit}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live measurement vs. 20-step forward extrapolated ML trajectory
            </p>
          </div>
        </div>

        {/* View toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDeviationView(!isDeviationView)}
            className={`text-xs px-2.5 py-1 rounded-md font-semibold transition border ${
              isDeviationView
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isDeviationView ? 'Δ Baseline Deviation' : 'Absolute Values'}
          </button>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-2 border-b border-slate-100 scrollbar-thin">
        {Object.entries(metricConfigs).map(([key, item]) => {
          const isSelected = selectedMetric === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {item.label} ({item.unit})
            </button>
          );
        })}
      </div>

      {/* Plotly Interactive Chart Container */}
      <div className="w-full h-80 pt-2">
        <Plot
          data={[
            {
              x: xHist,
              y: yActual,
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Actual Telemetry',
              line: { color: '#2563EB', width: 2.5, shape: 'spline', smoothing: 0.3 },
              marker: { size: 3, color: '#1D4ED8' },
              hovertemplate: `Day %{x}: %{y:.2f} ${config.unit}<extra></extra>`,
            },
            {
              x: xFuture,
              y: yPredicted,
              type: 'scatter',
              mode: 'lines',
              name: 'Predicted Future',
              line: { color: '#D97706', width: 2.5, dash: 'dash' },
              hovertemplate: `Proj Day %{x}: %{y:.2f} ${config.unit}<extra></extra>`,
            },
          ]}
          layout={{
            autosize: true,
            margin: { l: 48, r: 24, t: 12, b: 36 },
            paper_bgcolor: '#FFFFFF',
            plot_bgcolor: '#F8FAFC',
            font: { family: 'inherit', size: 10, color: '#475569' },
            showlegend: true,
            legend: {
              orientation: 'h',
              x: 0.5,
              y: 1.08,
              xanchor: 'center',
              font: { size: 10, color: '#334155' },
            },
            xaxis: {
              title: { text: 'Operating Timeline (Days / Cycles)', font: { size: 10, color: '#64748B' } },
              range: [visibleMin, visibleMax],
              gridcolor: '#E2E8F0',
              zeroline: false,
              tickfont: { size: 9, color: '#64748B' },
            },
            yaxis: {
              title: { text: `${config.label} (${config.unit})`, font: { size: 10, color: '#64748B' } },
              gridcolor: '#E2E8F0',
              zeroline: false,
              range: adaptiveYRange,
              tickfont: { size: 9, color: '#64748B' },
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

export default LiveChart;
