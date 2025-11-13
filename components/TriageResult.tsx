
import React, { useState, useEffect, useRef } from 'react';
import type { TriageResultData } from '../types';
import { TriageLevel } from '../types';
import { useLanguage, OutputLocale, outputLanguages } from '../contexts/LanguageContext';
import { translateText } from '../services/llmService';
import { speakInSectionsWithAPI, cancelSpeech, isLanguageSupported, type SupportedTTSLanguage } from '../services/ttsService';


interface TriageResultProps {
  result: TriageResultData;
}

const levelStyles: Record<TriageLevel, { text: string, border: string, glow: string, bg: string }> = {
  [TriageLevel.EMERGENCY]: { text: 'text-red-400', border: 'border-red-500/80', glow: 'shadow-red-500/20', bg: 'bg-red-950/30' },
  [TriageLevel.PRIORITY]: { text: 'text-orange-400', border: 'border-orange-500/80', glow: 'shadow-orange-500/20', bg: 'bg-orange-950/30' },
  [TriageLevel.ROUTINE]: { text: 'text-sky-400', border: 'border-sky-500/80', glow: 'shadow-sky-500/20', bg: 'bg-sky-950/30' },
  [TriageLevel.SELF_CARE]: { text: 'text-green-400', border: 'border-green-500/80', glow: 'shadow-green-500/20', bg: 'bg-green-950/30' },
};

