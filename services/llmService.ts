// LLM Service - Groq API only
import type { TriageResultData, MedicationResultData, PrecautionResultData } from '../types';
import type { Locale } from '../contexts/LanguageContext';
import * as groqService from './groqService';

// Use Groq API exclusively
export const getTriageRecommendation = groqService.getTriageRecommendation;
export const getMedicationInfo = groqService.getMedicationInfo;
export const getPrecautionsInfo = groqService.getPrecautionsInfo;
export const getChatResponse = groqService.getChatResponse;

// Translation using Groq LLM
export const translateText = async (text: string, targetLocale: string): Promise<string> => {
  if (!text?.trim()) return '';
  
  // If target is English, return as-is
  if (targetLocale === 'en') return text;
  
  try {
    const languageNames: Record<string, string> = {
      'kn': 'Kannada (ಕನ್ನಡ)',
      'hi': 'Hindi (हिन्दी)',
      'ta': 'Tamil (தமிழ்)',
      'te': 'Telugu (తెలుగు)',
      'ml': 'Malayalam (മലയാളം)',
      'en': 'English'
    };
    
    const targetLanguage = languageNames[targetLocale] || targetLocale;
    
    const result = await groqService.translateTextWithGroq(text, targetLanguage);
    return result;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text
  }
};

export const translateTexts = async (texts: string[], targetLocale: string): Promise<string[]> => {
  if (!texts?.length) return [];
  if (targetLocale === 'en') return texts;
  
  try {
    // Translate each text in parallel for better performance
    const translations = await Promise.all(
      texts.map(text => translateText(text, targetLocale))
    );
    return translations;
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts; // Fallback to original texts
  }
};

export const checkGroqAvailability = groqService.checkGroqAvailability;
