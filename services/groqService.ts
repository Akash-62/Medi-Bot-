/**
 * Groq API Medical LLM Service - OPTIMIZED FOR MOBILE
 * 
 * Changes:
 * - Drastically reduced system prompts (90% shorter)
 * - Enforced response length limits
 * - Prevents hallucinations with strict constraints
 * - Mobile-friendly (prevents crashes)
 */

import Groq from 'groq-sdk';
import type { TriageResultData, MedicationResultData, PrecautionResultData } from '../types';
import { TriageLevel } from '../types';
import { retrieveDocuments } from './ragService';
import { Locale, supportedLanguages } from '../contexts/LanguageContext';

// Initialize Groq client
const getGroqClient = () => {
  const apiKey = (import.meta as any).env?.VITE_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not found. Please add VITE_GROQ_API_KEY to your .env file');
  }
  
  return new Groq({ apiKey, dangerouslyAllowBrowser: true });
};

const MEDICAL_MODEL = 'llama-3.3-70b-versatile';

/**
 * Parse JSON from LLM response
 */
const parseJsonResponse = <T>(response: string): T => {
  let cleaned = response.trim();
  
  if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
  if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
  
  try {
    return JSON.parse(cleaned.trim());
  } catch (error) {
    console.error('JSON parse error:', error);
    throw new Error('Failed to parse medical response as JSON');
  }
};

/**
 * TRIAGE MODE - OPTIMIZED
 */
export const getTriageRecommendation = async (
  userInput: string,
  locale: Locale,
  imageData?: { mimeType: string; data: string }
): Promise<TriageResultData> => {
  const systemPrompt = `You are a medical AI with oncology expertise. Provide BRIEF, accurate assessments.

**STRICT LIMITS:**
- explanation: MAX 60 words
- possibleCancerTypes: MAX 2 items, 10 words each
- likelyNonCancerCauses: MAX 3 items, brief
- treatmentInsights: MAX 2 items, brief
- citedSources: ONLY use NCCN, Mayo Clinic, NCI, WHO, CDC
- NEVER fabricate information

**Urgency:**
- Emergency: Life-threatening, ER now
- Priority: See doctor 24-48h
- Routine: Schedule within 2 weeks
- Monitor at home: Low concern

Language: ${supportedLanguages[locale]}`;

  const userPrompt = `Symptoms: "${userInput}"${imageData ? ' [Image provided]' : ''}

Return JSON:
{
  "urgencyLevel": "Emergency|Priority|Routine|Self-care",
  "recommendation": "brief action",
  "explanation": "concise assessment (60 words max)",
  "possibleCancerTypes": ["type - brief reason"],
  "likelyNonCancerCauses": ["cause"],
  "treatmentInsights": ["insight"],
  "citedSources": ["real source"]
}`;

  try {
    const groq = getGroqClient();
    
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      imageData ? {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: `data:${imageData.mimeType};base64,${imageData.data}` } }
        ]
      } : { role: 'user', content: userPrompt }
    ];

    const response = await groq.chat.completions.create({
      model: MEDICAL_MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 500, // Reduced from 2000+
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI');

    const parsed = parseJsonResponse<TriageResultData>(content);
    
    // Enforce length limits
    if (parsed.explanation && parsed.explanation.split(' ').length > 70) {
      parsed.explanation = parsed.explanation.split(' ').slice(0, 70).join(' ') + '...';
    }
    if (parsed.possibleCancerTypes && parsed.possibleCancerTypes.length > 2) {
      parsed.possibleCancerTypes = parsed.possibleCancerTypes.slice(0, 2);
    }
    if (parsed.likelyNonCancerCauses && parsed.likelyNonCancerCauses.length > 3) {
      parsed.likelyNonCancerCauses = parsed.likelyNonCancerCauses.slice(0, 3);
    }

    return parsed;

  } catch (error: any) {
    console.error('[Groq Triage Error]:', error);
    return {
      urgencyLevel: TriageLevel.ROUTINE,
      recommendation: 'Consult a healthcare provider for proper evaluation',
      explanation: 'Unable to analyze symptoms. Please see a doctor for accurate assessment.',
      drugInteractions: [],
      citedSources: ['Mayo Clinic'],
      possibleCancerTypes: [],
      likelyNonCancerCauses: ['Multiple benign conditions possible'],
      treatmentInsights: ['Professional evaluation needed']
    };
  }
};

/**
 * PHARMACY MODE - OPTIMIZED
 */
