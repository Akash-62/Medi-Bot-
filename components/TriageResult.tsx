
import React, { useState, useEffect, useRef } from 'react';
import type { TriageResultData } from '../types';
import { TriageLevel } from '../types';
import { useLanguage, outputLanguages, OutputLocale } from '../contexts/LanguageContext';
import { translateText } from '../services/geminiService';


interface TriageResultProps {
  result: TriageResultData;
}

const levelStyles: Record<TriageLevel, { text: string, border: string, glow: string }> = {
  [TriageLevel.EMERGENCY]: { text: 'text-red-400', border: 'border-red-500/80', glow: 'shadow-red-500/20' },
  [TriageLevel.PRIORITY]: { text: 'text-orange-400', border: 'border-orange-500/80', glow: 'shadow-orange-500/20' },
  [TriageLevel.ROUTINE]: { text: 'text-sky-400', border: 'border-sky-500/80', glow: 'shadow-sky-500/20' },
  [TriageLevel.SELF_CARE]: { text: 'text-green-400', border: 'border-green-500/80', glow: 'shadow-green-500/20' },
};

const Section: React.FC<{ title: string; icon: JSX.Element; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="py-4">
        <h3 className="flex items-center text-md font-semibold mb-2 text-slate-300">
            {icon}
            <span className="ml-2.5">{title}</span>
        </h3>
        <div className="text-slate-400 prose prose-sm max-w-none prose-p:my-1 prose-li:my-1">
            {children}
        </div>
    </div>
);

