'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, Terminal, Shield, RefreshCw, Layers } from 'lucide-react';
import { api } from '@/lib/api';

export default function AgentMonitorPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const fetchAgents = async () => {
    try {
      const data = await api.agents.list();
      setAgents(data);
      if (data.length > 0 && !selectedAgent) {
        setSelectedAgent(data[0]); // select coordinator by default
      } else if (selectedAgent) {
        // Keep updated details for selected agent
        const match = data.find((a: any) => a.id === selectedAgent.id);
        if (match) setSelectedAgent(match);
      }
    } catch (err) {
      console.error('Failed to retrieve agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!api.auth.getCurrentUser()) {
      router.push('/auth/login');
      return;
    }
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResetAgents = async () => {
    setLoading(true);
    try {
      await api.agents.reset();
      await fetchAgents();
    } catch (err) {
      console.error('Failed to reset agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-sky-400 bg-sky-950/20 border-sky-500/30';
      case 'thinking': return 'text-indigo-400 bg-indigo-950/20 border-indigo-500/30';
      case 'error': return 'text-red-400 bg-red-950/20 border-red-500/30';
      default: return 'text-slate-500 bg-slate-900 border-slate-800';
    }
  };

  const getSimulatedCpu = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return Math.floor(Math.random() * 20) + 60;
      case 'thinking': return Math.floor(Math.random() * 25) + 30;
      default: return 0;
    }
  };

  const getSimulatedMemory = (status: string, role: string) => {
    let multiplier = 10;
    if (role === 'coordinator') multiplier = 25;
    if (role === 'vision') multiplier = 50;

    switch (status?.toLowerCase()) {
      case 'active': return Math.floor(Math.random() * 30) + 120 + multiplier;
      case 'thinking': return Math.floor(Math.random() * 20) + 80 + multiplier;
      default: return 12 + Math.floor(Math.random() * 4);
    }
  };

  return (
    <div className="pl-64 min-h-screen pb-12 bg-[#02040a]">
      {/* Top Header */}
      <header className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/20 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-slate-100 tracking-wider uppercase">AGENT MONITOR</h2>
          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-widest">Multi-Agent CPU Diagnostics & Threads</p>
        </div>
        <button 
          onClick={handleResetAgents}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 transition-all bg-slate-900/60"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RESET SWARM STATUS</span>
        </button>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Status List (Grid taking 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Orchestrated Agents Cluster</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {agents.map((agent) => {
                const cpu = getSimulatedCpu(agent.status);
                const mem = getSimulatedMemory(agent.status, agent.role);
                const isSelected = selectedAgent?.id === agent.id;

                return (
                  <div 
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`glass-panel p-5 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[180px] ${
                      isSelected 
                        ? 'border-indigo-500 bg-gradient-to-b from-indigo-950/20 to-slate-950' 
                        : 'border-slate-850 hover:border-slate-750'
                    }`}
                  >
                    <div>
                      {/* Name & Status */}
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-extrabold text-slate-200 truncate uppercase tracking-wide">
                          {agent.name}
                        </h4>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase flex-shrink-0 ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 font-mono mt-1">ROLE: {agent.role.toUpperCase()}</p>
                    </div>

                    {/* Simulated Diagnostics bar graph */}
                    <div className="space-y-2 mt-4 font-mono text-[9px] text-slate-400">
                      {/* CPU Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>CPU LOAD</span>
                          <span className={cpu > 0 ? 'text-indigo-400 font-bold' : ''}>{cpu}%</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-500" 
                            style={{ width: `${Math.max(2, cpu)}%` }}
                          />
                        </div>
                      </div>

                      {/* Memory Usage */}
                      <div className="flex justify-between mt-1">
                        <span>MEM ALLOC</span>
                        <span className={agent.status !== 'idle' ? 'text-sky-400 font-bold' : ''}>{mem} MB</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Agent Logs Details (1 column) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Agent Log Monitor</span>
            </h3>

            {selectedAgent ? (
              <div className="glass-panel rounded-xl border-slate-800 bg-slate-950/70 p-5 min-h-[400px] flex flex-col justify-between font-mono text-xs select-text">
                <div>
                  <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{selectedAgent.name}</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5 font-mono">STATUS: {selectedAgent.status.toUpperCase()}</p>
                    </div>
                    <Layers className="w-4 h-4 text-slate-700" />
                  </div>

                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {!selectedAgent.logs || selectedAgent.logs.length === 0 ? (
                      <p className="text-xs text-slate-600 italic py-10 text-center font-sans">No diagnostic logs recorded for this agent in current threat context.</p>
                    ) : (
                      selectedAgent.logs.map((log: any, idx: number) => (
                        <div key={idx} className="py-1 border-b border-slate-900/40 last:border-b-0 text-[10px] leading-relaxed">
                          <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                          <span className={log.type === 'error' ? 'text-red-400' : 'text-slate-300'}>
                            {log.message}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-3 mt-4 text-[9px] text-slate-600 flex justify-between">
                  <span>AGENT NODE ID: {selectedAgent.id}</span>
                  <span>INIT: GMT+0</span>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-xl border-slate-800 p-8 text-center text-slate-500 min-h-[400px] flex items-center justify-center font-sans">
                <Shield className="w-6 h-6 text-slate-800 block mb-2" />
                <span>Select an agent node to view thread diagnostics.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