export const getMedicationInfo = async (
  userInput: string,
  locale: Locale,
  imageData?: { mimeType: string; data: string }
): Promise<MedicationResultData> => {
  const systemPrompt = `You are a pharmacology AI. Provide BRIEF medication information.

**LIMITS:**
- commonUses: MAX 3 items
- mechanismOfAction: MAX 30 words
- dosageInformation: Brief (adult/pediatric)
- commonSideEffects: MAX 4 items
- crucialWarnings: MAX 3 items
- ONLY cite: FDA.gov, Drugs.com, Mayo Clinic, NIH
- NEVER make up drug names or dosages

Language: ${supportedLanguages[locale]}`;

  const userPrompt = `Medication: "${userInput}"${imageData ? ' [Pill image provided]' : ''}

Return JSON:
{
  "medicationName": "name",
  "commonUses": ["use"],
  "mechanismOfAction": "how it works (30 words max)",
  "dosageInformation": {"adult": "dose", "pediatric": "dose"},
  "commonSideEffects": ["effect"],
  "crucialWarnings": ["warning"],
  "citedSources": ["real source"]
}`;

  try {
    const groq = getGroqClient();
    
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      imageData ? {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: `data:${imageData.mimeType};base64,${imageData.data}` } }
        ]
      } : { role: 'user', content: userPrompt }
    ];

    const response = await groq.chat.completions.create({
      model: MEDICAL_MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 400,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response');

    return parseJsonResponse<MedicationResultData>(content);

  } catch (error) {
    console.error('[Groq Pharmacy Error]:', error);
    return {
      medicationName: 'Unknown',
      commonUses: ['Unable to identify'],
      mechanismOfAction: 'Please consult a pharmacist',
      dosageInformation: { adult: 'Consult healthcare provider', pediatric: 'Consult healthcare provider' },
      commonSideEffects: ['Varies by medication'],
      crucialWarnings: ['Always consult a healthcare provider before taking any medication']
    };
  }
};

/**
 * PRECAUTIONS MODE - OPTIMIZED WITH RAG
 */
export const getPrecautionsInfo = async (
  userInput: string,
  locale: Locale
): Promise<PrecautionResultData> => {
  const retrievedDocs = await retrieveDocuments(userInput);
  const context = Array.isArray(retrievedDocs) && retrievedDocs.length > 0
    ? retrievedDocs.map(d => d.content).join('\n\n')
    : 'No specific disease information found. Provide general health advice.';

  const systemPrompt = `You are a public health AI. Provide BRIEF prevention guidance using the provided context.

**LIMITS:**
- overview: MAX 40 words
- hygienePractices: MAX 3 items, brief
- dietaryRecommendations: MAX 3 items, brief
- lifestyleAdjustments: MAX 3 items, brief
- medicalCheckups: MAX 3 items, brief
- ONLY cite: WHO, CDC, NIH, Mayo Clinic
- Use provided context when available

Context: ${context.substring(0, 500)}

Language: ${supportedLanguages[locale]}`;

  const userPrompt = `Disease/Topic: "${userInput}"

Return JSON:
{
  "diseaseName": "name",
  "overview": "brief description (40 words max)",
  "hygienePractices": ["practice"],
  "dietaryRecommendations": ["recommendation"],
  "lifestyleAdjustments": ["adjustment"],
  "medicalCheckups": ["checkup"],
  "citedSources": ["real source"]
}`;

  try {
    const groq = getGroqClient();

    const response = await groq.chat.completions.create({
      model: MEDICAL_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 400,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response');

    return parseJsonResponse<PrecautionResultData>(content);

  } catch (error) {
    console.error('[Groq Precautions Error]:', error);
    return {
      diseaseName: userInput,
      overview: 'Unable to retrieve information. Please consult healthcare provider.',
      hygienePractices: ['Maintain good hygiene'],
      dietaryRecommendations: ['Balanced diet recommended'],
      lifestyleAdjustments: ['Regular exercise', 'Adequate sleep'],
      medicalCheckups: ['Annual physical examination']
    };
  }
};

/**
 * CHAT MODE - OPTIMIZED
 */
export const getChatResponse = async (
  userMessage: string,
  locale: Locale
): Promise<string> => {
  const systemPrompt = `You are a friendly medical AI assistant. Keep responses under 50 words. Be helpful but brief.

Language: ${supportedLanguages[locale]}`;

  try {
    const groq = getGroqClient();

    const response = await groq.chat.completions.create({
      model: MEDICAL_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return response.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

  } catch (error) {
    console.error('[Groq Chat Error]:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
};

/**
 * TRANSLATION SERVICE
 */
export const translateTextWithGroq = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  try {
    const groq = getGroqClient();
    
    const response = await groq.chat.completions.create({
      model: MEDICAL_MODEL,
      messages: [
        { 
          role: 'system', 
          content: `Translate medical text to ${targetLanguage}. Keep translation accurate and brief. Return ONLY the translation, no explanations.` 
        },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('[Groq Translation Error]:', error);
    return text;
  }
};

/**
 * CHECK AVAILABILITY
 */
export const checkGroqAvailability = (): boolean => {
  try {
    const apiKey = (import.meta as any).env?.VITE_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    return !!apiKey && apiKey.length > 10;
  } catch {
    return false;
  }
};
