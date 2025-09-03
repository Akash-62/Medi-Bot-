import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, AppMode } from '../types';
import SymptomInput from './SymptomInput';
import ChatMessageBubble from './ChatMessageBubble';
import { getTriageRecommendation, getMedicationInfo, getPrecautionsInfo } from '../services/geminiService';
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
    const greetings = ['hi', 'hello', 'hey', 'yo', 'greetings', 'good morning', 'good afternoon', 'good evening', 'hola', 'bonjour', 'salut'];
    return greetings.includes(lowerText.replace(/[.!?]/g, ''));
  };

  const isFarewell = (text: string): boolean => {
    const lower = text.trim().toLowerCase().replace(/[.!?]/g, '');
    const farewells = ['bye', 'goodbye', 'see you', 'see ya', 'cya', 'bye bye', 'take care'];
    return farewells.includes(lower);
  };

  const isThanks = (text: string): boolean => {
    const lower = text.trim().toLowerCase().replace(/[.!?]/g, '');
    const thanks = ['thanks', 'thank you', 'thankyou', 'thx', 'thank u'];
    return thanks.includes(lower);
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

    if (!file && (isGreeting(text) || isFarewell(text) || isThanks(text))) {
        await new Promise(resolve => setTimeout(resolve, 600));
        const lower = text.trim().toLowerCase();

        const greetingResponses = [
          'Hi there! 👋 How can I help you with your health today?',
          'Hello! 😊 Ready to assist—what would you like to know?',
          'Hey! 🙌 Ask me anything about symptoms, medicines, or precautions.',
          'Hi! 🩺 What would you like to explore today?'
        ];
        const farewellResponses = [
          'Take care! 👋 Stay healthy and come back anytime.',
          'Goodbye! 🌟 Wishing you good health.',
          'See you soon! 😊 Stay well.',
          'Bye! 🫶 Remember, your health matters.'
        ];
        const thanksResponses = [
          "You're welcome! 😊 Happy to help.",
          'Anytime! 🙏 Feel free to ask more.',
          'Glad I could help! 🌟',
          'You got it! 🤝 Let me know if you need more info.'
        ];

        const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

        let reply: string;
        const thank = isThanks(text);
        const bye = isFarewell(text);
        const greet = isGreeting(text);
        if (thank && bye) {
          reply = pick(thanksResponses) + ' ' + pick(farewellResponses);
        } else if (greet && thank) {
          reply = pick(greetingResponses) + ' ' + pick(thanksResponses);
        } else if (greet && bye) {
          reply = pick(greetingResponses) + ' ' + pick(farewellResponses);
        } else if (greet) {
          reply = pick(greetingResponses);
        } else if (bye) {
          reply = pick(farewellResponses);
        } else if (thank) {
          reply = pick(thanksResponses);
        } else {
          reply = t('greetingResponse');
        }

        const aiMessage: ChatMessage = {
          id: `${Date.now()}-ai`,
          sender: 'ai',
          text: reply,
        };
        setMessages(prev => prev.filter(m => m.id !== typingIndicatorId));
        setMessages(prev => [...prev, aiMessage]);
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
    <div className="flex flex-col h-full bg-slate-900/30 backdrop-blur-2xl rounded-t-2xl border border-t-white/20 border-x-white/20 border-b-0">
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-5 sm:space-y-6 smooth-scroll">
        {messages.map((msg) => (
          <ChatMessageBubble 
            key={msg.id} 
            message={msg}
            onSuggestionClick={handleSuggestionClick} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
  <div className="p-3 sm:p-4 md:p-6 border-t border-white/20 bg-slate-950/20 backdrop-blur-sm">
        <div className="flex justify-end mb-2">
          <button
            onClick={handleClearChat}
            disabled={!canClear}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
            aria-label={t('clearChat')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>{t('clearChat')}</span>
          </button>
        </div>
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