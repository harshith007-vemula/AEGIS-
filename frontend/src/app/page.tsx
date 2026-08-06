'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, Radio, ArrowRight, Server, Users, Bot, Zap } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [glitchText, setGlitchText] = useState('AEGIS AI');

  useEffect(() => {
    // Sci-fi glitch titles effect
    const terms = ['AEGIS AI', 'A.E.G.I.S.', 'SYSTEM OPERATIVE', 'AEGIS AI'];
    let count = 0;
    const interval = setInterval(() => {
      setGlitchText(terms[count % terms.length]);
      count++;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { title: '9-Agent Collaborative Swarm', description: 'Coordinated specialized AI agents (Coordinator, Vision, Planning, Research, Risk, Voice, Communication, Automation, Memory).', icon: Users },
    { title: 'Explainable AI Decisioning', description: 'Complete auditable thought processes, reasoning timelines, confidence logs, and structured outputs for government standards.', icon: Bot },
    { title: 'Multimodal Sensor Ingestion', description: 'Direct processing of field images, satellite imagery, voice dispatches, document protocols, and structured texts.', icon: Zap },
    { title: 'Automated Dispatch & Controls', description: 'Automatic resource allocations, medical center dispatch recommendations, and community warning alerts via SMS, Email, and WhatsApp.', icon: Server },
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden px-6 py-12 md:p-24 select-none bg-[#02040a]">
      {/* Background Neon Glow Nodes */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-red-900/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,transparent_30%,#02040a_80%)] pointer-events-none" />

      {/* Top Header */}
      <header className="flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-red-950/30 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
            <Radio className="w-4 h-4" />
          </div>
          <span className="font-extrabold tracking-widest text-sm text-slate-100">AEGIS AI</span>
        </div>
        <Link 
          href="/auth/login"
          className="text-xs font-bold tracking-widest text-slate-400 hover:text-slate-200 transition-all uppercase"
        >
          AUTHENTICATE OPERATOR
        </Link>
      </header>

      {/* Hero Content */}
      <div className="my-auto max-w-4xl mx-auto text-center space-y-8 z-10 py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/30 border border-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold tracking-widest">
          <Shield className="w-3.5 h-3.5" />
          <span>Autonomous Emergency & Intelligent Governance System</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-400 uppercase select-none">
            {glitchText}
          </h1>
          <p className="text-base md:text-xl font-medium tracking-wide text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
            Autonomous multi-agent swarms responding to flooding, wildfires, earthquakes, and crises. AI that thinks, plans, and acts to save lives.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link 
            href="/auth/login"
            className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-red-700 to-indigo-700 hover:from-red-600 hover:to-indigo-600 text-slate-100 font-extrabold text-sm uppercase tracking-widest transition-all duration-300 border border-slate-100/10 shadow-2xl hover:shadow-indigo-500/20 hover:scale-105"
          >
            <span>ENTER COMMAND CENTER</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 z-10 w-full">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div 
              key={idx} 
              className="glass-panel p-6 rounded-xl border-slate-900/60 hover:border-slate-800 transition-all duration-300 flex items-start gap-4 text-left"
            >
              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/10 text-indigo-400">
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">{feature.title}</h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer System Info */}
      <footer className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-mono tracking-widest z-10 border-t border-slate-900/60 pt-6">
        <span>AEGIS CORE MODULE v1.0.0</span>
        <span>AUTONOMOUS THREAT DEEP REASONING CLUSTER ACTIVE</span>
        <span>© 2026 AEGIS GOV LABS</span>
      </footer>
    </div>
  );
}
