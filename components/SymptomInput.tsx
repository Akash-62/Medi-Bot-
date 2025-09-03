
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage, Locale } from '../contexts/LanguageContext';
import type { AppMode } from '../types';

// Add SpeechRecognition types to the window object for TypeScript
declare global {
  interface Window { SpeechRecognition: typeof SpeechRecognition; webkitSpeechRecognition: typeof SpeechRecognition; }
  interface SpeechRecognitionAlternative { readonly transcript: string; readonly confidence: number; }
  interface SpeechRecognitionResult { readonly isFinal: boolean; readonly length: number; item(index: number): SpeechRecognitionAlternative; [index: number]: SpeechRecognitionAlternative; }
  interface SpeechRecognitionResultList { readonly length: number; item(index: number): SpeechRecognitionResult; [index: number]: SpeechRecognitionResult; }
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
  onSendMessage: (text: string, file?: File) => void;
  isLoading: boolean;
  mode: AppMode;
}

const SymptomInput: React.FC<SymptomInputProps> = ({ onSendMessage, isLoading, mode }) => {
  const { t, locale } = useLanguage();
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const prevIsRecording = useRef(isRecording);

  const placeholderSuggestions = useMemo(() => {
    switch (mode) {
      case 'triage':
        return [
          "e.g., 'I have a headache and a fever...'",
          "e.g., 'My child has a rash on their arm...'",
          "e.g., 'I'm feeling short of breath after walking...'",
          "e.g., 'Upload a photo of a prescription to check for interactions...'",
          "e.g., 'I have a sharp pain in my stomach...'"
        ];
      case 'pharmacy':
        return [
          "e.g., 'What is Metformin used for?'",
          "e.g., 'Identify this pill... (then upload an image)'",
          "e.g., 'What are the side effects of Ibuprofen?'",
          "e.g., 'Can I take Tylenol with this prescription?'",
          "e.g., 'How does Lipitor work?'"
        ];
      case 'precautions':
        return [
          "e.g., 'Precautions for Diabetes'",
          "e.g., 'How can I prevent the flu?'",
          "e.g., 'What are the risks of high blood pressure?'",
          "e.g., 'Best practices for avoiding a common cold'",
          "e.g., 'Lifestyle changes for a healthy heart'"
        ];
      default:
        return [""];
    }
  }, [mode]);

  const [placeholder, setPlaceholder] = useState(placeholderSuggestions[0]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prevIndex => (prevIndex + 1) % placeholderSuggestions.length);
    }, 3000); // Change suggestion every 3 seconds
    return () => clearInterval(interval);
  }, [placeholderSuggestions.length]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPlaceholder(placeholderSuggestions[placeholderIndex]);
    }, 150); // Stagger the update for a fade effect
    return () => clearTimeout(timeout);
  }, [placeholderIndex, placeholderSuggestions]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);

  useEffect(() => {
    if (prevIsRecording.current && !isRecording) {
        textareaRef.current?.focus();
    }
    prevIsRecording.current = isRecording;
  }, [isRecording]);


  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    if (text.trim() || file) {
      onSendMessage(text, file || undefined);
      setText('');
      handleRemoveFile();
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
      <div style={{height:'18px',textAlign:'center'}}>
        {isRecording && (
          <p style={{fontSize:'0.75rem',color:'#0ea5e9',animation:'subtlePulse 2.2s infinite'}}>{t('listeningLabel')}</p>
        )}
      </div>
      {filePreview && (
        <div style={{position:'relative',width:'112px',height:'112px',borderRadius:'14px',overflow:'hidden',border:'2px solid rgba(51,65,85,.8)'}}>
          <img src={filePreview} alt="Upload preview" style={{width:'100%',height:'100%',objectFit:'cover'}} />
          <button
            type="button" onClick={handleRemoveFile}
            style={{position:'absolute',top:'4px',right:'4px',background:'rgba(0,0,0,.55)',color:'#fff',border:'none',borderRadius:'50%',padding:'4px',cursor:'pointer'}}
            aria-label={t('removeImageLabel')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z"/><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}
      <div className="chat-input-shell">
        <div className="chat-input-surface" style={{flexWrap:'wrap'}}>
          <div className="placeholder-layer">
            <span className="placeholder-rotator" key={placeholderIndex}>{placeholder}</span>
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder={placeholder}
            className="chat-textarea"
            rows={1}
            disabled={isLoading}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
          />
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{display:'none'}} id="file-upload" />
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading || !isSpeechSupported}
            className={`icon-btn ${isRecording ? 'recording' : ''}`}
            aria-label={isRecording ? t('stopRecordingLabel') : t('recordSymptomsLabel')}
          >
            {isRecording ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><path d="M12 19v3" /><path d="M8 22h8" /></svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="icon-btn"
            aria-label={t('uploadLabel')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32" /><path d="M8.55 18.31l-.01.01" /><path d="M13.54 8.37l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" /></svg>
          </button>
          <button
            type="submit"
            disabled={isLoading || (!text.trim() && !file)}
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
