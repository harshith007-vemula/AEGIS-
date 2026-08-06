'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Key, Mail, RefreshCw, Zap } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If user already logged in, redirect to dashboard
    if (api.auth.getCurrentUser()) {
      router.push('/dashboard');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.auth.login({ email, password });
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@aegis.ai');
    setPassword('admin123');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#02040a] px-6">
      {/* Background Orbs */}
      <div className="absolute top-[20%] left-[30%] w-[350px] h-[350px] rounded-full bg-indigo-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[30%] w-[350px] h-[350px] rounded-full bg-red-900/5 blur-[130px] pointer-events-none" />

      {/* Login Card Panel */}
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border-slate-900 shadow-2xl relative z-10 space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-xl font-black tracking-widest text-slate-100 uppercase">DECRYPT SESSION</h1>
          <p className="text-xs text-slate-400 max-w-[280px]">AEGIS COMMAND INTERFACE AUTHENTICATION</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-lg text-xs text-red-400 font-bold text-center font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operator Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500/80 transition-all font-sans"
                placeholder="operator@aegis.gov"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security Password</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500/80 transition-all font-sans"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/40 text-slate-100 font-bold text-xs uppercase tracking-wider transition-all duration-300 border border-indigo-500/30 cursor-pointer shadow-lg hover:shadow-indigo-500/20"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>ESTABLISH SESSION LINK</span>
            )}
          </button>
        </form>

        {/* Credentials guide block */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">Demo Access Credentials</p>
            <button 
              type="button" 
              onClick={handleQuickFill}
              className="flex items-center gap-1 px-2 py-1 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/30 rounded text-[9px] font-bold text-indigo-300 uppercase cursor-pointer transition-all"
            >
              <Zap className="w-2.5 h-2.5 text-yellow-400 animate-bounce" />
              <span>Quick Fill</span>
            </button>
          </div>
          <div className="text-[10px] font-mono text-slate-400 space-y-1">
            <p>Login ID : <span className="text-slate-200 font-sans">admin@aegis.ai</span></p>
            <p>Password : <span className="text-slate-200 font-sans">admin123</span></p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-[10px] text-slate-500 hover:text-slate-400 font-mono tracking-widest uppercase transition-all">
            ← BACK TO ARCHITECTURE SPECS
          </Link>
        </div>
      </div>
    </div>
  );
}
