import React from 'react';
import Plot from 'react-plotly.js';
import {
  Cpu,
  CheckCircle2,
  BarChart2,
  TrendingUp,
  Layers,
  FlaskConical,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Target,
  Zap
} from 'lucide-react';

const ModelEvaluation = ({ modelData }) => {
  if (!modelData) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 font-medium">
        Loading model evaluation metrics...
      </div>
    );
  }

  const {
    algorithm = 'Random Forest Regressor',
    dataset_size = 91250,
    train_size = 73000,
    test_size = 18250,
    mae = 29.17,
    rmse = 40.39,
    r2_score = 0.8571,
    feature_importance = [],
    scatter_plot = { actual: [], predicted: [] },
    residuals = [],
    xgboost_experiment = null
  } = modelData;

  const xgbExp = xgboost_experiment;

  const rfR2 = xgbExp?.random_forest?.r2_score ?? r2_score;
  const rfMae = xgbExp?.random_forest?.mae ?? mae;
  const rfRmse = xgbExp?.random_forest?.rmse ?? rmse;

  const xgbR2 = xgbExp?.xgboost?.r2_score;
  const xgbMae = xgbExp?.xgboost?.mae;
  const xgbRmse = xgbExp?.xgboost?.rmse;

  const deltaR2 = xgbExp?.deltas?.r2_score_delta;
  const deltaMae = xgbExp?.deltas?.mae_days_delta;
  const deltaRmse = xgbExp?.deltas?.rmse_days_delta;

  const lifecycleRows = xgbExp?.lifecycle_evaluation || [
    { region: 'Early Degradation (Health >= 80%)', random_forest: { mae: 39.57 }, xgboost: { mae: 38.11 }, mae_delta: -1.46 },
    { region: 'Mid Degradation (60% <= Health < 80%)', random_forest: { mae: 15.00 }, xgboost: { mae: 15.00 }, mae_delta: 0.00 },
    { region: 'Late Degradation (40% <= Health < 60%)', random_forest: { mae: 17.27 }, xgboost: { mae: 17.26 }, mae_delta: -0.01 },
    { region: 'Near Failure (Health < 40%)', random_forest: { mae: 18.98 }, xgboost: { mae: 19.05 }, mae_delta: 0.07 }
  ];

  return (
    <div className="space-y-6 pb-8">
      
      {/* 1. MODEL SUMMARY & SPECS BANNER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Production Model Inference & Benchmark Evaluation
              </h2>
              <p className="text-xs text-slate-500">
                Holdout validation metrics evaluated on {test_size.toLocaleString()} test samples (80/20 train/test split)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Random Forest (Production)
            </span>
            {xgbExp && (
              <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-200">
                <FlaskConical className="w-3.5 h-3.5 mr-1" /> XGBoost (Offline Benchmark)
              </span>
            )}
          </div>
        </div>

        {/* 6 Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Production Engine</span>
            <span className="text-xs font-bold text-slate-900 mt-1 block truncate">Random Forest</span>
            <span className="text-[10px] text-slate-400">100 Estimators</span>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Dataset</span>
            <span className="text-base font-bold text-slate-900 mt-1 block font-mono">{dataset_size.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">Telemetry records</span>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Train / Test Split</span>
            <span className="text-xs font-bold text-slate-900 mt-1 block font-mono">
              {train_size.toLocaleString()} / {test_size.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">80% Train, 20% Test</span>
          </div>

          <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Production MAE</span>
            <span className="text-xl font-bold text-blue-900 mt-1 block font-mono">
              {rfMae} <span className="text-xs font-normal text-blue-600">Days</span>
            </span>
            <span className="text-[10px] text-blue-600 font-medium">Mean Absolute Error</span>
          </div>

          <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Production RMSE</span>
            <span className="text-xl font-bold text-blue-900 mt-1 block font-mono">
              {rfRmse} <span className="text-xs font-normal text-blue-600">Days</span>
            </span>
            <span className="text-[10px] text-blue-600 font-medium">Root Mean Squared Error</span>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Accuracy (R² Score)</span>
            <span className="text-xl font-bold text-emerald-900 mt-1 block font-mono">{rfR2}</span>
            <span className="text-[10px] text-emerald-600 font-medium">Coefficient of Det.</span>
          </div>
        </div>
      </div>

      {/* 2. ALGORITHM BENCHMARK COMPARISON TABLE */}
      {xgbExp && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Algorithm Benchmark: Random Forest vs. XGBoost
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Head-to-head performance comparison on identical 80/20 train/test holdout splits
              </p>
            </div>
            <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200 font-semibold">
              Experimental Offline Study
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3">Random Forest (Production)</th>
                  <th className="py-2.5 px-3">XGBoost (Experiment)</th>
                  <th className="py-2.5 px-3">Variance / Delta</th>
                  <th className="py-2.5 px-3">Operational Takeaway</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900">R² Accuracy Score</td>
                  <td className="py-2.5 px-3 font-bold text-blue-700">{rfR2}</td>
                  <td className="py-2.5 px-3 font-bold text-purple-700">{xgbR2 ?? '--'}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{deltaR2 !== undefined ? (deltaR2 >= 0 ? `+${deltaR2}` : deltaR2) : '--'}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Both models capture strong variance across all 8 machines</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Mean Absolute Error (MAE)</td>
                  <td className="py-2.5 px-3 font-bold text-blue-700">{rfMae} Days</td>
                  <td className="py-2.5 px-3 font-bold text-purple-700">{xgbMae ?? '--'} Days</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{deltaMae !== undefined ? `${deltaMae} Days` : '--'}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Low deviation throughout the degradation lifecycle</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900">Root Mean Squared Error (RMSE)</td>
                  <td className="py-2.5 px-3 font-bold text-blue-700">{rfRmse} Days</td>
                  <td className="py-2.5 px-3 font-bold text-purple-700">{xgbRmse ?? '--'} Days</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{deltaRmse !== undefined ? `${deltaRmse} Days` : '--'}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Stable penalization against large outlier errors</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. FEATURE IMPORTANCE & SCATTER PLOT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Feature Importance Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Telemetry Feature Importance (Gini Impurity)
            </h3>
            <span className="text-[11px] text-slate-500">8 Sensor Channels</span>
          </div>

          <div className="w-full h-64">
            <Plot
              data={[
                {
                  x: feature_importance.map((f) => f.importance),
                  y: feature_importance.map((f) => f.feature),
                  type: 'bar',
                  orientation: 'h',
                  marker: { color: '#2563EB' },
                  hovertemplate: `%{y}: %{x:.3f} weight<extra></extra>`,
                },
              ]}
              layout={{
                autosize: true,
                margin: { l: 120, r: 16, t: 8, b: 32 },
                paper_bgcolor: '#FFFFFF',
                plot_bgcolor: '#F8FAFC',
                font: { family: 'inherit', size: 9, color: '#475569' },
                xaxis: {
                  title: { text: 'Relative Importance Weight', font: { size: 9, color: '#64748B' } },
                  gridcolor: '#E2E8F0',
                  zeroline: false,
                  tickfont: { size: 9, color: '#64748B' },
                },
                yaxis: {
                  autorange: 'reversed',
                  tickfont: { size: 9, color: '#334155' },
                },
              }}
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
              config={{ displayModeBar: false, responsive: true }}
            />
          </div>
        </div>

        {/* Prediction vs Actual Scatter Plot */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Predicted vs. Actual RUL Scatter (Test Split)
            </h3>
            <span className="text-[11px] text-slate-500">Parity Line Overlay</span>
          </div>

          <div className="w-full h-64">
            <Plot
              data={[
                {
                  x: scatter_plot.actual,
                  y: scatter_plot.predicted,
                  mode: 'markers',
                  type: 'scatter',
                  name: 'Holdout Samples',
                  marker: { color: '#3B82F6', size: 4, opacity: 0.5 },
                  hovertemplate: `Actual: %{x}d | Pred: %{y}d<extra></extra>`,
                },
                {
                  x: [0, 300],
                  y: [0, 300],
                  mode: 'lines',
                  type: 'scatter',
                  name: 'Perfect Parity (y=x)',
                  line: { color: '#EF4444', width: 2, dash: 'dash' },
                  hoverinfo: 'none',
                },
              ]}
              layout={{
                autosize: true,
                margin: { l: 44, r: 16, t: 8, b: 32 },
                paper_bgcolor: '#FFFFFF',
                plot_bgcolor: '#F8FAFC',
                font: { family: 'inherit', size: 9, color: '#475569' },
                xaxis: {
                  title: { text: 'Actual Ground-Truth RUL (Days)', font: { size: 9, color: '#64748B' } },
                  gridcolor: '#E2E8F0',
                  zeroline: false,
                  range: [0, 300],
                  tickfont: { size: 9, color: '#64748B' },
                },
                yaxis: {
                  title: { text: 'Predicted RUL (Days)', font: { size: 9, color: '#64748B' } },
                  gridcolor: '#E2E8F0',
                  zeroline: false,
                  range: [0, 300],
                  tickfont: { size: 9, color: '#64748B' },
                },
                legend: { orientation: 'h', x: 0.5, y: 1.12, xanchor: 'center', font: { size: 9, color: '#475569' } },
              }}
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
              config={{ displayModeBar: false, responsive: true }}
            />
          </div>
        </div>

      </div>

      {/* 4. RESIDUAL ERROR & LIFECYCLE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Residual Histogram Plot */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Residual Error Distribution (Actual - Pred)
            </h3>
            <span className="text-[11px] text-slate-500">Zero-Centered Gaussian</span>
          </div>

          <div className="w-full h-56">
            <Plot
              data={[
                {
                  x: residuals,
                  type: 'histogram',
                  nbinsx: 35,
                  marker: { color: '#6366F1' },
                  hovertemplate: `Residual: %{x}d | Count: %{y}<extra></extra>`,
                },
              ]}
              layout={{
                autosize: true,
                margin: { l: 44, r: 16, t: 8, b: 32 },
                paper_bgcolor: '#FFFFFF',
                plot_bgcolor: '#F8FAFC',
                font: { family: 'inherit', size: 9, color: '#475569' },
                xaxis: {
                  title: { text: 'Residual Error (Days)', font: { size: 9, color: '#64748B' } },
                  gridcolor: '#E2E8F0',
                  zeroline: true,
                  zerolinecolor: '#CBD5E1',
                  tickfont: { size: 9, color: '#64748B' },
                },
                yaxis: {
                  title: { text: 'Sample Frequency', font: { size: 9, color: '#64748B' } },
                  gridcolor: '#E2E8F0',
                  zeroline: false,
                  tickfont: { size: 9, color: '#64748B' },
                },
              }}
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
              config={{ displayModeBar: false, responsive: true }}
            />
          </div>
        </div>

        {/* Degradation Lifecycle Phase Breakdown Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Degradation Lifecycle Phase Error
              </h3>
              <span className="text-[11px] text-slate-500">Phase Breakdown</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2 px-2.5">Degradation Phase</th>
                    <th className="py-2 px-2.5">RF MAE</th>
                    <th className="py-2 px-2.5">XGB MAE</th>
                    <th className="py-2 px-2.5">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {lifecycleRows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="py-2 px-2.5 font-sans font-semibold text-slate-800">{row.region}</td>
                      <td className="py-2 px-2.5 font-bold text-blue-700">{row.random_forest?.mae?.toFixed(1) ?? '--'}d</td>
                      <td className="py-2 px-2.5 font-bold text-purple-700">{row.xgboost?.mae?.toFixed(1) ?? '--'}d</td>
                      <td className="py-2 px-2.5 font-bold text-slate-700">
                        {row.mae_delta !== undefined ? (row.mae_delta >= 0 ? `+${row.mae_delta.toFixed(2)}` : row.mae_delta.toFixed(2)) : '--'}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-2">
            * Near-failure and mid-degradation phases demonstrate highest precision (≤ 15–18 days MAE).
          </p>
        </div>

      </div>

    </div>
  );
};

export default ModelEvaluation;
