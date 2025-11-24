
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage, Locale } from '../contexts/LanguageContext';
import type { AppMode } from '../types';

// Add SpeechRecognition types to the window object for TypeScript
declare global {
  interface Window { SpeechRecognition: typeof SpeechRecognition; webkitSpeechRecognition: typeof SpeechRecognition; }
  interface SpeechRecognitionAlternative { readonly transcript: string; readonly confidence: number; }
  interface SpeechRecognitionResult { readonly isFinal: boolean; readonly length: number; item(index: number): SpeechRecognitionAlternative;[index: number]: SpeechRecognitionAlternative; }
  interface SpeechRecognitionResultList { readonly length: number; item(index: number): SpeechRecognitionResult;[index: number]: SpeechRecognitionResult; }
  interface SpeechRecognitionEvent extends Event { readonly resultIndex: number; readonly results: SpeechRecognitionResultList; }
  interface SpeechRecognitionErrorEvent extends Event { readonly error: string; readonly message: string; }
  interface SpeechRecognition extends EventTarget {
    continuous: boolean; grammars: any; interimResults: boolean; lang: string; maxAlternatives: number;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null; onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null; onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null; onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null; onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null; onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null; abort(): void; start(): void; stop(): void;
  }
  var SpeechRecognition: { prototype: SpeechRecognition; new(): SpeechRecognition; };
  var webkitSpeechRecognition: { prototype: SpeechRecognition; new(): SpeechRecognition; };
}


interface SymptomInputProps {
  onSendMessage: (text: string) => void; // Removed file parameter
  isLoading: boolean;
  mode: AppMode;
}

const SymptomInput: React.FC<SymptomInputProps> = ({ onSendMessage, isLoading, mode }) => {
  const { t, locale } = useLanguage();
  const [text, setText] = useState('');
  // Removed all file-related state
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const prevIsRecording = useRef(isRecording);

  // Responsive placeholders - shorter for mobile
  const currentPlaceholder =
    mode === 'triage' ? "Describe your symptoms..." :
      mode === 'pharmacy' ? "Ask about medications..." :
        mode === 'precautions' ? "Get health prevention tips..." :
          "Ask MediBot anything...";

  // Removed auto-resize effect to prevent layout shifts
  // Textarea now has fixed height with scroll

  useEffect(() => {
    if (prevIsRecording.current && !isRecording) {
      textareaRef.current?.focus();
    }
    prevIsRecording.current = isRecording;
  }, [isRecording]);


  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Removed file handling functions

  const handleMicClick = () => {
    if (!isSpeechSupported) {
      alert("Your browser does not support voice recognition. Please try a different browser like Chrome or Safari.");
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionImpl();
    recognitionRef.current = recognition;
    const langMap: Record<Locale, string> = { 'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR' };
    recognition.lang = langMap[locale] || 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let newTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          newTranscript += event.results[i][0].transcript;
        }
      }
      if (newTranscript) {
        setText(prevText => (prevText.trim() ? prevText.trim() + ' ' : '') + newTranscript.trim());
      }
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };
    recognition.start();
    setIsRecording(true);
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) recognitionRef.current?.stop();
    if (text.trim()) {
      onSendMessage(text); // Removed file parameter
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ height: '18px', textAlign: 'center' }}>
        {isRecording && (
          <p style={{ fontSize: '0.75rem', color: '#0ea5e9', animation: 'subtlePulse 2.2s infinite' }}>{t('listeningLabel')}</p>
        )}
      </div>
      {/* Removed file preview */}
      <div className="chat-input-shell chat-compact">
        <div className="chat-input-surface" style={{ flexWrap: 'wrap' }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder={currentPlaceholder}
            className="chat-textarea"
            rows={1}
            disabled={isLoading}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
          />
          {/* Removed file upload input and button */}
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading || !isSpeechSupported}
            className={`icon-btn ${isRecording ? 'recording' : ''}`}
            aria-label={isRecording ? t('stopRecordingLabel') : t('recordSymptomsLabel')}
          >
            {isRecording ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><path d="M12 19v3" /><path d="M8 22h8" /></svg>
            )}
          </button>
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="send-btn"
            aria-label={t('sendLabel')}
          >
            {isLoading ? (
              <div className="spinner" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" strokeWidth="2.1" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SymptomInput;
