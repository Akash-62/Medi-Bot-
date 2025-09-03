import { GoogleGenAI, Type } from "@google/genai";
import { TriageLevel, type TriageResultData, type MedicationResultData, type PrecautionResultData } from '../types';
import { supportedLanguages, outputLanguages, Locale, OutputLocale } from "../contexts/LanguageContext";
import { retrieveDocuments } from './ragService';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- TRIAGE MODE ---
const triageSchema = {
  type: Type.OBJECT,
  properties: {
    urgencyLevel: { type: Type.STRING, enum: ["Emergency", "Priority", "Routine", "Self-care"] },
    recommendation: { type: Type.STRING },
    explanation: { type: Type.STRING },
    drugInteractions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          drugs: { type: Type.STRING },
          risk: { type: Type.STRING },
          source: { type: Type.STRING }
        },
        required: ["drugs", "risk", "source"],
      },
    },
    citedSources: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["urgencyLevel", "recommendation", "explanation", "drugInteractions", "citedSources"],
};

const createTriageSystemInstruction = (locale: Locale): string => {
  const languageName = supportedLanguages[locale];
  return `You are AuraMed, in TRIAGE mode. Your persona is an empathetic, clear, and reassuring AI healthcare assistant. Your goal is to analyze patient symptoms or prescriptions and provide a structured triage recommendation.
IMPORTANT: You are an AI assistant, not a doctor. Your analysis is for informational purposes only. You MUST ALWAYS start your explanation with this exact disclaimer: "Disclaimer: This is an AI-generated analysis and not a substitute for professional medical advice. Please consult a qualified healthcare provider for any health concerns."
- Analyze the user's input (text and/or image) for symptoms or medications.
- Determine the urgency level (Emergency, Priority, Routine, Self-care).
- Provide a clear, actionable recommendation.
- Craft a detailed, empathetic explanation, directly referencing the user's input and integrating citations naturally.
- Identify and list any potential drug interactions.
- You MUST respond ONLY with a valid JSON object conforming to the schema.
- Provide all text-based analysis in ${languageName}.`;
}

// --- PHARMACY MODE ---
const medicationSchema = {
    type: Type.OBJECT,
    properties: {
        medicationName: { type: Type.STRING },
        commonUses: { type: Type.ARRAY, items: { type: Type.STRING } },
        mechanismOfAction: { type: Type.STRING },
        dosageInformation: {
            type: Type.OBJECT,
            properties: {
                adult: { type: Type.STRING },
                pediatric: { type: Type.STRING }
            },
            required: ['adult', 'pediatric']
        },
        commonSideEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
        crucialWarnings: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["medicationName", "commonUses", "mechanismOfAction", "dosageInformation", "commonSideEffects", "crucialWarnings"]
};

const createPharmacySystemInstruction = (locale: Locale): string => {
    const languageName = supportedLanguages[locale];
    return `You are AuraMed, in PHARMACY mode. Your persona is an expert AI pharmacist. Your goal is to identify a medication from text or an image and provide detailed, structured information.
IMPORTANT: You are an AI assistant, not a pharmacist or doctor. Your analysis is for informational purposes only and is not a substitute for professional medical advice. ALWAYS advise the user to consult a healthcare provider or pharmacist before taking any medication.
- From the user's text or image, identify the medication. If the image is unclear or the text is ambiguous, state that you cannot identify it and advise consulting a professional.
- Provide a comprehensive analysis covering common uses, mechanism of action, general dosage information, common side effects, and crucial warnings.
- The 'crucialWarnings' section is for the most critical information, such as severe contraindications or life-threatening side effects.
- You MUST respond ONLY with a valid JSON object conforming to the schema.
- Provide all text-based analysis in ${languageName}.`;
};

// --- PRECAUTIONS MODE (RAG ENABLED) ---
const precautionSchema = {
    type: Type.OBJECT,
    properties: {
        diseaseName: { type: Type.STRING },
        overview: { type: Type.STRING },
        hygienePractices: { type: Type.ARRAY, items: { type: Type.STRING } },
        dietaryRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        lifestyleAdjustments: { type: Type.ARRAY, items: { type: Type.STRING } },
        medicalCheckups: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["diseaseName", "overview", "hygienePractices", "dietaryRecommendations", "lifestyleAdjustments", "medicalCheckups"]
};

const createPrecautionsSystemInstruction = (locale: Locale, context: string, userQuery: string): string => {
    const languageName = supportedLanguages[locale];
    return `You are AuraMed, in PRECAUTIONS mode. Your persona is a knowledgeable and encouraging public health advisor. Your goal is to provide preventative health information for a given disease or condition based *only* on the provided context.
IMPORTANT: You are an AI assistant. This information is for general educational purposes and is not a substitute for a personalized medical plan from a doctor.
- You MUST base your answer *primarily* on the following trusted context. Do not add information that is not present in the context. If the context is empty or irrelevant, state that you do not have information on that specific topic.
- From the context, extract and structure the information into the required JSON format to answer the user's query.
- Maintain a positive and empowering tone.
- You MUST respond ONLY with a valid JSON object conforming to the schema.
- Provide all text-based analysis in ${languageName}.

CONTEXT:
"""
${context || 'No information available.'}
"""

User Query: "${userQuery}"
`;
};


// --- Generic Error Handler ---
const handleApiError = (error: unknown, defaultMessage: string): { explanation: string, recommendation: string } => {
    console.error("Error calling Gemini API:", error);
    let errorMessage = defaultMessage;
    if (error instanceof Error) {
        if (error.message.includes('API key')) {
            errorMessage = "There seems to be an issue with the system configuration. Please contact support.";
        } else if (error.message.includes('JSON')) {
            errorMessage = "I received an unexpected response from my knowledge base. I'm unable to process it right now. Please try rephrasing your query.";
        }
    }
    return {
        recommendation: "Consult a healthcare professional.",
        explanation: `Disclaimer: This is an AI-generated analysis and not a substitute for professional medical advice. ${errorMessage}`
    };
}

// --- API Functions ---

export const getTriageRecommendation = async (
  prompt: string, 
  locale: Locale,
  image?: { mimeType: string; data: string }
): Promise<TriageResultData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }, ...(image ? [{ inlineData: { mimeType: image.mimeType, data: image.data } }] : [])] },
      config: {
        systemInstruction: createTriageSystemInstruction(locale),
        responseMimeType: 'application/json',
        responseSchema: triageSchema,
      }
    });
    return JSON.parse(response.text.trim()) as TriageResultData;
  } catch (error) {
    const errorDetails = handleApiError(error, "An unexpected error occurred while analyzing your triage request.");
    return {
      urgencyLevel: TriageLevel.ROUTINE,
      recommendation: errorDetails.recommendation,
      explanation: errorDetails.explanation,
      drugInteractions: [],
      citedSources: ["System Error"]
    };
  }
};