const TriageResult: React.FC<TriageResultProps> = ({ result }) => {
  const { t, locale: uiLocale } = useLanguage();
  const styles = levelStyles[result.urgencyLevel] || levelStyles[TriageLevel.ROUTINE];
  
  const [translatedContent, setTranslatedContent] = useState<{ recommendation: string; explanation: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentDisplayLocale, setCurrentDisplayLocale] = useState<OutputLocale | 'en' | 'es' | 'fr'>(uiLocale);
  const utteranceQueue = useRef<SpeechSynthesisUtterance[]>([]);
  
  useEffect(() => {
    return () => { speechSynthesis.cancel(); };
  }, []);
  
  // Reset translation when original result changes
  useEffect(() => {
    setTranslatedContent(null);
    setCurrentDisplayLocale(uiLocale);
  }, [result, uiLocale])

  const speakInSections = (sections: {title: string, content: string}[], lang: OutputLocale | 'en' | 'es' | 'fr') => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const allVoices = speechSynthesis.getVoices();
    if (allVoices.length === 0) {
      setTimeout(() => speakInSections(sections, lang), 100);
      return;
    }

    const langCode = lang in outputLanguages 
      ? outputLanguages[lang as OutputLocale]?.voiceCode 
      : { en: 'en-US', es: 'es-ES', fr: 'fr-FR' }[lang];

    // --- 1. Prioritize Higher-Quality Voices ---
    // Search for voices with keywords indicating higher quality (e.g., from major providers or neural engines).
    const voicesForLang = allVoices.filter(v => v.lang.startsWith(langCode.split('-')[0]));
    const nativeVoice = voicesForLang.find(v => v.lang === langCode);
    const qualityKeywords = ['Google', 'Microsoft', 'Apple', 'Neural', 'Online', 'Premium'];
    const highQualityVoice = voicesForLang.find(v => qualityKeywords.some(keyword => v.name.includes(keyword))) || nativeVoice;
    const bestVoice = highQualityVoice || voicesForLang[0];

    // --- 2. Implement Section-Based Speaking with Introductions ---
    // Create a queue of utterances, one for each section of the report.
    // Each utterance is prefixed with its section title for clarity.
    utteranceQueue.current = sections.map(section => {
      const textToSpeak = `${section.title}: ${section.content}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = langCode;
      if (bestVoice) utterance.voice = bestVoice;
      // --- 4. Adjust Speech Rate for Clarity ---
      utterance.rate = 0.9; // Slightly slower for better comprehension of medical info.
      utterance.pitch = 1;
      return utterance;
    });

    // --- 3. Ensure Natural Pauses Between Sections ---
    // The `speakNext` function is called recursively via the `onend` event.
    // This ensures one utterance finishes completely before the next one starts, creating a natural pause.
    const speakNext = () => {
      if (utteranceQueue.current.length > 0) {
        const utterance = utteranceQueue.current.shift()!;
        utterance.onend = speakNext;
        speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    };
    
    setIsSpeaking(true);
    speakNext();
  };

  const handleTranslate = async (targetLocale: OutputLocale) => {
    setIsTranslating(true);
    try {
        const [translatedRecommendation, translatedExplanation] = await Promise.all([
            translateText(result.recommendation, targetLocale),
            translateText(result.explanation, targetLocale)
        ]);
        setTranslatedContent({ recommendation: translatedRecommendation, explanation: translatedExplanation });
        setCurrentDisplayLocale(targetLocale);
    } catch (error) {
        console.error("Translation failed:", error);
    } finally {
        setIsTranslating(false);
    }
  };
  
  const currentRecommendation = translatedContent?.recommendation || result.recommendation;
  const currentExplanation = translatedContent?.explanation || result.explanation;

  return (
    <div className={`p-4 rounded-xl border ${styles.border} bg-slate-900/50 backdrop-blur-md shadow-lg ${styles.glow} divide-y divide-slate-700/50`}>
      <div className="flex items-center justify-between pb-3">
        <span className={`px-3 py-1 text-sm font-bold rounded-full ${styles.text}`}>
          {t('triageUrgency')}: {result.urgencyLevel.toUpperCase()}
        </span>
        <button
          onClick={() => speakInSections([
              { title: t('triageUrgency'), content: result.urgencyLevel },
              { title: t('triageRecommendation'), content: currentRecommendation },
              { title: t('triageExplanation'), content: currentExplanation.replace(/Disclaimer:.*?\s/, '') }
            ], currentDisplayLocale)
          }
          className={`p-2 rounded-full hover:bg-sky-500/20 focus:outline-none focus:ring-2 focus:ring-sky-500 ${isSpeaking ? 'text-sky-400' : 'text-slate-400'}`}
          aria-label={t('speakLabel')}
        >
          {isSpeaking ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l9 7.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 8.25l9 7.5-9 7.5V8.25z" /></svg>
          )}
        </button>
      </div>
      
      <div className="py-3">
          <p className="text-xs text-slate-400 mb-2">{t('translateToLabel')}</p>
          <div className="flex flex-wrap gap-2">
             <button onClick={() => { setTranslatedContent(null); setCurrentDisplayLocale(uiLocale);}} className={`px-2.5 py-1 text-xs rounded-full transition-colors ${!translatedContent ? 'bg-sky-600 text-white' : 'text-slate-300 bg-slate-700/50 hover:bg-slate-600/60'}`}>{t('originalLabel')}</button>
            {(Object.keys(outputLanguages) as OutputLocale[]).map(locale => (
                <button
                    key={locale} onClick={() => handleTranslate(locale)}
                    className={`px-2.5 py-1 text-xs rounded-full transition-colors ${currentDisplayLocale === locale ? 'bg-sky-600 text-white' : 'text-cyan-300 bg-cyan-900/40 hover:bg-cyan-800/60'}`}
                >{outputLanguages[locale].name}</button>
            ))}
          </div>
          {isTranslating && <p className="text-xs text-slate-400 mt-2 animate-pulse">{t('translatingLabel')}...</p>}
      </div>

      <Section title={t('triageRecommendation')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
        <p className={`font-semibold ${styles.text}`}>{currentRecommendation}</p>
      </Section>
      
      <Section title={t('triageExplanation')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>}>
        <p>{currentExplanation}</p>
      </Section>
      
      {result.drugInteractions?.length > 0 && (
          <Section title={t('triageInteractions')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}>
              <ul className="list-disc pl-5 space-y-2">
                  {result.drugInteractions.map((interaction, index) => (
                      <li key={index}><strong>{interaction.drugs}:</strong> {interaction.risk} <em>({t('interactionSource')}: {interaction.source})</em></li>
                  ))}
              </ul>
          </Section>
      )}

      {result.citedSources?.length > 0 && (
          <Section title={t('triageSources')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6-2.292m0 0v14.25" /></svg>}>
              <div className="flex flex-wrap gap-2">
                  {result.citedSources.map((source, index) => (<span key={index} className="px-2 py-1 text-xs bg-slate-700/80 text-slate-300 rounded">{source}</span>))}
              </div>
          </Section>
      )}
    </div>
  );
};

export default TriageResult;