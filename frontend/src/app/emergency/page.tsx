'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertOctagon, Radio, FileImage, FileAudio, FileText, Bot, HelpCircle 
} from 'lucide-react';
import { api } from '@/lib/api';
import AgentTerminal from '@/components/AgentTerminal';
import IncidentReport from '@/components/IncidentReport';

export default function EmergencyConsolePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('San Francisco SOMA District');
  const [lat, setLat] = useState(37.7749);
  const [lng, setLng] = useState(-122.4194);

  // Attachment states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<any[]>([]);
  const [compiledReport, setCompiledReport] = useState<any>(null);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);

  // Pre-fill button functions for convenient testing
  const applyTemplate = (type: 'flood' | 'fire' | 'earthquake') => {
    if (type === 'flood') {
      setTitle('SOMA Inundation & Rising Waters');
      setDescription('Water main has burst combined with storm surge. Flood level is rising at 15cm/hour. Families trapped on roofs near 4th and King St. Multiple cars submerged. Immediate evacuation rafts requested.');
      setAddress('4th & King St, San Francisco, CA');
      setLat(37.7785);
      setLng(-122.3965);
    } else if (type === 'fire') {
      setTitle('Commercial Complex Fire Outbreak');
      setDescription('Multiple alarms active. Fire spreading to neighboring warehouses. Hazardous chemicals stored in adjacent bay. Heavy smoke visible. Need triage ambulances and hazardous material containment units.');
      setAddress('1200 Folsom St, San Francisco, CA');
      setLat(37.7738);
      setLng(-122.4118);
    } else {
      setTitle('Seismic Event & Structural Damage');
      setDescription('Substantial earth tremor felt. Multiple brick buildings cracked. Debris blocking traffic lanes. Secondary gas leak reported in basement of local market. Triage outpost required.');
      setAddress('Mission & 16th St, San Francisco, CA');
      setLat(37.7650);
      setLng(-122.4201);
    }
  };

  useEffect(() => {
    if (!api.auth.getCurrentUser()) {
      router.push('/auth/login');
    }

    const handleVoiceIntake = (e: Event) => {
      const data = (e as CustomEvent).detail;
      if (data) {
        setTitle(data.title || '');
        setDescription(data.description || '');
        setAddress(data.address || '');
        setLat(data.lat || 37.7749);
        setLng(data.lng || -122.4194);
      }
    };

    window.addEventListener('aegis-voice-input', handleVoiceIntake);
    return () => {
      window.removeEventListener('aegis-voice-input', handleVoiceIntake);
    };
  }, []);

  // Poll agent logs while swarm is running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(async () => {
        try {
          const agents = await api.agents.list();
          
          // Flatten all logs from agents and sort by time
          const allLogs: any[] = [];
          agents.forEach(agent => {
            if (agent.logs && agent.logs.length > 0) {
              agent.logs.forEach((log: any) => {
                allLogs.push({
                  ...log,
                  agent: agent.name
                });
              });
            }

            if (agent.status === 'thinking' || agent.status === 'active') {
              setActiveAgent(agent.name);
            }
          });

          const sortedLogs = allLogs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
          setTerminalLogs(sortedLogs);
        } catch (err) {
          console.error('Error fetching polling logs:', err);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });

  const handleLaunchSwarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsRunning(true);
    setCompiledReport(null);
    setTerminalLogs([]);
    setTerminalLogs([{ timestamp: new Date().toISOString(), message: 'System Operator initiated threat workspace. Coordinator booting...', type: 'info' }]);

    try {
      // 1. Create Incident in DB
      const incident = await api.incidents.create({
        title,
        description,
        location_lat: lat,
        location_lng: lng,
        address
      });
      setActiveIncidentId(incident.id);

      // Convert attachments to base64 if present
      let imageBase64 = '';
      let imageMimeType = '';
      let audioBase64 = '';
      let audioMimeType = '';

      if (imageFile) {
        imageBase64 = await toBase64(imageFile);
        imageMimeType = imageFile.type;
      }
      if (audioFile) {
        audioBase64 = await toBase64(audioFile);
        audioMimeType = audioFile.type;
      }

      // 2. Trigger Swarm API
      const result = await api.incidents.orchestrate(incident.id, {
        imageBase64,
        imageMimeType,
        audioBase64,
        audioMimeType,
        documentText: pdfText
      });

      // 3. Complete Swarm Runs
      setCompiledReport(result.report);
      
      // Load final logs
      const agents = await api.agents.list();
      const allLogs: any[] = [];
      agents.forEach(agent => {
        agent.logs?.forEach((l: any) => allLogs.push(l));
      });
      setTerminalLogs(allLogs.sort((a, b) => a.timestamp.localeCompare(b.timestamp)));

      // Trigger Confetti using dynamic import to prevent SSR issues
      const confetti = (await import('canvas-confetti')).default;
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    } catch (err: any) {
      console.error(err);
      setTerminalLogs(prev => [...prev, { timestamp: new Date().toISOString(), message: `CRITICAL EXCEPTION: Swarm compilation failed: ${err.message}`, type: 'error' }]);
    } finally {
      setIsRunning(false);
      setActiveAgent(null);
    }
  };

  return (
    <div className="pl-64 min-h-screen pb-12 bg-[#02040a]">
      {/* Page Header */}
      <header className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/20 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-slate-100 tracking-wider uppercase">EMERGENCY CONSOLE</h2>
          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-widest">Operator Swarm Deployment Interface</p>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Templates selector for easy hackathon run */}
        <div className="flex flex-wrap gap-2.5 items-center p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>Crisis Presets:</span>
          </span>
          <button 
            type="button" 
            onClick={() => applyTemplate('flood')}
            className="px-3.5 py-1.5 bg-sky-950/30 hover:bg-sky-950/50 border border-sky-500/20 hover:border-sky-500/50 rounded-lg text-xs font-bold text-sky-400 uppercase transition-all cursor-pointer"
          >
            🌊 Flood Inundation
          </button>
          <button 
            type="button" 
            onClick={() => applyTemplate('fire')}
            className="px-3.5 py-1.5 bg-orange-950/30 hover:bg-orange-950/50 border border-orange-500/20 hover:border-orange-500/50 rounded-lg text-xs font-bold text-orange-400 uppercase transition-all cursor-pointer"
          >
            🔥 Wildfire Outbreak
          </button>
          <button 
            type="button" 
            onClick={() => applyTemplate('earthquake')}
            className="px-3.5 py-1.5 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/20 hover:border-amber-500/50 rounded-lg text-xs font-bold text-amber-400 uppercase transition-all cursor-pointer"
          >
            🫨 Earthquake Tremors
          </button>
        </div>

        {/* Input Console & Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incident Input Panel */}
          <div className="glass-panel p-6 rounded-xl border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-slate-850 pb-2">
              Disaster Parameters Input
            </h3>

            <form onSubmit={handleLaunchSwarm} className="space-y-4 font-sans text-xs">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Crisis Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required
                  placeholder="e.g. Flood Inundation Area 4"
                  className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/80 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Incident Log Details</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required
                  rows={4}
                  placeholder="Describe crisis observations, victims, hazard levels, immediate needs..."
                  className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/80 transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Location Lat Lng Address */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Geo Address</label>
                  <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="SOMA district"
                    className="w-full px-3 py-2 bg-slate-950/70 border border-slate-850 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/80 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Latitude</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    value={lat} 
                    onChange={(e) => setLat(parseFloat(e.target.value))} 
                    className="w-full px-3 py-2 bg-slate-950/70 border border-slate-850 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Longitude</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    value={lng} 
                    onChange={(e) => setLng(parseFloat(e.target.value))} 
                    className="w-full px-3 py-2 bg-slate-950/70 border border-slate-850 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Attachments Section */}
              <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upload Supporting Intelligence</span>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  {/* Image Attachment */}
                  <label className={`border rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    imageFile ? 'border-indigo-500 bg-indigo-950/15 text-indigo-400' : 'border-slate-850 hover:bg-slate-900/40 text-slate-500 hover:text-slate-400'
                  }`}>
                    <FileImage className="w-4 h-4" />
                    <span>{imageFile ? 'Image Loaded' : 'Vision Feed'}</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="hidden" 
                    />
                  </label>

                  {/* Audio Attachment */}
                  <label className={`border rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    audioFile ? 'border-indigo-500 bg-indigo-950/15 text-indigo-400' : 'border-slate-850 hover:bg-slate-900/40 text-slate-500 hover:text-slate-400'
                  }`}>
                    <FileAudio className="w-4 h-4" />
                    <span>{audioFile ? 'Audio Loaded' : 'Voice Dispatch'}</span>
                    <input 
                      type="file" 
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="hidden" 
                    />
                  </label>

                  {/* PDF Simulation Attachment */}
                  <button 
                    type="button"
                    onClick={() => {
                      setPdfFileName('flood_response_sop_102.pdf');
                      setPdfText('FEMA SOP 102 Flood Water Rescue Rules: Defer to inflatable boat systems for depths above 0.5 meters. Critical transportations must prioritize regional emergency surgery facilities first. Evacuate families to higher ground.');
                    }}
                    className={`border rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      pdfText ? 'border-indigo-500 bg-indigo-950/15 text-indigo-400' : 'border-slate-850 hover:bg-slate-900/40 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>{pdfText ? 'PDF SOP Loaded' : 'Attach PDF SOP'}</span>
                  </button>
                </div>
                {pdfFileName && (
                  <p className="text-[9px] text-indigo-400 font-mono">Attached: {pdfFileName}</p>
                )}
              </div>

              {/* Submit button */}
              <button 
                type="submit"
                disabled={isRunning}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-800 to-indigo-800 hover:from-red-700 hover:to-indigo-700 disabled:from-indigo-950/60 disabled:to-slate-900/60 text-slate-100 font-extrabold tracking-widest text-xs uppercase cursor-pointer transition-all duration-300 shadow-2xl hover:shadow-indigo-500/20"
              >
                <Bot className="w-4 h-4 animate-bounce" />
                <span>{isRunning ? 'Swarming Cluster Computing...' : 'LAUNCH AEGIS MULTI-AGENT SWARM'}</span>
              </button>
            </form>
          </div>

          {/* Scrolling Swarm Terminal */}
          <div className="space-y-4">
            <AgentTerminal logs={terminalLogs} isRunning={isRunning} activeAgent={activeAgent} />
          </div>
        </div>

        {/* Final Report Output Section */}
        {compiledReport && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2">
              <Bot className="w-5 h-5 text-indigo-500 glow-text-cyan animate-pulse" />
              <span>AEGIS Compiled Swarm Action Plan Report</span>
            </h2>
            <IncidentReport report={compiledReport} incidentTitle={title} />
          </div>
        )}
      </div>
    </div>
  );
}
