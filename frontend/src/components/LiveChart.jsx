import React, { useState } from 'react';
import Plot from 'react-plotly.js';

const LiveChart = ({ historyData }) => {
  const [selectedMetric, setSelectedMetric] = useState('Temperature');

  const metricConfigs = {
    Temperature: { label: 'Temperature (°C)', key: 'temperature_trend', color: '#2563EB', unit: '°C' },
    Vibration: { label: 'Vibration RMS (mm/s)', key: 'vibration_trend', color: '#2563EB', unit: 'mm/s' },
    Motor_Current: { label: 'Motor Current (A)', key: 'motor_current_trend', color: '#2563EB', unit: 'A' },
  };

  const config = metricConfigs[selectedMetric] || metricConfigs.Temperature;
  const trend = historyData?.[config.key] || { actual: [], predicted_future: [] };
  const healthTrend = historyData?.machine_health_trend?.actual || [];

  const xHist = trend.actual.map((_, i) => i + 1);
  const latestDay = xHist.length > 0 ? xHist[xHist.length - 1] : 1;
  const xFuture = trend.actual.length > 0
    ? trend.predicted_future.map((_, i) => latestDay + i)
    : [];

  const visibleMin = Math.max(1, latestDay - 100);
  const visibleMax = latestDay + 20;

  // Telemetry-driven degradation detection (first day health drops below 98.0%)
  let degradationDay = null;
  for (let i = 0; i < healthTrend.length; i++) {
    if (healthTrend[i] < 98.0) {
      degradationDay = i + 1;
      break;
    }
  }

  const shapes = degradationDay ? [
    {
      type: 'line',
      x0: degradationDay,
      x1: degradationDay,
      y0: 0,
      y1: 1,
      yref: 'paper',
      line: { color: '#EF4444', width: 1.5, dash: 'dash' },
    },
  ] : [];

  const annotations = degradationDay ? [
    {
      x: degradationDay,
      y: 1.05,
      yref: 'paper',
      text: `Condition Degradation Detected (Day ${degradationDay})`,
      showarrow: false,
      font: { size: 10, color: '#DC2626' },
      bgcolor: '#FEE2E2',
      bordercolor: '#FCA5A5',
      borderwidth: 1,
      borderpad: 2,
    },
  ] : [];

  return (
    <div className="industrial-card p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 mb-2 gap-2">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Live Sensor Stream & Predictive Projection</h2>
          <p className="text-xs text-gray-500">Real-time signal analysis across 365-day digital twin lifecycle</p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-gray-600">Select Parameter:</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-1.5 font-medium cursor-pointer"
          >
            <option value="Temperature">Temperature (°C)</option>
            <option value="Vibration">Vibration RMS (mm/s)</option>
            <option value="Motor_Current">Motor Current (A)</option>
          </select>
        </div>
      </div>

      <div className="w-full h-[360px]">
        <Plot
          data={[
            {
              x: xHist,
              y: trend.actual,
              type: 'scatter',
              mode: 'lines',
              name: 'Actual Reading',
              line: { color: config.color, width: 2 },
            },
            {
              x: xFuture,
              y: trend.predicted_future,
              type: 'scatter',
              mode: 'lines',
              name: 'Predicted Future',
              line: { color: '#F59E0B', width: 2, dash: 'dash' },
            },
          ]}
          layout={{
            autosize: true,
            height: 350,
            margin: { l: 45, r: 20, t: 40, b: 45 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#FAFAFA',
            xaxis: {
              title: { text: 'Day', font: { size: 11, color: '#6B7280' } },
              gridcolor: '#F3F4F6',
              zeroline: false,
              range: [visibleMin, visibleMax],
              autorange: false,
            },
            yaxis: {
              title: { text: config.label, font: { size: 11, color: '#6B7280' } },
              gridcolor: '#F3F4F6',
              zeroline: false,
            },
            shapes: shapes,
            annotations: annotations,
            legend: {
              orientation: 'h',
              y: 1.15,
              x: 1,
              xanchor: 'right',
              font: { size: 11, color: '#374151' },
            },
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>
    </div>
  );
};

export default LiveChart;
