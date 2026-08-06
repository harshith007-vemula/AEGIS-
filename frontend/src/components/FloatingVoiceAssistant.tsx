'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Mic, MicOff, Volume2, ShieldAlert } from 'lucide-react';

export default function FloatingVoiceAssistant() {
  const pathname = usePathname();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showCapsule, setShowCapsule] = useState(false);

  useEffect(() => {
    // Inject bouncy bar keyframes
    if (!document.getElementById('voice-bars-animation')) {
      const style = document.createElement('style');
      style.id = 'voice-bars-animation';
      style.innerHTML = `
        @keyframes bounce-bar {
          0%, 100% { height: 6px; }
          50% { height: 24px; }
        }
        .animate-bar-1 { animation: bounce-bar 0.6s infinite ease-in-out; }
        .animate-bar-2 { animation: bounce-bar 0.8s infinite ease-in-out 0.1s; }
        .animate-bar-3 { animation: bounce-bar 0.5s infinite ease-in-out 0.2s; }
        .animate-bar-4 { animation: bounce-bar 0.7s infinite ease-in-out 0.3s; }
        .animate-bar-5 { animation: bounce-bar 0.6s infinite ease-in-out 0.4s; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (pathname === '/' || pathname.includes('/auth')) return null;

  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setTranscript('Establishing connection to Aegis Core Satellite network...');
    setShowCapsule(true);

    // Step 1: Initial Link
    setTimeout(() => {
      setTranscript('Listening to voice report...');
    }, 1500);

    // Step 2: Receive Distress
    setTimeout(() => {
      setTranscript('"Severe flooding active. Families trapped on upper floor near 4th and King..."');
    }, 3500);

    // Step 3: Parse and Autocomplete
    setTimeout(() => {
      setTranscript('Voice parsed. Formulating dispatch logs...');
      
      // Speak back response
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel(); // stop current speech
        const utterance = new SpeechSynthesisUtterance(
          "Aegis Voice Command recognized. Flooding incident registered. Tactical rescue plans formulated. Launching swarm."
        );
        utterance.rate = 1.0;
        utterance.pitch = 0.95;
        window.speechSynthesis.speak(utterance);
      }

      // Dispatch event to auto-fill the Emergency Console page
      window.dispatchEvent(new CustomEvent('aegis-voice-input', {
        detail: {
          title: 'SOMA Inundation & Stranded Citizens (Voice Intake)',
          description: 'Emergency Voice Dispatch Intake: Severe flooding reported. Multiple citizens stranded on roofs. Water levels rising rapidly. Medical evacuation and inflatable boat deployment recommended immediately.',
          address: '4th & King St, San Francisco, CA',
          lat: 37.7785,
          lng: -122.3965
        }
      }));
    }, 6000);

    // Step 4: Disconnect
    setTimeout(() => {
      setIsListening(false);
      setShowCapsule(false);
    }, 9500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Voice Status Capsule */}
      {showCapsule && (
        <div className="glass-panel p-4 rounded-xl border-indigo-500/30 flex items-center gap-4 bg-slate-950/90 shadow-2xl max-w-[280px] font-sans">
          <div className="flex gap-1 items-center justify-center h-8 flex-shrink-0">
            <div className="w-1 bg-indigo-500 rounded animate-bar-1" style={{ height: '12px' }}></div>
            <div className="w-1 bg-indigo-400 rounded animate-bar-2" style={{ height: '8px' }}></div>
            <div className="w-1 bg-cyan-400 rounded animate-bar-3" style={{ height: '16px' }}></div>
            <div className="w-1 bg-indigo-400 rounded animate-bar-4" style={{ height: '10px' }}></div>
            <div className="w-1 bg-indigo-500 rounded animate-bar-5" style={{ height: '14px' }}></div>
          </div>
          <div>
            <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest block flex items-center gap-1">
              <Volume2 className="w-3 h-3 animate-pulse" />
              <span>Voice Intake Active</span>
            </span>
            <p className="text-[10px] text-slate-300 font-medium leading-relaxed mt-1">{transcript}</p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={handleToggleVoice}
        className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 shadow-2xl cursor-pointer hover:scale-110 active:scale-95 ${
          isListening 
            ? 'bg-red-950/80 border-red-500/40 text-red-500 animate-pulse' 
            : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-400 hover:border-indigo-400 hover:shadow-indigo-500/25'
        }`}
      >
        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 animate-pulse" />}
      </button>
    </div>
  );
}
