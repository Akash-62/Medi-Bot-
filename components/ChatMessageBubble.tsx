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
        <div className="px-4 py-3 rounded-2xl bg-slate-800/60 backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-1.5">
            <span className="w-2 h-2 bg-sky-400/80 rounded-full typing-dot" style={{ animationDelay: '-0.3s' }}></span>
            <span className="w-2 h-2 bg-sky-400/80 rounded-full typing-dot" style={{ animationDelay: '-0.15s' }}></span>
            <span className="w-2 h-2 bg-sky-400/80 rounded-full typing-dot"></span>
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
      <div className={`p-0.5 rounded-2xl max-w-[80vw] sm:max-w-[72%] md:max-w-[65%] ${isUser ? 'bg-gradient-to-br from-sky-600 to-cyan-500' : 'bg-gradient-to-br from-slate-700 to-slate-800'}`}>
         <div className={`p-3 sm:p-4 rounded-[15px] break-words ${isUser ? 'text-white' : 'bg-[#1e293b] text-slate-200'}`}>
            {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
            {message.imagePreview && (
              <div className="my-2">
                <img src={message.imagePreview} alt="User upload" className="rounded-lg max-w-xs" />
              </div>
            )}
            {message.triageResult && <TriageResult result={message.triageResult} />}
            {message.medicationResult && <MedicationResult result={message.medicationResult} />}
            {message.precautionResult && <PrecautionResult result={message.precautionResult} />}
            {message.suggestions && onSuggestionClick && (
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestionClick(suggestion.text)}
                    className="px-3 py-1.5 text-sm text-sky-200 bg-sky-800/40 rounded-full hover:bg-sky-700/60 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
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