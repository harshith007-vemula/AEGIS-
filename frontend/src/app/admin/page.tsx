'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, Users, Cpu, Database, Settings, ToggleLeft, ToggleRight, Trash2, CheckCircle2 
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminPanelPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([
    { id: 'u-1', email: 'admin@aegis.ai', full_name: 'AEGIS Commander', role: 'admin' },
    { id: 'u-2', email: 'soma_responder@aegis.gov', full_name: 'SOMA Field Lead', role: 'field_responder' },
    { id: 'u-3', email: 'operator_hq@aegis.gov', full_name: 'HQ Operations Lead', role: 'operator' }
  ]);
  const [temps, setTemps] = useState<{ [key: string]: number }>({});
  const [activeTab, setActiveTab] = useState<'agents' | 'users' | 'diagnostics'>('agents');
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<any>({ database: 'IN_MEMORY_STATEFUL_FALLBACK' });

  const fetchAdminDetails = async () => {
    try {
      const data = await api.agents.list();
      setAgents(data);
      
      // Default temperatures
      const initialTemps: { [key: string]: number } = {};
      data.forEach(a => {
        initialTemps[a.role] = a.role === 'coordinator' ? 0.2 : (a.role === 'planning' ? 0.4 : 0.7);
      });
      setTemps(initialTemps);

      const stats = await fetch('http://localhost:5000/').then(r => r.json()).catch(() => null);
      if (stats) setDbStatus(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'admin') {
      alert('ACCESS DENIED: Required security clearance ADMIN not present.');
      router.push('/dashboard');
      return;
    }
    fetchAdminDetails();
  }, []);

  const handleToggleAgent = (role: string) => {
    setAgents(prev => prev.map(a => {
      if (a.role === role) {
        const nextStatus = a.status === 'error' ? 'idle' : 'error';
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  const handleChangeTemp = (role: string, val: number) => {
    setTemps(prev => ({ ...prev, [role]: val }));
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) return { ...u, role: newRole };
      return u;
    }));
  };

  const handlePurgeRecords = async () => {
    const confirm = window.confirm('WARNING: Are you sure you want to purge all active incident reports? This action cannot be undone.');
    if (!confirm) return;
    
    setLoading(true);
    try {
      // Trigger database reset on agents and clear storage simulation
      await api.agents.reset();
      alert('LEADERS PURGED: Systems reset to default state.');
      fetchAdminDetails();
    } catch (err) {
      alert('Purge operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pl-64 min-h-screen pb-12 bg-[#02040a]">
      {/* Top Header */}
      <header className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/20 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-slate-100 tracking-wider uppercase">ADMIN PORTAL</h2>
          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-widest">Master Security Cleared Operations</p>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-900 pb-px">
          {(['agents', 'users', 'diagnostics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'border-indigo-500 text-slate-200' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'agents' && <Cpu className="w-4.5 h-4.5 inline mr-2 align-text-bottom" />}
              {tab === 'users' && <Users className="w-4.5 h-4.5 inline mr-2 align-text-bottom" />}
              {tab === 'diagnostics' && <Database className="w-4.5 h-4.5 inline mr-2 align-text-bottom" />}
              <span>{tab}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Manage Agents */}
        {activeTab === 'agents' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Gemini Engine Configurations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map(agent => (
                <div key={agent.id} className="glass-panel p-5 rounded-xl border-slate-850 flex flex-col justify-between h-[200px] hover:border-slate-800 transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase">{agent.name}</h4>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">Role: {agent.role.toUpperCase()}</p>
                    </div>

                    <button 
                      onClick={() => handleToggleAgent(agent.role)}
                      className={`flex items-center gap-1 text-xs cursor-pointer ${agent.status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
                    >
                      {agent.status === 'error' ? (
                        <div className="flex items-center gap-1.5">
                          <span>Offline</span>
                          <ToggleLeft className="w-6 h-6 text-red-500" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span>Online</span>
                          <ToggleRight className="w-6 h-6 text-emerald-500 animate-pulse" />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Temperature setting */}
                  <div className="space-y-2 mt-4 font-mono text-[9px] text-slate-400">
                    <div className="flex justify-between">
                      <span>LLM Model Temperature</span>
                      <span className="text-indigo-400 font-bold">{(temps[agent.role] ?? 0.5).toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.0" 
                      max="1.0" 
                      step="0.1"
                      value={temps[agent.role] ?? 0.5} 
                      onChange={(e) => handleChangeTemp(agent.role, parseFloat(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Manage Users */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Active Operations Staff</h3>
            
            <div className="glass-panel rounded-xl border-slate-850 overflow-hidden">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-850">
                    <th className="p-4">Staff Member</th>
                    <th className="p-4">Email ID</th>
                    <th className="p-4">Cleared Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-slate-900 hover:bg-slate-900/20 transition-all">
                      <td className="p-4 font-bold text-slate-200">{u.full_name}</td>
                      <td className="p-4 text-slate-400 font-mono">{u.email}</td>
                      <td className="p-4">
                        <select 
                          value={u.role} 
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-300 font-bold text-[10px] uppercase outline-none focus:border-indigo-500"
                        >
                          <option value="admin">Admin</option>
                          <option value="operator">Operator</option>
                          <option value="field_responder">Field Responder</option>
                          <option value="citizen">Citizen</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Diagnostics */}
        {activeTab === 'diagnostics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DB Health Status Card */}
            <div className="glass-panel p-6 rounded-xl border-slate-850 space-y-4 flex flex-col justify-between h-[220px]">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Database Health status</h3>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase">
                      {dbStatus.database === 'SUPABASE_PROD' ? 'Supabase cloud' : 'Local stateful memory'}
                    </h4>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">DB Adapter responding in 2ms. Reads/writes operational.</p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono">
                HOST PATH: Localhost:5000 | Status: Operational
              </div>
            </div>

            {/* Clear Database Card */}
            <div className="glass-panel p-6 rounded-xl border-slate-850 space-y-4 flex flex-col justify-between h-[220px]">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest text-red-500 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span>Administrative Purge Actions</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-2 leading-relaxed">
                  Reset the database, wipe all mock incident logs, restore initial agent statuses, and purge resources to default seed quantities.
                </p>
              </div>

              <button 
                onClick={handlePurgeRecords}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 rounded-xl text-red-400 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all w-full"
              >
                <Trash2 className="w-4 h-4" />
                <span>Purge Incidents & Reset Swarms</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
