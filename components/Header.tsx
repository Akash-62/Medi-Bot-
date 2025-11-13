import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { AppMode } from '../types';

interface HeaderProps {
    mode: AppMode;
    setMode: (mode: AppMode) => void;
}

const Header: React.FC<HeaderProps> = ({ mode, setMode }) => {
  const { t } = useLanguage();
  
  const modeOptions: { key: AppMode, label: string, icon: string }[] = [
      { key: 'triage', label: t('modeTriage'), icon: '🩺' },
      { key: 'pharmacy', label: t('modePharmacy'), icon: '💊' },
      { key: 'precautions', label: t('modePrecautions'), icon: '🛡️' }
  ];

  return (
    <header className="flex items-center justify-between px-6 py-3 sticky top-0 z-20 bg-slate-950/50 backdrop-blur-2xl border-b border-cyan-500/20 shadow-lg shadow-cyan-500/10">
      {/* Premium Logo with Medical Pulse */}
      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 flex-shrink-0">
          {/* Outer rotating ring with gradient */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/40 to-blue-600/30 border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-spin-slow"></div>
          {/* Inner core with heartbeat icon */}
          <div className="absolute inset-0.5 rounded-xl bg-slate-900/90 backdrop-blur-xl overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-60 bg-[conic-gradient(from_0deg,rgba(14,165,233,.35),rgba(6,182,212,.15),rgba(14,165,233,.35))] animate-fluid-mask"></div>
            <svg viewBox="0 0 64 64" className="w-7 h-7 relative z-10">
              <defs>
                <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="60%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
                <filter id="glow-effect" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Medical heartbeat line */}
              <path d="M14 34h8l3-8 4 16 4-12 3 4h12" 
                stroke="url(#pulse-gradient)" 
                strokeWidth="3.5" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                filter="url(#glow-effect)"
                className="drop-shadow-lg" 
              />
              {/* Circular pulse ring */}
              <circle cx="32" cy="32" r="22" 
                stroke="url(#pulse-gradient)" 
                strokeWidth="2.5" 
                fill="none" 
                opacity="0.4"
                filter="url(#glow-effect)"
              />
            </svg>
          </div>
          {/* Ambient pulsing glow */}
          <div className="absolute -inset-1 rounded-2xl blur-md bg-gradient-to-br from-cyan-500/40 via-sky-400/30 to-cyan-600/40 animate-pulse-fast pointer-events-none"></div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-[22px] font-bold bg-gradient-to-r from-cyan-300 via-sky-200 to-cyan-300 bg-clip-text text-transparent tracking-tight leading-tight">
            MediBot
          </h1>
          <span className="text-[10px] text-cyan-400/70 tracking-wider font-medium">AI Health Assistant</span>
        </div>
      </div>

      {/* Elegant Mode Selector - Centered for laptop screens */}
      <div className="flex items-center gap-2 bg-slate-800/70 backdrop-blur-xl rounded-2xl px-2 py-1.5 border border-slate-700/60 shadow-lg">
          {modeOptions.map(option => (
              <button
                  key={option.key}
                  onClick={() => setMode(option.key)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    mode === option.key 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 scale-105' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
                  }`}
              >
                  <span className="text-base">{option.icon}</span>
                  <span className="hidden sm:inline">{option.label}</span>
              </button>
          ))}
      </div>
    </header>
  );
};

export default Header;