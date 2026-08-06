'use client';

import { useEffect, useRef } from 'react';
import { Terminal, Shield, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface LogMessage {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AgentTerminalProps {
  logs: LogMessage[];
  isRunning: boolean;
  activeAgent: string | null;
}

export default function AgentTerminal({ logs, isRunning, activeAgent }: AgentTerminalProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-[450px] rounded-xl border border-slate-800 bg-[#020617]/90 backdrop-blur-md overflow-hidden font-mono shadow-2xl">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold tracking-wider text-[10px] text-slate-300">AEGIS DECENTRALIZED SWARM SYSTEM</span>
        </div>
        <div className="flex items-center gap-4">
          {isRunning ? (
            <div className="flex items-center gap-1.5 text-indigo-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span className="text-[10px] uppercase font-bold tracking-widest animate-pulse">
                Swarm Active: {activeAgent || 'ORCHESTRATING'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[10px] uppercase font-bold tracking-widest">SWARM INACTIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Content Logs */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2 text-xs select-text">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center space-y-2">
            <Shield className="w-8 h-8 text-slate-700 animate-pulse" />
            <p className="text-[11px] uppercase tracking-widest font-bold">Awaiting Swarm Activation Commands</p>
            <p className="text-[10px] font-sans max-w-[280px]">Upload voice reports, images, or emergency text to trigger the multi-agent decision chain.</p>
          </div>
        ) : (
          logs.map((log, index) => {
            let textColor = 'text-slate-300';
            let Icon = null;

            if (log.type === 'success') {
              textColor = 'text-emerald-400 glow-text-emerald';
              Icon = CheckCircle2;
            } else if (log.type === 'error') {
              textColor = 'text-red-400 glow-text-red';
              Icon = AlertCircle;
            } else if (log.type === 'warning') {
              textColor = 'text-amber-400';
              Icon = AlertCircle;
            }

            return (
              <div 
                key={index} 
                className={`flex gap-3 leading-relaxed py-1 px-2 rounded hover:bg-slate-900/30 transition-all ${textColor}`}
              >
                {/* Time */}
                <span className="text-slate-500 select-none flex-shrink-0">
                  [{formatDate(log.timestamp)}]
                </span>
                
                {/* Log Text */}
                <div className="flex gap-2 items-start">
                  {Icon && <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                  <span>{log.message}</span>
                </div>
              </div>
            );
          })
        )}
        
        {/* Blinking Cursor if Swarm is Processing */}
        {isRunning && (
          <div className="flex gap-2 items-center text-indigo-400 pl-2 animate-pulse py-1">
            <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
            <span className="animate-spin text-xs">⟳</span>
            <span>Agent swarming processes running...</span>
            <span className="w-2 h-4 bg-indigo-500 animate-caret flex-shrink-0"></span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