const Section: React.FC<{ title: string; icon: React.ReactElement; children: React.ReactNode; collapsible?: boolean; defaultOpen?: boolean }> = ({ title, icon, children, collapsible = false, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="py-3 sm:py-4">
        <h3 
          className={`flex items-center justify-between text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-slate-200 ${collapsible ? 'cursor-pointer hover:text-cyan-300 transition-colors' : ''}`}
          onClick={() => collapsible && setIsOpen(!isOpen)}
        >
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-base sm:text-xl">{icon}</span>
              <span>{title}</span>
            </div>
            {collapsible && (
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
        </h3>
        {isOpen && (
          <div className="text-slate-300 prose prose-sm max-w-none prose-p:my-1.5 sm:prose-p:my-2 prose-li:my-1 sm:prose-li:my-1.5 leading-relaxed text-sm sm:text-base animate-fadeInUp">
              {children}
          </div>
        )}
    </div>
  );
};

const TriageResult: React.FC<TriageResultProps> = ({ result }) => {
  const { t, locale: uiLocale } = useLanguage();
  const styles = levelStyles[result.urgencyLevel] || levelStyles[TriageLevel.ROUTINE];
  
  const [translatedContent, setTranslatedContent] = useState<{ recommendation: string; explanation: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentDisplayLocale, setCurrentDisplayLocale] = useState<OutputLocale | 'en' | 'es' | 'fr'>(uiLocale);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const utteranceQueue = useRef<SpeechSynthesisUtterance[]>([]);
  
  useEffect(() => {
    return () => { 
      cancelSpeech(); // Cancel both ResponsiveVoice and browser TTS
    };
  }, []);
  
  // Reset translation when original result changes
  useEffect(() => {
    setTranslatedContent(null);
    setCurrentDisplayLocale(uiLocale);
  }, [result, uiLocale]);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const speakInSections = async (sections: {title: string, content: string}[], lang: OutputLocale | 'en' | 'es' | 'fr') => {
    if (isSpeaking) {
      cancelSpeech();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    // Map output locale to TTS language code
    const langCodeMap: { [key: string]: SupportedTTSLanguage } = {
      'kn': 'kn-IN',
      'hi': 'hi-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'ml': 'ml-IN',
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR'
    };

    const ttsLangCode = langCodeMap[lang] || 'en-US';
    const isIndianLang = ['kn-IN', 'ta-IN', 'te-IN', 'ml-IN', 'hi-IN'].includes(ttsLangCode);

    console.log('[TTS] Starting speech:', { language: lang, ttsCode: ttsLangCode, isIndian: isIndianLang });

    try {
      // Use ResponsiveVoice API for better Indian language support
      if (isLanguageSupported(ttsLangCode)) {
        await speakInSectionsWithAPI(sections, ttsLangCode, () => {
          setIsSpeaking(false);
        });
      } else {
        // Fallback to browser TTS for unsupported languages
        fallbackToBrowserTTS(sections, ttsLangCode);
      }
    } catch (error) {
      console.error('[TTS] Error:', error);
      setIsSpeaking(false);
    }
  };

  // Fallback browser TTS (original implementation)
  const fallbackToBrowserTTS = (sections: {title: string, content: string}[], langCode: string) => {
    const allVoices = speechSynthesis.getVoices();
    if (allVoices.length === 0) {
      setTimeout(() => fallbackToBrowserTTS(sections, langCode), 100);
      return;
    }

    const voicesForLang = allVoices.filter(v => v.lang.startsWith(langCode.split('-')[0]));
    const nativeVoice = voicesForLang.find(v => v.lang === langCode);
    const qualityKeywords = ['Google', 'Microsoft', 'Apple', 'Neural', 'Online', 'Premium'];
    const highQualityVoice = voicesForLang.find(v => qualityKeywords.some(keyword => v.name.includes(keyword))) || nativeVoice;
    const bestVoice = highQualityVoice || voicesForLang[0];

    utteranceQueue.current = sections.map(section => {
      const textToSpeak = `${section.title}: ${section.content}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = langCode;
      if (bestVoice) utterance.voice = bestVoice;
      utterance.rate = 0.9;
      utterance.pitch = 1;
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
    <div className={`p-3 sm:p-5 rounded-2xl border ${styles.border} bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-lg shadow-xl ${styles.glow} divide-y divide-slate-700/30`}>
      {/* Header with Urgency and Actions */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 gap-2">
        <span className={`px-4 py-2 text-sm font-bold rounded-xl ${styles.text} ${styles.bg} backdrop-blur-sm border ${styles.border}`}>
          {t('triageUrgency')}: {result.urgencyLevel.toUpperCase()}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(
              `URGENCY: ${result.urgencyLevel}\n\nRECOMMENDATION:\n${currentRecommendation}\n\nEXPLANATION:\n${currentExplanation}`,
              'full'
            )}
            className="p-2.5 rounded-xl hover:bg-cyan-500/15 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-400 hover:text-cyan-300"
            aria-label="Copy full analysis"
            title="Copy full analysis"
          >
            {copiedSection === 'full' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => speakInSections([
                { title: t('triageUrgency'), content: result.urgencyLevel },
                { title: t('triageRecommendation'), content: currentRecommendation },
                { title: t('triageExplanation'), content: currentExplanation.replace(/Disclaimer:.*?\s/, '') }
              ], currentDisplayLocale)
            }
            className={`p-2.5 rounded-xl hover:bg-cyan-500/15 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${isSpeaking ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400'}`}
            aria-label={t('speakLabel')}
          >
            {isSpeaking ? (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l9 7.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 8.25l9 7.5-9 7.5V8.25z" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Quick Summary Card - TL;DR */}
      <div className="py-3 sm:py-4">
        <div className={`${styles.bg} rounded-xl border-2 ${styles.border} px-3 sm:px-4 py-3 sm:py-4 shadow-lg`}>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`flex-shrink-0 p-2 sm:p-2.5 rounded-lg bg-gradient-to-br ${styles.bg} border-2 ${styles.border} shadow-md`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 sm:h-7 sm:w-7 ${styles.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white mb-2 flex items-center gap-2 flex-wrap">
                <span className={styles.text}>⚡ Quick Summary</span>
                <span className="text-xs font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full">(At a Glance)</span>
              </h4>
              <p className={`text-sm sm:text-base ${styles.text} font-semibold mb-2 leading-relaxed`}>{currentRecommendation}</p>
              <div className={`flex items-center gap-2 text-xs sm:text-sm font-medium mt-3 px-3 py-2 rounded-lg ${styles.bg} border ${styles.border}`}>
                {result.urgencyLevel === TriageLevel.EMERGENCY && (
                  <><span className="text-2xl">🚨</span><span className="text-red-200">Seek immediate medical attention</span></>
                )}
                {result.urgencyLevel === TriageLevel.PRIORITY && (
                  <><span className="text-2xl">⚠️</span><span className="text-orange-200">See a doctor within 24-48 hours</span></>
                )}
                {result.urgencyLevel === TriageLevel.ROUTINE && (
                  <><span className="text-2xl">ℹ️</span><span className="text-sky-200">Schedule a regular appointment</span></>
                )}
                {result.urgencyLevel === TriageLevel.SELF_CARE && (
                  <><span className="text-2xl">✅</span><span className="text-green-200">Monitor at home with self-care</span></>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-4">
          <p className="text-xs text-slate-400 mb-3 font-medium">{t('translateToLabel')}</p>
          <div className="flex flex-wrap gap-2">
             <button onClick={() => { setTranslatedContent(null); setCurrentDisplayLocale(uiLocale);}} className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${!translatedContent ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-300 bg-slate-700/50 hover:bg-slate-600/60'}`}>{t('originalLabel')}</button>
            {(Object.keys(outputLanguages) as OutputLocale[]).map(locale => (
                <button
                    key={locale} onClick={() => handleTranslate(locale)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${currentDisplayLocale === locale ? 'bg-cyan-600 text-white shadow-md' : 'text-cyan-300 bg-cyan-900/30 hover:bg-cyan-800/50 border border-cyan-800/30'}`}
                >{outputLanguages[locale].name}</button>
            ))}
          </div>
          {isTranslating && <p className="text-xs text-cyan-400 mt-3 animate-pulse flex items-center gap-2"><span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>{t('translatingLabel')}...</p>}
      </div>

      <Section title={t('triageRecommendation')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
        <p className={`font-semibold ${styles.text}`}>{currentRecommendation}</p>
      </Section>
      
      <Section title={t('triageExplanation')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>}>
        <p>{currentExplanation}</p>
      </Section>

      {/* Oncology-Specific Sections */}
      {result.possibleCancerTypes && result.possibleCancerTypes.length > 0 && (
          <Section title="⚠️ Possible Cancer Considerations" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}>
              <ul className="list-disc pl-5 space-y-2.5">
                  {result.possibleCancerTypes.map((cancer, index) => (
                      <li key={index} className="text-orange-200"><strong className="text-orange-300">• {cancer.split(' - ')[0]}:</strong> {cancer.split(' - ').slice(1).join(' - ')}</li>
                  ))}
              </ul>
              <p className="text-xs text-orange-400 mt-3 bg-orange-950/30 border border-orange-800/40 rounded-lg p-2.5">
                ⚠️ <strong>Important:</strong> These are considerations based on symptoms. Only pathology/biopsy can confirm cancer. Please see an oncologist for proper evaluation.
              </p>
          </Section>
      )}

      {result.likelyNonCancerCauses && result.likelyNonCancerCauses.length > 0 && (
          <Section title="✓ Likely Benign Causes" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
              <ul className="list-disc pl-5 space-y-2">
                  {result.likelyNonCancerCauses.map((cause, index) => (
                      <li key={index} className="text-emerald-200"><strong className="text-emerald-300">• {cause.split(' - ')[0]}:</strong> {cause.split(' - ').slice(1).join(' - ')}</li>
                  ))}
              </ul>
          </Section>
      )}

      {result.treatmentInsights && result.treatmentInsights.length > 0 && (
          <Section title="💊 Treatment & Management Insights" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>}>
              <div className="space-y-3">
                  {result.treatmentInsights.map((insight, index) => (
                      <div key={index} className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-3">
                          <p className="text-slate-200 leading-relaxed">{insight}</p>
                      </div>
                  ))}
              </div>
          </Section>
      )}
      
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
              <div className="space-y-3">
                  {result.citedSources.map((source, index) => (
                    <a 
                      key={index} 
                      href={source.includes('http') ? source : `https://www.google.com/search?q=${encodeURIComponent(source)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 p-3 bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/60 hover:border-cyan-500/50 rounded-lg transition-all duration-200 group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 group-hover:text-cyan-300 transition-colors break-words">{source}</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
              </div>
              <p className="text-xs text-slate-400 mt-4 flex items-start gap-2 bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Sources are provided for educational reference. Always consult with healthcare professionals for medical decisions.</span>
              </p>
          </Section>
      )}
    </div>
  );
};

export default TriageResult;