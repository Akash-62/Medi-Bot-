
import React, { useState } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import { LanguageProvider } from './contexts/LanguageContext';
import type { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(() => {
    // Persist mode across refreshes
    const savedMode = localStorage.getItem('medibot-mode');
    return (savedMode as AppMode) || 'triage';
  });

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    localStorage.setItem('medibot-mode', newMode);
  };

  return (
    <LanguageProvider>
      <div className="app-shell flex flex-col font-sans overflow-hidden h-screen">
        <Header mode={mode} setMode={handleModeChange} />
        <main className="flex-1 overflow-hidden w-full">
          <div className="h-full flex flex-col">
            {/* FIX: Key forces clean remount on mode change to prevent state leakage */}
            <ChatInterface key={mode} mode={mode} />
          </div>
        </main>
      </div>
    </LanguageProvider>
  );
};

// FIX: An export assignment cannot have modifiers. Removed duplicate 'export'.
export default App;
