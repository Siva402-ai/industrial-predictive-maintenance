import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Clock, ShieldCheck, Wifi, WifiOff, Radio, RefreshCw } from 'lucide-react';

const TopBar = ({ activeTab, setActiveTab, backendStatus, statusData, currentData }) => {
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fleetSize = currentData?.fleet_size || statusData?.fleet_size || 8;
  const isMqtt = currentData?.data_mode === 'mqtt' || statusData?.data_mode === 'mqtt';
  const mqttConnected = currentData?.mqtt_status?.connected || statusData?.mqtt?.connected;
  const mqttMessages = currentData?.mqtt_status?.messages_received ?? statusData?.mqtt?.messages_received ?? 0;

  const navItems = [
    { id: 'dashboard', label: 'Live Monitoring' },
    { id: 'analytics', label: 'Fleet Analytics' },
    { id: 'maintenance', label: 'Maintenance Queue' },
    { id: 'evaluation', label: 'Model Evaluation' },
  ];

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 shadow-sm sticky top-0 z-30 select-none">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Left: Branding & Platform Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-400/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-tight text-white">AI Predictive Maintenance</span>
                <span className="bg-blue-950 text-blue-300 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-blue-800">SCADA v2.4</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">Industrial Equipment Fleet Management</p>
            </div>
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Operational Status Indicators */}
        <div className="flex items-center space-x-3 text-xs">
          
          {/* Data Source Indicator */}
          <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            {isMqtt ? (
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${mqttConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[11px] font-bold text-slate-200">MQTT LIVE</span>
                <span className="text-[10px] text-slate-400 font-mono">({mqttMessages} msg)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-[11px] font-bold text-slate-200">SIMULATION MODE</span>
              </div>
            )}
          </div>

          {/* System Online Status */}
          <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${backendStatus ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-[11px] font-semibold text-slate-200">
              {backendStatus ? 'SYSTEM ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* Clock */}
          <div className="hidden xl:flex items-center space-x-1.5 text-slate-300 font-mono text-xs pl-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeStr}</span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default TopBar;