export const getMedicationInfo = async (
  prompt: string, 
  locale: Locale,
  image?: { mimeType: string; data: string }
): Promise<MedicationResultData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }, ...(image ? [{ inlineData: { mimeType: image.mimeType, data: image.data } }] : [])] },
      config: {
        systemInstruction: createPharmacySystemInstruction(locale),
        responseMimeType: 'application/json',
        responseSchema: medicationSchema,
      }
    });
    return JSON.parse(response.text.trim()) as MedicationResultData;
  } catch (error) {
     const errorDetails = handleApiError(error, "An unexpected error occurred while identifying the medication.");
     return {
        medicationName: "Analysis Failed",
        commonUses: ["N/A"],
        mechanismOfAction: "N/A",
        dosageInformation: { adult: "N/A", pediatric: "N/A" },
        commonSideEffects: ["N/A"],
        crucialWarnings: [errorDetails.explanation.replace('Disclaimer: This is an AI-generated analysis and not a substitute for professional medical advice. ', '')]
     }
  }
};

export const getPrecautionsInfo = async (
  prompt: string, 
  locale: Locale
): Promise<PrecautionResultData> => {
  // FIX: Moved `context` declaration out of the try block to make it accessible in the catch block.
  let context = '';
  try {
    // RAG Step 1: Retrieve relevant documents from the local knowledge base.
    context = retrieveDocuments(prompt);

    // RAG Step 2: Generate content with the retrieved context augmented in the prompt.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] }, // We still send the original prompt for context.
      config: {
        systemInstruction: createPrecautionsSystemInstruction(locale, context, prompt),
        responseMimeType: 'application/json',
        responseSchema: precautionSchema,
      }
    });
    return JSON.parse(response.text.trim()) as PrecautionResultData;
  } catch (error) {
    const errorDetails = handleApiError(error, "An unexpected error occurred while fetching precaution information.");
    const overviewText = context ? 
        errorDetails.explanation.replace('Disclaimer: This is an AI-generated analysis and not a substitute for professional medical advice. ', '')
        : "I'm sorry, but I don't have specific information on that topic in my knowledge base at the moment.";

    return {
        diseaseName: "Analysis Failed",
        overview: overviewText,
        hygienePractices: [],
        dietaryRecommendations: [],
        lifestyleAdjustments: [],
        medicalCheckups: []
    }
  }
};


export const translateText = async (
  textToTranslate: string,
  targetLocale: OutputLocale
): Promise<string> => {
  if (!textToTranslate) return "";
  const targetLanguage = outputLanguages[targetLocale]?.name || 'English';
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following text to ${targetLanguage}. IMPORTANT: Respond ONLY with the translated text, with no additional commentary or explanations.\n\nText to translate:\n"""\n${textToTranslate}\n"""`,
        config: { temperature: 0.1 }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error translating text:", error);
    return `[Translation failed for ${targetLanguage}]`;
  }
};