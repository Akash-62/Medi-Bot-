import React from 'react';
import type { ChatMessage } from '../types';
import TriageResult from './TriageResult';
import MedicationResult from './MedicationResult';
import PrecautionResult from './PrecautionResult';
import UserIcon from './icons/UserIcon';
import BotIcon from './icons/BotIcon';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onSuggestionClick?: (text: string) => void;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, onSuggestionClick }) => {
  const isUser = message.sender === 'user';

  if (message.isTyping) {
    return (
      <div className="flex items-end space-x-3 max-w-2xl animate-fadeInUp">
        <BotIcon />
        <div className="px-5 py-3 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700/30">
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1s' }}></span>
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1s' }}></span>
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1s' }}></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} ${isUser ? 'ml-auto' : 'mr-auto'} animate-fadeInUp`}>
      <div className="flex-shrink-0 self-end">
        {isUser ? <UserIcon /> : <BotIcon />}
      </div>
      <div className={`rounded-2xl max-w-[85vw] sm:max-w-[75%] md:max-w-[70%] shadow-lg ${isUser ? 'bg-gradient-to-br from-cyan-600 to-blue-600' : 'bg-slate-800/60 backdrop-blur-md border border-slate-700/50'}`}>
         <div className={`p-4 rounded-2xl ${isUser ? 'text-white' : 'text-slate-100'}`}>
            {message.text && <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>}
            {message.imagePreview && (
              <div className="my-3">
                <img src={message.imagePreview} alt="User upload" className="rounded-xl max-w-xs border border-white/20" />
              </div>
            )}
            {message.triageResult && <TriageResult result={message.triageResult} />}
            {message.medicationResult && <MedicationResult result={message.medicationResult} />}
            {message.precautionResult && <PrecautionResult result={message.precautionResult} />}
            {message.suggestions && onSuggestionClick && (
              <div className="mt-4 pt-4 border-t border-slate-600/40 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestionClick(suggestion.text)}
                    className="px-3.5 py-2 text-sm text-cyan-100 bg-cyan-900/30 rounded-xl hover:bg-cyan-800/50 backdrop-blur-sm border border-cyan-700/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageBubble;