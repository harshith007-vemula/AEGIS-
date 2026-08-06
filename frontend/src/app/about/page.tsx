'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, BookOpen, Layers, Bot, Cpu } from 'lucide-react';
import { api } from '@/lib/api';

export default function AboutPage() {
  const router = useRouter();

  useEffect(() => {
    if (!api.auth.getCurrentUser()) {
      router.push('/auth/login');
    }
  }, []);

  const agentsDescription = [
    { title: 'Aegis Coordinator', role: 'Deconstructs user logs, determines incident category, allocates subtasks.' },
    { title: 'Vision Sentinel', role: 'Analyzes visual parameters and satellite overlays for hazard metrics.' },
    { title: 'Protocol Researcher', role: 'Fetches government disaster recovery SOP rules and FEMA guidelines.' },
    { title: 'Logistics Planner', role: 'Finds nearest hospitals, calculates dispatch assets, and route steps.' },
    { title: 'Risk Analyzer', role: 'Simulates hazard spread and computes population estimates at risk.' },
    { title: 'Aegis Voice Assistant', role: 'Transcribes incoming voice distress calls.' },
    { title: 'Alert Communicator', role: 'Prepares alert warning templates for SMS, Email, and WhatsApp.' },
    { title: 'Action Automator', role: 'Writers resource registers, dispatches fleets, and registers briefings.' },
    { title: 'Memory Agent', role: 'Matches incident parameters against history to extract lessons.' }
  ];

  return (
    <div className="pl-64 min-h-screen pb-12 bg-[#02040a]">
      {/* Top Header */}
      <header className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/20 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-slate-100 tracking-wider uppercase">ABOUT AEGIS AI</h2>
          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-widest">Platform Theory & Specifications</p>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans text-xs">
        {/* Intro */}
        <div className="glass-panel p-6 rounded-xl border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Autonomous Governance & Operations</h3>
              <p className="text-[10px] text-slate-400">Platform Core Specifications</p>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed text-sm">
            AEGIS AI (Autonomous Emergency & Intelligent Governance System) is a multi-agent operational dashboard engineered to streamline disaster response. During floods, wildfires, or earthquakes, information is scattered and response speeds are critical. AEGIS leverages a decentralized network of 9 specialized AI agents executing structured Gemini LLM reasoning steps to coordinate logistics, estimate risk threat vectors, and automate dispatch alerts.
          </p>
        </div>

        {/* Swarm Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-xl border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Decentralized Agent Swarm Roles</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agentsDescription.map((agent, idx) => (
                <div key={idx} className="p-4 bg-slate-950/40 rounded-xl border border-slate-900 flex items-start gap-3">
                  <div className="p-2 bg-indigo-950/30 border border-indigo-500/10 rounded text-indigo-400 mt-0.5">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">{agent.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{agent.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* FEMA protocols */}
            <div className="glass-panel p-6 rounded-xl border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Integrated FEMA Rules</span>
              </h3>
              <p className="text-slate-400 leading-relaxed">
                The platform contains integrated RAG protocols mapped to FEMA guidelines:
              </p>
              <div className="space-y-2.5">
                <div className="p-3 bg-slate-950/60 rounded border border-slate-900">
                  <span className="font-bold text-slate-200 block">SOP 102 (Flood Water Rescue)</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Deploy inflatable boat taskforces. Establish staging shelter grids outside 100-year flood coordinates.</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded border border-slate-900">
                  <span className="font-bold text-slate-200 block">SOP 404 (Wildfire Containment)</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Deploy perimeter retardant buffers. Dispatch fire engines and alert communities within 5km radius.</span>
                </div>
              </div>
            </div>

            {/* Specifications tech stack */}
            <div className="glass-panel p-6 rounded-xl border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Software Specifications</span>
              </h3>
              <div className="space-y-1.5 font-mono text-[10px] text-slate-400">
                <p>Frontend   : <span className="text-slate-200">Next.js, TypeScript, Tailwind</span></p>
                <p>Backend    : <span className="text-slate-200">Express Node.js Server</span></p>
                <p>AI Engine  : <span className="text-slate-200">Google Gemini 1.5 Flash</span></p>
                <p>Database   : <span className="text-slate-200">Supabase / Stateful In-Memory</span></p>
                <p>Geospatial : <span className="text-slate-200">Leaflet Maps engine</span></p>
                <p>Deploy     : <span className="text-slate-200">Docker, Compose configurations</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
