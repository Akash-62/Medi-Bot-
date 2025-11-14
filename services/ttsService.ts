/**
 * Text-to-Speech Service for Indian Languages
 * 
 * Primary: ResponsiveVoice API (free tier: 5000 requests/day)
 * Fallback: Gemini + Browser TTS (with translation for better accuracy)
 * 
 * Supports: Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, etc.
 */

import { translateAndSpeak, cancelGeminiSpeech, isGeminiTTSAvailable } from './geminiTTSService';
import type { GeminiTTSLanguage } from './geminiTTSService';

export type SupportedTTSLanguage = 'en-US' | 'hi-IN' | 'ta-IN' | 'te-IN' | 'ml-IN' | 'kn-IN' | 'es-ES' | 'fr-FR';

interface ResponsiveVoiceMapping {
  [key: string]: string;
}

// ResponsiveVoice voice names for different languages
const RESPONSIVE_VOICE_MAP: ResponsiveVoiceMapping = {
  'en-US': 'US English Female',
  'hi-IN': 'Hindi Female',
  'ta-IN': 'Tamil Female',
  'te-IN': 'Telugu Female', 
  'ml-IN': 'Malayalam Female',
  'kn-IN': 'Hindi Female', // Fallback: ResponsiveVoice doesn't have Kannada, use Hindi
  'es-ES': 'Spanish Female',
  'fr-FR': 'French Female'
};

/**
 * Initialize ResponsiveVoice (loaded from CDN in index.html)
 */
const initResponsiveVoice = (): boolean => {
  return typeof (window as any).responsiveVoice !== 'undefined';
};

/**
 * Speak text using ResponsiveVoice API (supports Indian languages)
 * Falls back to Gemini + Browser TTS if ResponsiveVoice fails
 */
export const speakWithResponsiveVoice = (
  text: string, 
  langCode: SupportedTTSLanguage,
  onEnd?: () => void,
  onError?: (error: string) => void
): void => {
  if (!initResponsiveVoice()) {
    console.warn('[TTS] ResponsiveVoice not loaded, trying Gemini TTS...');
    
    // Try Gemini TTS as fallback
    if (isGeminiTTSAvailable()) {
      translateAndSpeak(text, langCode as GeminiTTSLanguage, onEnd, onError);
      return;
    }
    
    // Final fallback to browser TTS
    console.warn('[TTS] Gemini not available, using browser TTS');
    fallbackToBrowserTTS(text, langCode, onEnd);
    return;
  }

  const rv = (window as any).responsiveVoice;
  const voiceName = RESPONSIVE_VOICE_MAP[langCode] || 'US English Female';

  console.log('[TTS] Speaking with ResponsiveVoice:', { text: text.substring(0, 50), voice: voiceName });

  rv.speak(text, voiceName, {
    pitch: 1,
    rate: 0.9,
    volume: 1,
    onend: () => {
      console.log('[TTS] Speech ended');
      onEnd?.();
    },
    onerror: (error: any) => {
      console.error('[TTS] ResponsiveVoice error:', error);
      onError?.(error);
      
      // Try Gemini as fallback on error
      if (isGeminiTTSAvailable()) {
        console.log('[TTS] Switching to Gemini TTS...');
        translateAndSpeak(text, langCode as GeminiTTSLanguage, onEnd, onError);
      } else {
        // Final fallback to browser TTS
        fallbackToBrowserTTS(text, langCode, onEnd);
      }
    }
  });
};

/**
 * Cancel any ongoing speech
 */
export const cancelSpeech = (): void => {
  // Cancel ResponsiveVoice
  if (typeof (window as any).responsiveVoice !== 'undefined') {
    (window as any).responsiveVoice.cancel();
  }
  
  // Cancel Gemini TTS
  cancelGeminiSpeech();
  
  // Cancel browser TTS
  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.cancel();
  }
};

/**
 * Check if a language is supported by ResponsiveVoice
 */
export const isLanguageSupported = (langCode: string): boolean => {
  return langCode in RESPONSIVE_VOICE_MAP;
};

/**
 * Fallback to browser's native Web Speech API
 */
const fallbackToBrowserTTS = (
  text: string,
  langCode: SupportedTTSLanguage,
  onEnd?: () => void
): void => {
  console.log('[TTS] Using browser fallback TTS');
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  
  if (onEnd) {
    utterance.onend = () => onEnd();
  }
  
  // Try to find best voice
  const voices = speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang === langCode) || 
                voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
  
  if (voice) {
    utterance.voice = voice;
  }
  
  speechSynthesis.speak(utterance);
};

/**
 * Speak text in sections with natural pauses (for medical reports)
 */
export const speakInSectionsWithAPI = async (
  sections: Array<{ title: string; content: string }>,
  langCode: SupportedTTSLanguage,
  onComplete?: () => void
): Promise<void> => {
  let currentIndex = 0;

  const speakNext = () => {
    if (currentIndex >= sections.length) {
      console.log('[TTS] All sections completed');
      onComplete?.();
      return;
    }

    const section = sections[currentIndex];
    const textToSpeak = `${section.title}: ${section.content}`;
    
    currentIndex++;
    
    speakWithResponsiveVoice(
      textToSpeak,
      langCode,
      () => {
        // Natural pause between sections
        setTimeout(speakNext, 500);
      },
      (error) => {
        console.error('[TTS] Error in section, skipping:', error);
        setTimeout(speakNext, 100);
      }
    );
  };

  speakNext();
};
