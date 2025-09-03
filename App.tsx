
import React, { useState } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import { LanguageProvider } from './contexts/LanguageContext';
import type { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('triage');

  return (
    <LanguageProvider>
      <div className="flex flex-col h-screen max-h-dvh font-sans">
        <Header mode={mode} setMode={setMode} />
        <main className="flex-1 overflow-hidden w-full px-2 sm:px-4 md:px-6 lg:px-0 mx-auto max-w-4xl pb-[env(safe-area-inset-bottom)]">
          <div className="h-full flex flex-col">
            <ChatInterface mode={mode} />
          </div>
        </main>
      </div>
    </LanguageProvider>
  );
};

// FIX: An export assignment cannot have modifiers. Removed duplicate 'export'.
export default App;
