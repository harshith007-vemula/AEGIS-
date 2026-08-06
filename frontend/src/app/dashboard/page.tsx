'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, Truck, Heart, Wind, ShieldAlert, Activity, RefreshCw 
} from 'lucide-react';
import { api } from '@/lib/api';
import DashboardMap from '@/components/DashboardMap';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>({
    activeIncidents: 0,
    totalIncidents: 0,
    dispatchedVehicles: 0,
    totalVehicles: 0,
    averageRisk: 0
  });
  const [incidents, setIncidents] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const statsData = await api.resources.getStats();
      setStats(statsData);

      const incList = await api.incidents.list();
      setIncidents(incList);

      const vehList = await api.resources.listVehicles();
      setVehicles(vehList);

      const hospList = await api.resources.listHospitals();
      setHospitals(hospList);
    } catch (err) {
      console.error('Failed to retrieve dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!api.auth.getCurrentUser()) {
      router.push('/auth/login');
      return;
    }
    fetchDashboardData();

    // 15 seconds polling for real-time look
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeIncidentsList = incidents.filter(i => i.status === 'active' || i.status === 'analyzing');

  return (
    <div className="pl-64 min-h-screen pb-12 bg-[#02040a]">
      {/* Top Header */}
      <header className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/20 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-slate-100 tracking-wider uppercase">COMMAND CENTER</h2>
          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-widest">Autonomous Governance & Operations</p>
        </div>
        <button 
          onClick={() => { setLoading(true); fetchDashboardData(); }}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Incidents */}
          <div className="glass-panel p-5 rounded-xl flex items-center justify-between border-slate-800 hover:border-slate-750 transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Active Incidents</span>
              <span className="text-3xl font-extrabold text-red-500 glow-text-red block">{stats.activeIncidents}</span>
              <span className="text-[9px] text-slate-500 block">Total reported: {stats.totalIncidents}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-950/20 border border-red-500/20 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          {/* Card 2: Vehicles Dispatched */}
          <div className="glass-panel p-5 rounded-xl flex items-center justify-between border-slate-800 hover:border-slate-750 transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Fleets Dispatched</span>
              <span className="text-3xl font-extrabold text-blue-500 glow-text-blue block">
                {stats.dispatchedVehicles}
              </span>
              <span className="text-[9px] text-slate-500 block">Total available: {stats.totalVehicles - stats.dispatchedVehicles}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-950/20 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Hospital Capacities */}
          <div className="glass-panel p-5 rounded-xl flex items-center justify-between border-slate-800 hover:border-slate-750 transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Medical Capacity</span>
              <span className="text-3xl font-extrabold text-emerald-500 glow-text-emerald block">
                {hospitals.reduce((acc, h) => acc + h.capacity_available, 0)}
              </span>
              <span className="text-[9px] text-slate-500 block">Beds open across {stats.hospitalsCount || 3} facilities</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Heart className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Threat Risk Level */}
          <div className="glass-panel p-5 rounded-xl flex items-center justify-between border-slate-800 hover:border-slate-750 transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Avg Severity Risk</span>
              <span className="text-3xl font-extrabold text-slate-300 block">{stats.averageRisk}%</span>
              <span className="text-[9px] text-slate-500 block">Threshold: high warning</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Map & Feeds Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaflet Map Overlay (Takes 2 columns in large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel p-5 rounded-xl border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Geospatial Operations Map</h3>
                </div>
                <span className="text-[9px] font-mono text-slate-400 uppercase">Live Overlay</span>
              </div>
              <div className="h-[400px] w-full rounded-xl overflow-hidden relative">
                <DashboardMap incidents={incidents} vehicles={vehicles} hospitals={hospitals} />
              </div>
            </div>
          </div>

          {/* Sidebar Widgets (Takes 1 column) */}
          <div className="space-y-6">
            {/* Weather Widget */}
            <div className="glass-panel p-5 rounded-xl border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Wind className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold uppercase tracking-widest">Regional Meteorological</span>
                </div>
                <span className="bg-sky-950 text-sky-400 border border-sky-900 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">ADVISORY</span>
              </div>
              <div className="flex justify-between items-center font-sans">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Heavy Precip Storm</h4>
                  <p className="text-xs text-slate-400 mt-1">Sustained Winds: 48 km/h</p>
                  <p className="text-xs text-slate-400">Rainfall: 14mm / hr forecast</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-200">14°C</span>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Flood Danger index: High</p>
                </div>
              </div>
            </div>

            {/* Active Incident List */}
            <div className="glass-panel p-5 rounded-xl border-slate-800 space-y-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Active Dispatch Missions</span>
                <span className="bg-red-950 text-red-400 border border-red-900 text-[8px] font-bold px-2 py-0.5 rounded-full">
                  {activeIncidentsList.length} TARGETS
                </span>
              </div>
              
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {activeIncidentsList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No active emergency missions reported.</p>
                ) : (
                  activeIncidentsList.map((inc) => (
                    <div 
                      key={inc.id}
                      onClick={() => router.push('/emergency')} 
                      className="p-3 bg-slate-950/50 hover:bg-slate-900/60 border border-slate-850 hover:border-slate-800 rounded-lg cursor-pointer transition-all flex justify-between items-center"
                    >
                      <div className="truncate pr-2">
                        <h4 className="text-xs font-bold text-slate-200 truncate">🚨 {inc.title}</h4>
                        <p className="text-[10px] text-slate-400 truncate mt-1">{inc.address || 'San Francisco'}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border flex-shrink-0 ${
                        inc.priority === 'critical' ? 'text-red-500 border-red-900/50 bg-red-950/20' : 'text-orange-500 border-orange-900/50 bg-orange-950/20'
                      }`}>
                        {inc.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
