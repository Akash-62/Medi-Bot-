
import React, { useState, useEffect, useRef } from 'react';
import type { MedicationResultData } from '../types';
import { useLanguage, outputLanguages, OutputLocale } from '../contexts/LanguageContext';
import { translateText } from '../services/geminiService';

interface MedicationResultProps {
  result: MedicationResultData;
}

const Section: React.FC<{ title: string; icon: JSX.Element; children: React.ReactNode; isWarning?: boolean }> = ({ title, icon, children, isWarning = false }) => (
    <div className={`py-4 ${isWarning ? 'bg-red-900/20 p-4 rounded-lg' : ''}`}>
        <h3 className={`flex items-center text-md font-semibold mb-2 ${isWarning ? 'text-red-400' : 'text-slate-300'}`}>
            {icon}
            <span className="ml-2.5">{title}</span>
        </h3>
        <div className="text-slate-400 prose prose-sm max-w-none prose-p:my-1 prose-li:my-1 prose-ul:space-y-1">
            {children}
        </div>
    </div>
);

const MedicationResult: React.FC<MedicationResultProps> = ({ result }) => {
  const { t, locale: uiLocale } = useLanguage();
  
  const [translatedContent, setTranslatedContent] = useState<Partial<MedicationResultData> | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentDisplayLocale, setCurrentDisplayLocale] = useState<OutputLocale | 'en' | 'es' | 'fr'>(uiLocale);
  const utteranceQueue = useRef<SpeechSynthesisUtterance[]>([]);
  
  useEffect(() => {
    return () => { speechSynthesis.cancel(); };
  }, []);

  useEffect(() => {
    setTranslatedContent(null);
    setCurrentDisplayLocale(uiLocale);
  }, [result, uiLocale]);

  const speakInSections = (sections: {title: string, content: string | string[]}[], lang: OutputLocale | 'en' | 'es' | 'fr') => {
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
    const langCode = lang in outputLanguages ? outputLanguages[lang as OutputLocale]?.voiceCode : { en: 'en-US', es: 'es-ES', fr: 'fr-FR' }[lang];
    
    // --- 1. Prioritize Higher-Quality Voices ---
    const voicesForLang = allVoices.filter(v => v.lang.startsWith(langCode.split('-')[0]));
    const nativeVoice = voicesForLang.find(v => v.lang === langCode);
    const qualityKeywords = ['Google', 'Microsoft', 'Apple', 'Neural', 'Online', 'Premium'];
    const highQualityVoice = voicesForLang.find(v => qualityKeywords.some(keyword => v.name.includes(keyword))) || nativeVoice;
    const bestVoice = highQualityVoice || voicesForLang[0];

    // --- 2. Implement Section-Based Speaking with Introductions ---
    utteranceQueue.current = sections.map(section => {
      const contentString = Array.isArray(section.content) ? section.content.join(', ') : section.content;
      const textToSpeak = `${section.title}: ${contentString}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = langCode;
      if (bestVoice) utterance.voice = bestVoice;
      // --- 4. Adjust Speech Rate for Clarity ---
      utterance.rate = 0.9;
      return utterance;
    });

    // --- 3. Ensure Natural Pauses Between Sections ---
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
        const [
            tName, tUses, tMechanism, tAdult, tPediatric, tSideEffects, tWarnings
        ] = await Promise.all([
            translateText(result.medicationName, targetLocale),
            Promise.all(result.commonUses.map(item => translateText(item, targetLocale))),
            translateText(result.mechanismOfAction, targetLocale),
            translateText(result.dosageInformation.adult, targetLocale),
            translateText(result.dosageInformation.pediatric, targetLocale),
            Promise.all(result.commonSideEffects.map(item => translateText(item, targetLocale))),
            Promise.all(result.crucialWarnings.map(item => translateText(item, targetLocale))),
        ]);
        setTranslatedContent({
            medicationName: tName, commonUses: tUses, mechanismOfAction: tMechanism,
            dosageInformation: { adult: tAdult, pediatric: tPediatric },
            commonSideEffects: tSideEffects, crucialWarnings: tWarnings
        });
        setCurrentDisplayLocale(targetLocale);
    } catch (error) {
        console.error("Translation failed:", error);
    } finally {
        setIsTranslating(false);
    }
  };
  
  const current = {
      medicationName: translatedContent?.medicationName || result.medicationName,
      commonUses: translatedContent?.commonUses || result.commonUses,
      mechanismOfAction: translatedContent?.mechanismOfAction || result.mechanismOfAction,
      dosageInformation: translatedContent?.dosageInformation || result.dosageInformation,
      commonSideEffects: translatedContent?.commonSideEffects || result.commonSideEffects,
      crucialWarnings: translatedContent?.crucialWarnings || result.crucialWarnings,
  };

  return (
    <div className={`p-4 rounded-xl border border-sky-500/80 bg-slate-900/50 backdrop-blur-md shadow-lg shadow-sky-500/20 divide-y divide-slate-700/50`}>
      <div className="flex items-center justify-between pb-3">
        <span className="text-lg font-bold text-sky-300">{current.medicationName}</span>
        <button
          onClick={() => speakInSections([
              { title: t('medicationName'), content: current.medicationName },
              { title: t('medicationUses'), content: current.commonUses },
              { title: t('medicationMechanism'), content: current.mechanismOfAction },
              { title: t('medicationDosage'), content: `Adult: ${current.dosageInformation.adult}. Pediatric: ${current.dosageInformation.pediatric}`},
              { title: t('medicationSideEffects'), content: current.commonSideEffects },
              { title: t('medicationWarnings'), content: current.crucialWarnings },
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

      <Section title={t('medicationUses')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>}>
          <ul className="list-disc pl-5">{current.commonUses.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </Section>
      <Section title={t('medicationMechanism')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1.125-1.5M13.5 16.5L12 15m1.5 1.5l1.125-1.5m-2.625 0l1.125-1.5M10.875 15l-1.125 1.5m0 0l1.125 1.5m-1.125-1.5h-1.5m0 0h1.5" /></svg>}>
        <p>{current.mechanismOfAction}</p>
      </Section>
      <Section title={t('medicationDosage')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-4.006-4.006S14.35 4.5 13.2 4.5c-1.152 0-2.304 0-3.456 0-1.152 0-2.304 0-3.456 0-1.152 0-1.232 0-1.232 0-2.206 0-4.006 1.8-4.006 4.006S4.5 12 4.5 13.2c0 1.152 0 2.304 0 3.456 0 1.152 0 2.304 0 3.456 0 1.152 0 1.232 0 1.232 0 2.206 1.8 4.006 4.006 4.006s4.006-1.8 4.006-4.006c0-1.152 0-2.304 0-3.456S12 14.35 12 13.2c0-1.152 0-2.304 0-3.456 0-.58.013-1.158.037-1.728" /></svg>}>
        <p><strong>{t('dosageAdult')}:</strong> {current.dosageInformation.adult}</p>
        <p><strong>{t('dosagePediatric')}:</strong> {current.dosageInformation.pediatric}</p>
      </Section>
      <Section title={t('medicationSideEffects')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
         <ul className="list-disc pl-5">{current.commonSideEffects.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </Section>
      <Section title={t('medicationWarnings')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>} isWarning>
         <ul className="list-disc pl-5 text-red-300">{current.crucialWarnings.map((item, i) => <li key={i}>{item}</li>)}</ul>
      </Section>
    </div>
  );
};

export default MedicationResult;