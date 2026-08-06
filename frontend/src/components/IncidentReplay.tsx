'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Shield } from 'lucide-react';

interface RescuePlanStep {
  step: number;
  title: string;
  description: string;
  assigned_team: string;
}

interface IncidentReplayProps {
  rescuePlan: RescuePlanStep[];
}

export default function IncidentReplay({ rescuePlan }: IncidentReplayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= rescuePlan.length - 1) {
            setIsPlaying(false); // Stop when reached end
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, rescuePlan.length]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleStepForward = () => {
    setCurrentStep(prev => Math.min(rescuePlan.length - 1, prev + 1));
  };

  const handleStepBackward = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  if (!rescuePlan || rescuePlan.length === 0) return null;

  return (
    <div className="glass-panel p-5 rounded-xl border-slate-800 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Tactical Mission Replay</h4>
        </div>
        <span className="bg-indigo-950 text-indigo-400 border border-indigo-900/40 text-[9px] font-bold px-2 py-0.5 rounded font-mono">
          TIME MACHINE
        </span>
      </div>

      {/* Replay Stats Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
          <span>PROGRESS</span>
          <span>{currentStep + 1} / {rescuePlan.length} ACTIONS</span>
        </div>
        <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / rescuePlan.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step details card */}
      <div className="p-4 bg-slate-950/70 border border-slate-900 rounded-xl space-y-2 relative overflow-hidden">
        <div className="absolute right-3 top-3 w-[150px] h-[150px] rounded-full bg-indigo-500/5 blur-[50px] pointer-events-none" />
        <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest block">
          Current Action Details
        </span>
        <h5 className="text-xs font-bold text-slate-200 mt-1">
          Step {rescuePlan[currentStep].step}: {rescuePlan[currentStep].title}
        </h5>
        <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-2">
          {rescuePlan[currentStep].description}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-950/40 border border-indigo-500/20 text-[9px] font-mono text-indigo-300 uppercase tracking-wider">
          <span>Dispatch Fleet:</span>
          <span className="font-bold text-slate-100">{rescuePlan[currentStep].assigned_team}</span>
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="flex items-center justify-center gap-3 py-1">
        <button 
          onClick={handleReset}
          className="p-2 rounded-lg bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={handleStepBackward}
          disabled={currentStep === 0}
          className="p-2 rounded-lg bg-slate-900 border border-slate-850 disabled:opacity-40 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={handlePlayPause}
          className="p-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-bold transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>
        <button 
          onClick={handleStepForward}
          disabled={currentStep === rescuePlan.length - 1}
          className="p-2 rounded-lg bg-slate-900 border border-slate-850 disabled:opacity-40 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
