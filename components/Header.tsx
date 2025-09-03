import React, { useState, useEffect } from 'react';
import { useLanguage, supportedLanguages, Locale } from '../contexts/LanguageContext';
import type { AppMode } from '../types';

interface HeaderProps {
    mode: AppMode;
    setMode: (mode: AppMode) => void;
}

const Header: React.FC<HeaderProps> = ({ mode, setMode }) => {
  const { t, setLocale, locale } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Rotating subtitle lines
  const subtitles = [
    'Your Personal Health Guide',
    'AI-Powered Medical Insights',
    'Trusted Pharmacy Advice',
    'Created by Akash S'
  ];
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'fade-in'|'fade-out'>('fade-in');

  useEffect(() => {
    const cycle = setInterval(() => {
      setFadeState('fade-out');
      setTimeout(() => {
        setSubtitleIndex(prev => (prev + 1) % subtitles.length);
        setFadeState('fade-in');
      }, 420); // match fade duration
    }, 3200);
    return () => clearInterval(cycle);
  }, []);
  
  const modeOptions: { key: AppMode, label: string }[] = [
      { key: 'triage', label: t('modeTriage') },
      { key: 'pharmacy', label: t('modePharmacy') },
      { key: 'precautions', label: t('modePrecautions') }
  ];

  return (
    <header className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 sticky top-0 z-20 bg-slate-950/30 backdrop-blur-xl border-b border-white/10">
      {/* Logo and Title */}
      <div className="flex items-center space-x-3 self-start md:self-center">
        <div className="relative w-12 h-12">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_30%_25%,rgba(56,189,248,.5),rgba(2,6,23,0)_65%)] border border-cyan-300/40 shadow-[0_0_0_1px_rgba(14,165,233,0.35),0_4px_18px_-4px_rgba(56,189,248,.55)] animate-spin-slow"></div>
          {/* Inner core */}
            <div className="absolute inset-1 rounded-2xl bg-slate-900/70 backdrop-blur-xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-60 bg-[conic-gradient(from_0deg,rgba(14,165,233,.35),rgba(6,182,212,.15),rgba(14,165,233,.35))] animate-fluid-mask"></div>
              <svg viewBox="0 0 64 64" className="w-8 h-8 relative z-10">
                <defs>
                  <linearGradient id="mb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="60%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="32" cy="32" r="24" stroke="url(#mb-grad)" strokeWidth="3" fill="none" filter="url(#glow)" />
                <path d="M14 34h8l3-8 4 16 4-12 3 4h12" stroke="url(#mb-grad)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          {/* Ambient glow */}
          <div className="absolute -inset-1 rounded-[22px] blur-md bg-gradient-to-br from-sky-500/30 via-cyan-400/20 to-sky-600/25 animate-pulse-fast"></div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-300 via-cyan-200 to-sky-200 text-transparent bg-clip-text tracking-wide">
            {t('headerTitle')}
          </h1>
          <div className="h-5 mt-0.5 relative w-[210px] sm:w-[250px] md:w-[290px] select-none">
            <span key={subtitleIndex} className={`absolute inset-0 text-[11px] tracking-wide text-slate-400/85 transition-opacity duration-400 ease-out ${fadeState === 'fade-in' ? 'opacity-100' : 'opacity-0'}`}>{subtitles[subtitleIndex]}</span>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="p-1 bg-slate-800/50 rounded-lg flex items-center space-x-1 border border-slate-700/80">
          {modeOptions.map(option => (
              <button
                  key={option.key}
                  onClick={() => setMode(option.key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ease-in-out ${mode === option.key ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700/50'}`}
              >
                  {option.label}
              </button>
          ))}
      </div>


      {/* Language Selector */}
      <div className="relative self-end md:self-center">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all duration-300 ease-in-out border border-slate-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" /><path d="M12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414zM10 4a1 1 0 100 2 1 1 0 000-2z" /></svg>
          <span>{supportedLanguages[locale]}</span>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-md shadow-lg py-1 z-30">
            {(Object.keys(supportedLanguages) as Locale[]).map((langCode) => (
              <button
                key={langCode}
                onClick={() => {
                  setLocale(langCode);
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-sky-600 hover:text-white transition-colors"
              >
                {supportedLanguages[langCode]}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;