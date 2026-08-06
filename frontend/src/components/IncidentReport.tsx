'use client';

import { useState } from 'react';
import { 
  FileText, ShieldAlert, Heart, Truck, FileDown, CheckCircle2, ChevronDown, ChevronUp, AlertOctagon 
} from 'lucide-react';
import { api } from '@/lib/api';

interface IncidentReportProps {
  report: any;
  incidentTitle: string;
}

export default function IncidentReport({ report, incidentTitle }: IncidentReportProps) {
  const [showGovReport, setShowGovReport] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-red-500 border-red-500 bg-red-950/20';
      case 'high': return 'text-orange-500 border-orange-500 bg-orange-950/20';
      case 'medium': return 'text-yellow-500 border-yellow-500 bg-yellow-950/20';
      default: return 'text-green-500 border-green-500 bg-green-950/20';
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      // Trigger browser download directly from endpoint
      const url = api.incidents.getPdfUrl(report.incident_id);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('aegis_token')}`
        }
      });
      
      if (!response.ok) throw new Error('PDF Generation API failed');
      
      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', `AEGIS_CRISIS_BRIEF_${report.incident_id.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Score */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Threat Evaluation</span>
            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-red-500 glow-text-red">
              {report.risk_score}
            </span>
            <span className="text-slate-400 text-sm">/ 100</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">Computed by Risk Assessment swarm modeling.</p>
        </div>

        {/* Priority Level */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Dispatch Priority</span>
            <AlertOctagon className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-4">
            <span className={`px-4 py-2 border rounded-full text-sm font-bold uppercase tracking-widest ${getPriorityColor(report.priority)}`}>
              {report.priority}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">Allocated state priority tier mapping.</p>
        </div>

        {/* Export Brief */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Official Reporting</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4">
            <button 
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/40 text-slate-100 font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-indigo-500/20"
            >
              <FileDown className="w-4 h-4" />
              <span>{downloading ? 'Compiling PDF...' : 'Download PDF Brief'}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">Approved and cryptographically signed PDF document.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="glass-panel p-6 rounded-xl border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest border-b border-slate-850 pb-2">
          AI Incident Review Summary
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed font-sans">
          {report.summary}
        </p>
      </div>

      {/* Suggested Actions & Risk Factors */}
      {report.suggested_actions && report.suggested_actions.length > 0 && (
        <div className="glass-panel p-6 rounded-xl border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">
            Identified Threat Vectors
          </h3>
          <ul className="space-y-2">
            {report.suggested_actions.map((factor: string, idx: number) => (
              <li key={idx} className="flex gap-3 text-xs text-slate-300 font-sans leading-relaxed">
                <span className="text-red-500 font-bold">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tactical Rescue Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Tactical Response Steps</span>
          </h3>
          <div className="space-y-4 relative pl-3 border-l border-slate-800 ml-2">
            {report.rescue_plan.map((step: any, idx: number) => (
              <div key={idx} className="relative space-y-1">
                <span className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-slate-900 border-2 border-indigo-500 flex-shrink-0" />
                <h4 className="text-xs font-bold text-slate-200">
                  Step {step.step}: {step.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-sans">
                  <span className="text-indigo-400 font-bold uppercase tracking-wider text-[9px] mr-1">
                    [{step.assigned_team}]
                  </span>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Hospitals & Resources */}
        <div className="space-y-6">
          {/* Hospital Recs */}
          <div className="glass-panel p-6 rounded-xl border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Recommended Medical Targets</span>
            </h3>
            <div className="space-y-3">
              {report.hospital_recommendation.map((hosp: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800/60 last:border-b-0">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{hosp.name}</h4>
                    <p className="text-[10px] text-slate-400">Distance: {hosp.distance} | Contact: {hosp.contact}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-200">{hosp.available_capacity} Beds</span>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">Triage Level {hosp.priority}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="glass-panel p-6 rounded-xl border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-400" />
              <span>Allocated Logistics Supplies</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {report.resource_allocation.map((res: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-900/40 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">
                    {res.type} Supply
                  </span>
                  <span className="text-sm font-extrabold text-slate-200 block mt-1">
                    {res.quantity}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {res.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Government Briefing */}
      {report.govt_report && (
        <div className="glass-panel rounded-xl border-slate-800 overflow-hidden">
          <button 
            onClick={() => setShowGovReport(!showGovReport)}
            className="flex items-center justify-between w-full px-6 py-4 bg-slate-900/60 font-mono text-xs text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Cryptographic Agency Transcript Briefing</span>
            </div>
            {showGovReport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showGovReport && (
            <div className="p-6 bg-slate-950 font-mono text-[10px] text-slate-300 overflow-x-auto leading-relaxed border-t border-slate-800 select-text">
              <pre className="whitespace-pre">{report.govt_report}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
