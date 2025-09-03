
import React, { createContext, useState, useContext, useMemo } from 'react';
import type { Suggestion } from '../types';

export const supportedLanguages = { 'en': 'English', 'es': 'Español', 'fr': 'Français' };
export type Locale = keyof typeof supportedLanguages;
export const outputLanguages = {
  'kn': { name: 'ಕನ್ನಡ', voiceCode: 'kn-IN' }, 'hi': { name: 'हिन्दी', voiceCode: 'hi-IN' },
  'ta': { name: 'தமிழ்', voiceCode: 'ta-IN' }, 'te': { name: 'తెలుగు', voiceCode: 'te-IN' },
  'ml': { name: 'മലയാളം', voiceCode: 'ml-IN' },
};
export type OutputLocale = keyof typeof outputLanguages;

const translations = {
  headerTitle: { en: 'MediBot', es: 'MediBot', fr: 'MediBot' },
  greetingResponse: { en: "Hello there! I'm ready to listen. How can I assist you today?", es: "¡Hola! Estoy listo para escuchar. ¿Cómo puedo ayudarte hoy?", fr: "Bonjour ! Je suis prêt à vous écouter. Comment puis-je vous aider aujourd'hui ?" },
  clearChat: { en: 'Clear Chat', es: 'Limpiar Chat', fr: 'Effacer la Conversation' },
  uploadLabel: { en: 'Upload image', es: 'Subir imagen', fr: 'Télécharger l\'image' },
  sendLabel: { en: 'Send message', es: 'Enviar mensaje', fr: 'Envoyer le message' },
  removeImageLabel: { en: 'Remove image', es: 'Quitar imagen', fr: 'Retirer l\'image' },
  recordSymptomsLabel: { en: 'Record with voice', es: 'Grabar con voz', fr: 'Enregistrer avec la voix' },
  stopRecordingLabel: { en: 'Stop recording', es: 'Detener grabación', fr: 'Arrêter l\'enregistrement' },
  listeningLabel: { en: 'Listening...', es: 'Escuchando...', fr: 'Écoute en cours...' },
  speakLabel: { en: 'Speak the result aloud', es: 'Leer el resultado en voz alta', fr: 'Lire le résultat à haute voix' },
  translateToLabel: { en: 'Translate result to:', es: 'Traducir resultado a:', fr: 'Traduire le résultat en:' },
  translatingLabel: { en: 'Translating', es: 'Traduciendo', fr: 'Traduction en cours' },
  originalLabel: { en: 'Original', es: 'Original', fr: 'Original' },
  interactionSource: { en: 'Source', es: 'Fuente', fr: 'Source' },
  
  // --- Mode Specific ---
  modeTriage: { en: 'Triage', es: 'Triaje', fr: 'Triage' },
  modePharmacy: { en: 'Pharmacy', es: 'Farmacia', fr: 'Pharmacie' },
  modePrecautions: { en: 'Precautions', es: 'Precauciones', fr: 'Précautions' },

  // --- Triage Mode ---
  triageInitialMessage1: { en: "Hello, I'm MediBot in Triage mode. How are you feeling today?", es: "Hola, soy MediBot en modo Triaje. ¿Cómo te sientes hoy?", fr: "Bonjour, je suis MediBot en mode Triage. Comment vous sentez-vous aujourd'hui ?" },
  triageInitialMessage2: { en: "You can describe your symptoms or upload a prescription image.", es: "Puedes describir tus síntomas o subir una imagen de tu receta.", fr: "Vous pouvez décrire vos symptômes ou télécharger une image d'ordonnance." },
  triageInputPlaceholder: { en: 'Describe symptoms or upload a prescription...', es: 'Describe los síntomas o sube una receta...', fr: 'Décrivez les symptômes ou téléchargez une ordonnance...' },
  pharmacyInputPlaceholder: { en: 'Enter medication name or upload pill photo...', es: 'Introduce el nombre del medicamento o sube una foto...', fr: 'Entrez le nom du médicament ou téléchargez une photo...' },
  // Removed duplicate precautionsInputPlaceholder (defined later under Precautions Mode)
  triageSuggestions: {
    en: [{ text: "I have a persistent headache and feel dizzy" }, { text: "My child has a high fever and a rash" }],
    es: [{ text: "Tengo un dolor de cabeza persistente y mareo" }, { text: "Mi hijo tiene fiebre alta y sarpullido" }],
    fr: [{ text: "J'ai un mal de tête persistant et des vertiges" }, { text: "Mon enfant a une forte fièvre et une éruption cutanée" }],
  },
  triageUrgency: { en: 'Urgency', es: 'Urgencia', fr: 'Urgence' },
  triageRecommendation: { en: 'Recommendation', es: 'Recomendación', fr: 'Recommandation' },
  triageExplanation: { en: 'Explanation', es: 'Explicación', fr: 'Explication' },
  triageInteractions: { en: 'Potential Drug Interactions', es: 'Interacciones Potenciales', fr: 'Interactions Médicamenteuses' },
  triageSources: { en: 'Cited Sources', es: 'Fuentes Citadas', fr: 'Sources Citées' },

  // --- Pharmacy Mode ---
    pharmacyInitialMessage1: { en: "Welcome to the Pharmacy. I can help identify medications.", es: "Bienvenido a la Farmacia. Puedo ayudar a identificar medicamentos.", fr: "Bienvenue à la Pharmacie. Je peux vous aider à identifier des médicaments." },
    pharmacyInitialMessage2: { en: "Please type a medication name or upload a clear photo of a pill.", es: "Escribe el nombre de un medicamento o sube una foto clara de una pastilla.", fr: "Veuillez taper le nom d'un médicament ou télécharger une photo claire d'un comprimé." },
    pharmacySuggestions: {
    en: [{ text: "What is Metformin used for?" }, { text: "Identify this pill" }],
    es: [{ text: "¿Para qué se usa la Metformina?" }, { text: "Identificar esta pastilla" }],
    fr: [{ text: "À quoi sert la Metformine ?" }, { text: "Identifier ce comprimé" }],
  },
  medicationName: { en: 'Medication', es: 'Medicamento', fr: 'Médicament' },
  medicationUses: { en: 'Common Uses', es: 'Usos Comunes', fr: 'Utilisations Courantes' },
  medicationMechanism: { en: 'How It Works', es: 'Cómo Funciona', fr: 'Comment Ça Marche' },
  medicationDosage: { en: 'Dosage Information', es: 'Información de Dosis', fr: 'Informations sur la Posologie' },
  dosageAdult: { en: 'Adult', es: 'Adulto', fr: 'Adulte' },
  dosagePediatric: { en: 'Pediatric', es: 'Pediátrico', fr: 'Pédiatrique' },
  medicationSideEffects: { en: 'Common Side Effects', es: 'Efectos Secundarios', fr: 'Effets Secondaires Courants' },
  medicationWarnings: { en: 'Crucial Warnings', es: 'Advertencias Cruciales', fr: 'Avertissements Cruciaux' },

  // --- Precautions Mode ---
  precautionsInitialMessage1: { en: "I'm MediBot, ready to provide health precautions based on my knowledge base.", es: "Soy MediBot, listo para proporcionar precauciones de salud basadas en mi base de conocimientos.", fr: "Je suis MediBot, prêt à fournir des précautions de santé basées sur ma base de connaissances." },
  precautionsInitialMessage2: { en: "What disease or condition would you like to know about?", es: "¿Sobre qué enfermedad o condición te gustaría saber?", fr: "Sur quelle maladie ou condition souhaitez-vous en savoir plus ?" },
  precautionsInputPlaceholder: { en: 'Enter a disease name (e.g., Diabetes)...', es: 'Introduce una enfermedad (ej. Diabetes)...', fr: 'Entrez une maladie (ex. Diabète)...' },
  precautionsSuggestions: {
    en: [{ text: "Precautions for Diabetes" }, { text: "Precautions for Hypertension" }, { text: "Precautions for the common cold" }],
    es: [{ text: "Precauciones para la Diabetes" }, { text: "Precauciones para la Hipertensión" }, { text: "Precauciones para el resfriado común" }],
    fr: [{ text: "Précautions pour le diabète" }, { text: "Précautions pour l'hypertension" }, { text: "Précautions pour le rhume" }],
  },
  precautionDisease: { en: 'Condition', es: 'Condición', fr: 'Condition' },
  precautionOverview: { en: 'Overview', es: 'Resumen', fr: 'Aperçu' },
  precautionHygiene: { en: 'Hygiene Practices', es: 'Prácticas de Higiene', fr: 'Pratiques d\'Hygiène' },
  precautionDiet: { en: 'Dietary Recommendations', es: 'Recomendaciones Dietéticas', fr: 'Recommandations Alimentaires' },
  precautionLifestyle: { en: 'Lifestyle Adjustments', es: 'Ajustes de Estilo de Vida', fr: 'Ajustements de Style de Vie' },
  precautionCheckups: { en: 'Medical Check-ups', es: 'Controles Médicos', fr: 'Bilans de Santé' },
};

type TranslationKey = keyof typeof translations;

// FIX: Updated LanguageContextType to provide a more specific return type for the `t` function.
// This resolves a large number of TypeScript errors where the return type was previously too broad.
interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: <K extends TranslationKey>(key: K) => typeof translations[K][Locale];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en');

  // FIX: Removed explicit, broad return type to allow for better type inference based on the interface.
  const t = <K extends TranslationKey>(key: K) => {
    const translation = translations[key];
    // This type assertion is safe because we control the structure
    return (translation?.[locale] || key) as typeof translations[K][Locale];
  };
  
  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
