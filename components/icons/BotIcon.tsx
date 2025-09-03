import React from 'react';

const BotIcon: React.FC = () => (
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500/50 to-cyan-400/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-cyan-300/20 animate-subtlePulse">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-200" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M12 18h.01" />
      <path d="M15 15h.01" />
      <path d="M17.5 12.5h.01" />
      <path d="M15 9h.01" />
      <path d="M12 6h.01" />
      <path d="M9 9h.01" />
      <path d="M6.5 12.5h.01" />
      <path d="M9 15h.01" />
      <path d="M16 18a4 4 0 0 0 -4 -4" />
      <path d="M12 13a4 4 0 0 0 -4 -4" />
      <path d="M8 18a4 4 0 0 1 4 -4" />
      <path d="M12 13a4 4 0 0 1 4 -4" />
      <path d="M16 6a4 4 0 0 0 -4 4" />
      <path d="M12 9a4 4 0 0 0 -4 4" />
      <path d="M8 6a4 4 0 0 1 4 4" />
      <path d="M12 9a4 4 0 0 1 4 4" />
    </svg>
  </div>
);

export default BotIcon;