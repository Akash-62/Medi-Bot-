import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, AppMode } from '../types';
import SymptomInput from './SymptomInput';
import ChatMessageBubble from './ChatMessageBubble';
import { getTriageRecommendation, getMedicationInfo, getPrecautionsInfo, getChatResponse } from '../services/llmService';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatInterfaceProps {
    mode: AppMode;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ mode }) => {
  const { t, locale } = useLanguage();

  const getInitialMessages = (currentMode: AppMode): ChatMessage[] => [
    {
      id: `initial-${currentMode}-1`,
      sender: 'ai',
      text: t(`${currentMode}InitialMessage1`),
    },
    {
      id: `initial-${currentMode}-2`,
      sender: 'ai',
      text: t(`${currentMode}InitialMessage2`),
      suggestions: t(`${currentMode}Suggestions`),
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages(mode));
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(getInitialMessages(mode));
  }, [mode, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleClearChat = () => {
    setMessages(getInitialMessages(mode));
  };

  const isGreeting = (text: string): boolean => {
    const lowerText = text.trim().toLowerCase();
    
    // Exact matches for very short messages
    const exactGreetings = ['hi', 'hello', 'hey', 'yo', 'hii', 'hiii', 'heya', 'sup', 'wassup', 
                           'good morning', 'good afternoon', 'good evening', 'morning', 'evening',
                           'hola', 'bonjour', 'salut', 'namaste', 'ola'];
    const cleaned = lowerText.replace(/[.!?,;]/g, '').trim();
    
    if (exactGreetings.includes(cleaned)) return true;
    
    // Partial matches for longer conversational messages
    const greetingPatterns = [
      /^hi\s/i, /^hello\s/i, /^hey\s/i, /^yo\s/i,
      /^good\s+(morning|afternoon|evening)/i,
      /how\s+are\s+you/i,
      /what'?s\s+up/i,
      /nice\s+to\s+meet/i,
      /how\s+do\s+you\s+do/i,
      /greetings/i,
      /^hii+\s/i, // hiii there, hiiii
    ];
    
    return greetingPatterns.some(pattern => pattern.test(lowerText));
  };

  const isFarewell = (text: string): boolean => {
    const lower = text.trim().toLowerCase().replace(/[.!?]/g, '');
    const farewells = ['bye', 'goodbye', 'see you', 'see ya', 'cya', 'bye bye', 'take care', 
                       'good night', 'goodnight', 'night', 'ttyl', 'later', 'peace', 'adios'];
    if (farewells.includes(lower)) return true;
    
    const farewellPatterns = [/bye+/i, /see\s+you/i, /good\s*night/i, /take\s+care/i];
    return farewellPatterns.some(pattern => pattern.test(lower));
  };

  const isThanks = (text: string): boolean => {
    const lower = text.trim().toLowerCase().replace(/[.!?]/g, '');
    const thanks = ['thanks', 'thank you', 'thankyou', 'thx', 'thank u', 'ty', 'tq', 
                   'thanks a lot', 'thank you so much', 'appreciate it', 'much appreciated'];
    if (thanks.includes(lower)) return true;
    
    const thanksPatterns = [/thank/i, /appreciate/i, /grateful/i];
    return thanksPatterns.some(pattern => pattern.test(lower));
  };

  const isCasualQuestion = (text: string): boolean => {
    const lower = text.trim().toLowerCase();
    const casualPatterns = [
      /^who\s+are\s+you/i,
      /^what\s+are\s+you/i,
      /^what\s+can\s+you\s+do/i,
      /^how\s+can\s+you\s+help/i,
      /^tell\s+me\s+about\s+(yourself|you)/i,
      /^are\s+you\s+(a\s+)?((real\s+)?doctor|bot|ai|robot)/i,
      /^what('?s|\s+is)\s+your\s+name/i,
    ];
    
    return casualPatterns.some(pattern => pattern.test(lower));
  };

  const handleSendMessage = async (text: string, file?: File) => {
    if (!text.trim() && !file) return;

    setIsLoading(true);

    let imagePreview: string | undefined = undefined;
    let imagePayload: { mimeType: string; data: string } | undefined = undefined;

    if (file) {
      imagePreview = URL.createObjectURL(file);
      const reader = new FileReader();
      const promise = new Promise<{ mimeType: string; data: string }>((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve({ mimeType: file.type, data: base64String });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      imagePayload = await promise;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      imagePreview: imagePreview,
    };
    
    const updatedMessages = messages.map(m => ({ ...m, suggestions: undefined }));
    setMessages([...updatedMessages, userMessage]);


    const typingIndicatorId = `${Date.now()}-typing`;
    setMessages(prev => [...prev, { id: typingIndicatorId, sender: 'ai', isTyping: true }]);

    // Handle casual conversations (greetings, farewells, thanks, general questions)
    if (!file && (isGreeting(text) || isFarewell(text) || isThanks(text) || isCasualQuestion(text))) {
        // Use Groq AI for natural conversational responses
        try {
          const aiReply = await getChatResponse(text, locale);
          
          const aiMessage: ChatMessage = {
            id: `${Date.now()}-ai`,
            sender: 'ai',
            text: aiReply,
          };
          setMessages(prev => prev.filter(m => m.id !== typingIndicatorId));
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          console.error('Chat response error:', error);
          // Fallback to simple responses
          const greetingResponses = [
            'Hi there! 👋 How can I help you with your health today?',
            'Hello! 😊 Ready to assist—what would you like to know?',
            'Hey! 🙌 Ask me anything about symptoms, medicines, or precautions.',
            'Hi! 🩺 What would you like to explore today?'
          ];
          const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
          
          const aiMessage: ChatMessage = {
            id: `${Date.now()}-ai`,
            sender: 'ai',
            text: pick(greetingResponses),
          };
          setMessages(prev => prev.filter(m => m.id !== typingIndicatorId));
          setMessages(prev => [...prev, aiMessage]);
        }
    } else {
        let aiMessage: ChatMessage;

        switch (mode) {
            case 'triage':
                const triageResult = await getTriageRecommendation(text, locale, imagePayload);
                aiMessage = { id: `${Date.now()}-ai`, sender: 'ai', triageResult };
                break;
            case 'pharmacy':
                const medicationResult = await getMedicationInfo(text, locale, imagePayload);
                aiMessage = { id: `${Date.now()}-ai`, sender: 'ai', medicationResult };
                break;
            case 'precautions':
                const precautionResult = await getPrecautionsInfo(text, locale);
                aiMessage = { id: `${Date.now()}-ai`, sender: 'ai', precautionResult };
                break;
            default:
                 aiMessage = { id: `${Date.now()}-ai`, sender: 'ai', text: "Error: Invalid mode selected." };
        }
        
        setMessages(prev => prev.filter(m => m.id !== typingIndicatorId));
        setMessages(prev => [...prev, aiMessage]);
    }

    setIsLoading(false);
  };

  const handleSuggestionClick = (text: string) => {
    handleSendMessage(text);
  };
  
  const canClear = messages.some(m => !m.id.startsWith('initial'));

  return (
    <div className="futuristic-chat-container flex flex-col h-full max-w-7xl mx-auto">
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 smooth-scroll hide-scrollbar">
        {messages.map((msg) => (
          <ChatMessageBubble 
            key={msg.id} 
            message={msg}
            onSuggestionClick={handleSuggestionClick} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="futuristic-input-zone p-3 sm:p-4 md:p-6">
        {canClear && (
          <div className="flex justify-end mb-2">
            <button
              onClick={handleClearChat}
              className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-cyan-300 bg-slate-800/40 hover:bg-cyan-900/30 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 backdrop-blur-sm transition-all duration-200 transform hover:scale-105"
              aria-label={t('clearChat')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">{t('clearChat')}</span>
            </button>
          </div>
        )}
        <SymptomInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading}
          mode={mode}
        />
      </div>
    </div>
  );
};

export default ChatInterface;