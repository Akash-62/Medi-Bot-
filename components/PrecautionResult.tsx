
import React, { useState, useEffect, useRef } from 'react';
import type { PrecautionResultData } from '../types';
import { useLanguage, OutputLocale, outputLanguages } from '../contexts/LanguageContext';
import { translateText } from '../services/llmService';
import { speakInSectionsWithAPI, cancelSpeech, isLanguageSupported, type SupportedTTSLanguage } from '../services/ttsService';

interface PrecautionResultProps {
  result: PrecautionResultData;
}

const Section: React.FC<{ title: string; icon: React.ReactElement; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="py-4">
        <h3 className="flex items-center text-md font-semibold mb-2 text-slate-300">
            {icon}
            <span className="ml-2.5">{title}</span>
        </h3>
        <div className="text-slate-400 prose prose-sm max-w-none prose-p:my-1 prose-li:my-1 prose-ul:space-y-1">
            {children}
        </div>
    </div>
);

const PrecautionResult: React.FC<PrecautionResultProps> = ({ result }) => {
  const { t, locale: uiLocale } = useLanguage();
  
  const [translatedContent, setTranslatedContent] = useState<Partial<PrecautionResultData> | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentDisplayLocale, setCurrentDisplayLocale] = useState<OutputLocale | 'en' | 'es' | 'fr'>(uiLocale);
  const utteranceQueue = useRef<SpeechSynthesisUtterance[]>([]);
  
  useEffect(() => {
    return () => { cancelSpeech(); };
  }, []);

  useEffect(() => {
    setTranslatedContent(null);
    setCurrentDisplayLocale(uiLocale);
  }, [result, uiLocale]);

  const speakInSections = async (sections: {title: string, content: string | string[]}[], lang: OutputLocale | 'en' | 'es' | 'fr') => {
    if (isSpeaking) {
      cancelSpeech();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    const langCodeMap: { [key: string]: SupportedTTSLanguage } = {
      'kn': 'kn-IN', 'hi': 'hi-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'ml': 'ml-IN',
      'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR'
    };

    const ttsLangCode = langCodeMap[lang] || 'en-US';
    
    // Format sections properly for TTS
    const formattedSections = sections.map(section => ({
      title: section.title,
      content: Array.isArray(section.content) ? section.content.join('. ') : section.content
    }));

    try {
      if (isLanguageSupported(ttsLangCode)) {
        await speakInSectionsWithAPI(formattedSections, ttsLangCode, () => {
          setIsSpeaking(false);
        });
      } else {
        fallbackToBrowserTTS(formattedSections, ttsLangCode);
      }
    } catch (error) {
      console.error('[TTS] Error:', error);
      setIsSpeaking(false);
    }
  };

  const fallbackToBrowserTTS = (sections: {title: string, content: string}[], langCode: string) => {
    const allVoices = speechSynthesis.getVoices();
    if (allVoices.length === 0) {
      setTimeout(() => fallbackToBrowserTTS(sections, langCode), 100);
      return;
    }
    
    const voicesForLang = allVoices.filter(v => v.lang.startsWith(langCode.split('-')[0]));
    const nativeVoice = voicesForLang.find(v => v.lang === langCode);
    const qualityKeywords = ['Google', 'Microsoft', 'Apple', 'Neural'];
    const highQualityVoice = voicesForLang.find(v => qualityKeywords.some(keyword => v.name.includes(keyword))) || nativeVoice;
    const bestVoice = highQualityVoice || voicesForLang[0];

    utteranceQueue.current = sections.map(section => {
      const utterance = new SpeechSynthesisUtterance(`${section.title}: ${section.content}`);
      utterance.lang = langCode;
      if (bestVoice) utterance.voice = bestVoice;
      utterance.rate = 0.9;
      return utterance;
    });

    const speakNext = () => {
      if (utteranceQueue.current.length > 0) {
        const utterance = utteranceQueue.current.shift()!;
        utterance.onend = speakNext;
        speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    };
    
    speakNext();
  };

  const handleTranslate = async (targetLocale: OutputLocale) => {
    setIsTranslating(true);
    try {
        const [
            tName, tOverview, tHygiene, tDiet, tLifestyle, tCheckups
        ] = await Promise.all([
            translateText(result.diseaseName, targetLocale),
            translateText(result.overview, targetLocale),
            Promise.all(result.hygienePractices.map(item => translateText(item, targetLocale))),
            Promise.all(result.dietaryRecommendations.map(item => translateText(item, targetLocale))),
            Promise.all(result.lifestyleAdjustments.map(item => translateText(item, targetLocale))),
            Promise.all(result.medicalCheckups.map(item => translateText(item, targetLocale))),
        ]);
        setTranslatedContent({
            diseaseName: tName, overview: tOverview, hygienePractices: tHygiene,
            dietaryRecommendations: tDiet, lifestyleAdjustments: tLifestyle, medicalCheckups: tCheckups
        });
        setCurrentDisplayLocale(targetLocale);
    } catch (error) {
        console.error("Translation failed:", error);
    } finally {
        setIsTranslating(false);
    }
  };
  
  const current = {
      diseaseName: translatedContent?.diseaseName || result.diseaseName,
      overview: translatedContent?.overview || result.overview,
      hygienePractices: translatedContent?.hygienePractices || result.hygienePractices,
      dietaryRecommendations: translatedContent?.dietaryRecommendations || result.dietaryRecommendations,
      lifestyleAdjustments: translatedContent?.lifestyleAdjustments || result.lifestyleAdjustments,
      medicalCheckups: translatedContent?.medicalCheckups || result.medicalCheckups,
  };

  return (
    <div className={`p-4 rounded-xl border border-green-500/80 bg-slate-900/50 backdrop-blur-md shadow-lg shadow-green-500/20 divide-y divide-slate-700/50`}>
      <div className="flex items-center justify-between pb-3">
        <span className="text-lg font-bold text-green-300">{current.diseaseName}</span>
        <button
          onClick={() => speakInSections([
              { title: t('precautionDisease'), content: current.diseaseName },
              { title: t('precautionOverview'), content: current.overview },
              { title: t('precautionHygiene'), content: current.hygienePractices },
              { title: t('precautionDiet'), content: current.dietaryRecommendations },
              { title: t('precautionLifestyle'), content: current.lifestyleAdjustments },
              { title: t('precautionCheckups'), content: current.medicalCheckups },
            ], currentDisplayLocale)
          }
          className={`p-2 rounded-full hover:bg-sky-500/20 focus:outline-none focus:ring-2 focus:ring-sky-500 ${isSpeaking ? 'text-sky-400' : 'text-slate-400'}`}
          aria-label={t('speakLabel')}
        >
          {isSpeaking ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l9 7.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 8.25l9 7.5-9 7.5V8.25z" /></svg>
          )}
        </button>
      </div>
      
      <div className="py-3">
          <p className="text-xs text-slate-400 mb-2">{t('translateToLabel')}</p>
          <div className="flex flex-wrap gap-2">
             <button onClick={() => { setTranslatedContent(null); setCurrentDisplayLocale(uiLocale);}} className={`px-2.5 py-1 text-xs rounded-full transition-colors ${!translatedContent ? 'bg-sky-600 text-white' : 'text-slate-300 bg-slate-700/50 hover:bg-slate-600/60'}`}>{t('originalLabel')}</button>
            {(Object.keys(outputLanguages) as OutputLocale[]).map(locale => (
                <button key={locale} onClick={() => handleTranslate(locale)} className={`px-2.5 py-1 text-xs rounded-full transition-colors ${currentDisplayLocale === locale ? 'bg-sky-600 text-white' : 'text-cyan-300 bg-cyan-900/40 hover:bg-cyan-800/60'}`}>{outputLanguages[locale].name}</button>
            ))}
          </div>
          {isTranslating && <p className="text-xs text-slate-400 mt-2 animate-pulse">{t('translatingLabel')}...</p>}
      </div>

      <Section title={t('precautionOverview')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>}>
        <p>{current.overview}</p>
      </Section>
      <Section title={t('precautionHygiene')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1012 10.125A2.625 2.625 0 0012 4.875z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.875c0-.621.504-1.125 1.125-1.125H12zM12 4.875c0 .621-.504-1.125-1.125-1.125H12zM12 10.125c0 .621.504 1.125 1.125-1.125H12zM12 10.125c0-.621-.504-1.125-1.125-1.125H12z" /></svg>}>
          <ul className="list-disc pl-5">{current.hygienePractices.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </Section>
      <Section title={t('precautionDiet')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 12.75V5.25a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h10.5M16.5 12.75V21" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 12.75a2.25 2.25 0 01-2.25 2.25H16.5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75H12" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75h2.25a2.25 2.25 0 002.25-2.25V9.75" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12.75v8.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75H4.5" /></svg>}>
          <ul className="list-disc pl-5">{current.dietaryRecommendations.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </Section>
      <Section title={t('precautionLifestyle')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6V3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6l3.75-1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21v-3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12H3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 12h-1.5" /></svg>}>
          <ul className="list-disc pl-5">{current.lifestyleAdjustments.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </Section>
      <Section title={t('precautionCheckups')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
          <ul className="list-disc pl-5">{current.medicalCheckups.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </Section>
    </div>
  );
};

export default PrecautionResult;