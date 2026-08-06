'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, Key, Database, Cpu, Terminal, FileCheck, Radio 
} from 'lucide-react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [gatewayStatus, setGatewayStatus] = useState<any>({
    mode: 'SIMULATION_AI',
    database: 'IN_MEMORY_STATEFUL_FALLBACK'
  });

  const fetchSettingsDetails = async () => {
    try {
      const logsList = await api.resources.listLogs();
      setLogs(logsList);
      
      // Hit backend base route to fetch gateway operational status
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('aegis_token')}`
        }
      });
      if (res.ok) {
        // Just verify connection
      }
      
      const stats = await fetch('http://localhost:5000/').then(r => r.json()).catch(() => null);
      if (stats) {
        setGatewayStatus(stats);
      }
    } catch (err) {
      console.error('Failed to retrieve system settings details:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (!api.auth.getCurrentUser()) {
      router.push('/auth/login');
      return;
    }
    fetchSettingsDetails();
  }, []);

  return (
    <div className="pl-64 min-h-screen pb-12 bg-[#02040a]">
      {/* Top Header */}
      <header className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/20 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-slate-100 tracking-wider uppercase">SYSTEM SETTINGS</h2>
          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-widest">Aegis Core Architecture Overlays</p>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panels (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* API configurations */}
            <div className="glass-panel p-6 rounded-xl border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Gateway Integrations</h3>
              </div>
              <div className="space-y-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gemini API Connection Status</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-900">
                    <div className="relative flex items-center justify-center w-5 h-5 rounded bg-indigo-950 text-indigo-400">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">
                        {gatewayStatus.mode === 'LIVE_AI' ? 'Google Gemini 1.5 Flash (ACTIVE API)' : 'System Simulation (MOCK API MODE)'}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Determined by GEMINI_API_KEY environment variable.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Database Adapter Sync</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-900">
                    <div className="relative flex items-center justify-center w-5 h-5 rounded bg-emerald-950 text-emerald-400">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">
                        {gatewayStatus.database === 'SUPABASE_PROD' ? 'Supabase cloud PostgreSQL (ACTIVE LINK)' : 'Stateful Local Fallback (IN-MEMORY)'}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Determined by SUPABASE_URL environment variable.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Protocol Rules SOPs */}
            <div className="glass-panel p-6 rounded-xl border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">State Response SOP Protocols</h3>
              </div>
              <div className="text-xs font-sans space-y-3 leading-relaxed text-slate-300">
                <p>AEGIS swarms reference standard operating protocols. Current protocols active:</p>
                <ul className="space-y-2 pl-4 list-disc text-slate-400">
                  <li><b>Flood Triage 102:</b> Rafts and boats priority for depths &gt; 0.5 meters.</li>
                  <li><b>Wildfire Containment 404:</b> Perimeter buffer zones, chemical foam dispatch.</li>
                  <li><b>Seismic Structural 808:</b> Debris clearing, gas shutoffs, hospital triage outpost grids.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* System logs view (1 column) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>System-wide Audit Trail</span>
            </h3>

            <div className="glass-panel rounded-xl border-slate-800 p-5 bg-slate-950/70 min-h-[400px] flex flex-col justify-between font-mono text-xs select-text">
              <div>
                <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span className="font-bold text-slate-200 uppercase tracking-wider">Aegis Audit Logs</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {loadingLogs ? (
                    <p className="text-xs text-slate-600 italic py-10 text-center font-sans">Awaiting connection...</p>
                  ) : logs.length === 0 ? (
                    <p className="text-xs text-slate-600 italic py-10 text-center font-sans">No audit events generated.</p>
                  ) : (
                    logs.map((log: any) => (
                      <div key={log.id} className="py-1 border-b border-slate-900/40 last:border-b-0 text-[10px] leading-relaxed">
                        <span className="text-slate-500">[{new Date(log.created_at).toLocaleTimeString()}]</span>{' '}
                        <span className="text-slate-400 font-bold uppercase">[{log.component}]</span>{' '}
                        <span className={log.level === 'error' ? 'text-red-400 font-bold' : (log.level === 'warn' ? 'text-amber-400' : 'text-slate-300')}>
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-slate-900 pt-3 mt-4 text-[9px] text-slate-600 flex justify-between">
                <span>GATEWAY SECURE</span>
                <span>CPU STABLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
