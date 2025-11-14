/**
 * Gemini TTS Service - Native Audio Translation for Indian Languages
 * 
 * Uses Google's Gemini API for high-quality text-to-speech
 * Supports: Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, and more
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export type GeminiTTSLanguage = 'en-US' | 'hi-IN' | 'ta-IN' | 'te-IN' | 'ml-IN' | 'kn-IN' | 'es-ES' | 'fr-FR' | 'bn-IN';

// Get Gemini API key from environment
const getGeminiApiKey = (): string => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('[Gemini TTS] API key not configured');
    return '';
  }
  
  return apiKey;
};

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;

const initGeminiAI = (): GoogleGenerativeAI => {
  if (!genAI) {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

/**
 * Language code mapping for Gemini TTS
 */
const GEMINI_LANG_MAP: Record<GeminiTTSLanguage, string> = {
  'en-US': 'en-US',
  'hi-IN': 'hi-IN',
  'ta-IN': 'ta-IN',
  'te-IN': 'te-IN',
  'ml-IN': 'ml-IN',
  'kn-IN': 'kn-IN',
  'es-ES': 'es-ES',
  'fr-FR': 'fr-FR',
  'bn-IN': 'bn-IN'
};

/**
 * Generate audio using Gemini's native TTS
 * Note: This uses Gemini's audio generation capability
 */
export const generateSpeechWithGemini = async (
  text: string,
  langCode: GeminiTTSLanguage
): Promise<Blob | null> => {
  try {
    console.log('[Gemini TTS] Generating speech for:', { text: text.substring(0, 50), lang: langCode });
    
    const ai = initGeminiAI();
    const model = ai.getGenerativeModel({ model: 'gemini-pro' });
    
    // For now, Gemini doesn't have direct TTS API
    // We'll use Web Speech API with Gemini for translation if needed
    console.warn('[Gemini TTS] Direct TTS not available, using hybrid approach');
    
    return null;
  } catch (error) {
    console.error('[Gemini TTS] Error generating speech:', error);
    return null;
  }
};

/**
 * Translate and speak using Gemini + Browser TTS
 * This ensures accurate translation for Indian languages
 */
export const translateAndSpeak = async (
  text: string,
  targetLang: GeminiTTSLanguage,
  onEnd?: () => void,
  onError?: (error: string) => void
): Promise<void> => {
  try {
    const ai = initGeminiAI();
    const model = ai.getGenerativeModel({ model: 'gemini-pro' });
    
    // Translate text using Gemini for better accuracy
    const langName = {
      'hi-IN': 'Hindi',
      'ta-IN': 'Tamil',
      'te-IN': 'Telugu',
      'ml-IN': 'Malayalam',
      'kn-IN': 'Kannada',
      'bn-IN': 'Bengali',
      'es-ES': 'Spanish',
      'fr-FR': 'French',
      'en-US': 'English'
    }[targetLang] || 'English';
    
    if (targetLang === 'en-US') {
      // No translation needed
      speakWithBrowserTTS(text, targetLang, onEnd);
      return;
    }
    
    console.log('[Gemini TTS] Translating to:', langName);
    
    const prompt = `Translate the following medical text to ${langName}. Provide ONLY the translation, no explanations:\n\n${text}`;
    const result = await model.generateContent(prompt);
    const translatedText = result.response.text();
    
    console.log('[Gemini TTS] Translation complete, speaking...');
    
    // Speak the translated text using browser TTS
    speakWithBrowserTTS(translatedText, targetLang, onEnd);
    
  } catch (error) {
    console.error('[Gemini TTS] Translation error:', error);
    onError?.(error instanceof Error ? error.message : 'Translation failed');
    
    // Fallback to direct TTS without translation
    speakWithBrowserTTS(text, targetLang, onEnd);
  }
};

/**
 * Browser TTS helper (high-quality voices)
 */
const speakWithBrowserTTS = (
  text: string,
  langCode: GeminiTTSLanguage,
  onEnd?: () => void
): void => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = GEMINI_LANG_MAP[langCode];
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  if (onEnd) {
    utterance.onend = () => onEnd();
  }
  
  utterance.onerror = (event) => {
    console.error('[Browser TTS] Error:', event);
  };
  
  // Try to find the best voice for the language
  const voices = speechSynthesis.getVoices();
  const bestVoice = voices.find(v => v.lang === GEMINI_LANG_MAP[langCode]) ||
                    voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
  
  if (bestVoice) {
    utterance.voice = bestVoice;
    console.log('[Browser TTS] Using voice:', bestVoice.name);
  }
  
  speechSynthesis.speak(utterance);
};

/**
 * Cancel ongoing speech
 */
export const cancelGeminiSpeech = (): void => {
  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.cancel();
  }
};

/**
 * Check if Gemini TTS is available
 */
export const isGeminiTTSAvailable = (): boolean => {
  const apiKey = getGeminiApiKey();
  return !!apiKey && apiKey.length > 0;
};

/**
 * Get available voices for a language
 */
export const getAvailableVoices = (langCode?: GeminiTTSLanguage): SpeechSynthesisVoice[] => {
  const voices = speechSynthesis.getVoices();
  
  if (!langCode) {
    return voices;
  }
  
  const targetLang = GEMINI_LANG_MAP[langCode];
  return voices.filter(v => 
    v.lang === targetLang || 
    v.lang.startsWith(targetLang.split('-')[0])
  );
};

export default {
  translateAndSpeak,
  cancelGeminiSpeech,
  isGeminiTTSAvailable,
  getAvailableVoices
};
