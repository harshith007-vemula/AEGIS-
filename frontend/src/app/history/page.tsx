'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  History as HistoryIcon, Calendar, MapPin, AlertCircle, FileDown, ShieldAlert, FileText, ChevronRight 
} from 'lucide-react';
import { api } from '@/lib/api';
import IncidentReplay from '@/components/IncidentReplay';

export default function IncidentHistoryPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const incList = await api.incidents.list();
      setIncidents(incList);

      const repList = await api.incidents.getReportsList();
      setReports(repList);

      if (incList.length > 0) {
        setSelectedIncident(incList[0]);
        // Find corresponding report
        const rep = repList.find((r: any) => r.incident_id === incList[0].id);
        setSelectedReport(rep || null);
      }
    } catch (err) {
      console.error('Failed to retrieve history logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!api.auth.getCurrentUser()) {
      router.push('/auth/login');
      return;
    }
    fetchHistory();
  }, []);

  const handleSelectIncident = (inc: any) => {
    setSelectedIncident(inc);
    const rep = reports.find((r: any) => r.incident_id === inc.id);
    setSelectedReport(rep || null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-950/20 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-950/20 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-950/20 border-yellow-500/20';
      default: return 'text-green-500 bg-green-950/20 border-green-500/20';
    }
  };

  const downloadReportPdf = async (incidentId: string) => {
    try {
      const url = api.incidents.getPdfUrl(incidentId);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('aegis_token')}`
        }
      });
      if (!response.ok) throw new Error('PDF Generation failed');
      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', `AEGIS_CRISIS_BRIEF_${incidentId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF report.');
    }
  };

  return (
    <div className="pl-64 min-h-screen pb-12 bg-[#02040a]">
      {/* Top Header */}
      <header className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/20 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-slate-100 tracking-wider uppercase">INCIDENT HISTORY</h2>
          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-widest">Relational Archives & System Auditing</p>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* History Feed List (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 text-indigo-400" />
              <span>Relational Disaster Ledger</span>
            </h3>

            {loading ? (
              <div className="p-8 text-center text-slate-500 glass-panel rounded-xl">Loading database archives...</div>
            ) : incidents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 glass-panel rounded-xl">No historical incident records in ledger.</div>
            ) : (
              <div className="space-y-3 pr-1">
                {incidents.map((inc) => {
                  const isSelected = selectedIncident?.id === inc.id;
                  const hasReport = reports.some(r => r.incident_id === inc.id);

                  return (
                    <div 
                      key={inc.id}
                      onClick={() => handleSelectIncident(inc)}
                      className={`glass-panel p-4 rounded-xl cursor-pointer transition-all duration-300 flex justify-between items-center border ${
                        isSelected 
                          ? 'border-indigo-500 bg-gradient-to-r from-indigo-950/15 to-slate-950' 
                          : 'border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div className="truncate pr-4 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xs font-bold text-slate-100 truncate">🚨 {inc.title}</h4>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${getPriorityColor(inc.priority)}`}>
                            {inc.priority}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 truncate font-sans">{inc.description}</p>
                        
                        <div className="flex gap-4 mt-3 text-[9px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-600" />
                            {new Date(inc.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-600" />
                            {inc.address || 'San Francisco'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {hasReport && (
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/50 text-[8px] font-bold px-2 py-0.5 rounded">
                            REPORT COMPILED
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 transition-all ${isSelected ? 'text-indigo-400 translate-x-1' : 'text-slate-600'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Incident Report Side panel (1 column) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Incident Metadata Details</span>
            </h3>

            {selectedIncident ? (
              <div className="glass-panel rounded-xl border-slate-800 p-5 space-y-5">
                <div className="border-b border-slate-900 pb-3">
                  <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">🚨 {selectedIncident.title}</h4>
                  <p className="text-[9px] text-slate-400 font-mono mt-1">INCIDENT KEY: {selectedIncident.id}</p>
                </div>

                {/* Status card */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                    <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Current Status</span>
                    <span className="text-[10px] font-extrabold text-slate-300 block mt-1 uppercase">{selectedIncident.status}</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                    <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">Coordinates</span>
                    <span className="text-[9px] font-mono text-slate-400 block mt-1 truncate">
                      {selectedIncident.location_lat.toFixed(4)}, {selectedIncident.location_lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 font-sans text-xs">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Operator Logs</span>
                  <p className="text-slate-300 leading-relaxed bg-slate-950/30 p-3 rounded-lg border border-slate-900">
                    {selectedIncident.description}
                  </p>
                </div>

                {/* AI report details inside card */}
                {selectedReport ? (
                  <div className="border-t border-slate-900 pt-5 mt-4 space-y-4">
                    <div className="flex justify-between items-center bg-indigo-950/10 border border-indigo-900/30 rounded-xl p-3">
                      <div>
                        <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">AI Threat Rating</span>
                        <span className="text-base font-black text-red-500 glow-text-red block mt-0.5">
                          {selectedReport.risk_score} / 100
                        </span>
                      </div>
                      <button 
                        onClick={() => downloadReportPdf(selectedIncident.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-[10px] font-bold text-white uppercase tracking-wider transition-all"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF BRIEF</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">AI Threat Vectors</span>
                      <ul className="space-y-1">
                        {selectedReport.suggested_actions.map((act: string, idx: number) => (
                          <li key={idx} className="flex gap-2 text-[10px] text-slate-400 font-sans leading-relaxed">
                            <span className="text-red-500 font-bold">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Interactive Mission Replay */}
                    <div className="pt-4 border-t border-slate-900">
                      <IncidentReplay rescuePlan={selectedReport.rescue_plan} />
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-900 pt-5 mt-4 flex items-center justify-center gap-2 p-6 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-900 font-sans text-xs">
                    <ShieldAlert className="w-4 h-4 text-slate-700" />
                    <span>No AI response compiled for this log. Go to Emergency Console to activate agent swarm.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel rounded-xl border-slate-800 p-8 text-center text-slate-500 min-h-[400px] flex items-center justify-center font-sans">
                <span>Select an incident card to inspect metadata records.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
