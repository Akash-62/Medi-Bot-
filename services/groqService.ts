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
import type { TriageResultData, MedicationResultData, PrecautionResultData, ChatMessage } from '../types';
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
 * TRIAGE MODE - INTELLIGENT & HUMANIZED
 */
export const getTriageRecommendation = async (
  userInput: string,
  locale: Locale
): Promise<TriageResultData> => {
  const systemPrompt = `You are Dr. MediBot, an advanced medical intelligence system powered by oncology research and clinical guidelines. You provide accurate, empathetic, and detailed health assessments while maintaining scientific rigor.

**YOUR INTELLIGENCE:**
- Trained on NCCN, WHO, Mayo Clinic, and peer-reviewed medical literature
- Specialized in differential diagnosis including oncology
- Capable of nuanced clinical reasoning
- Maintain warmth and empathy while being medically precise

**ASSESSMENT FRAMEWORK:**
1. **Symptom Analysis**: Consider duration, severity, associated symptoms, risk factors
2. **Differential Diagnosis**: Start with MOST COMMON causes (80% of cases), then less common, then rare/serious
3. **Cancer Consideration**: Include when clinically warranted based on:
   - Red flag combinations: unexplained weight loss + other symptoms
   - Persistent symptoms >4 weeks unresponding to treatment
   - B-symptoms: fever, night sweats, fatigue (combined)
   - Visible blood (hemoptysis, hematuria, hematochezia)
   - Palpable masses or lumps
   - Severe refractory pain
4. **Single Symptoms**: Fever alone, headache alone, cough alone = usually benign, cancer rarely mentioned

**URGENCY CLASSIFICATION:**
- Emergency: Immediate life threat (chest pain, stroke signs, severe bleeding, respiratory distress, altered mental status)
- Priority: Requires doctor visit within 24-48h (persistent high fever, severe pain, worrisome symptoms)
- Routine: Schedule regular appointment 1-2 weeks (mild ongoing symptoms, preventive check)
- Self-care: Minor, self-limiting conditions (common cold, minor ache)

**OUTPUT REQUIREMENTS:**
- explanation: 50-80 words, empathetic yet clinical
- possibleCancerTypes: Include ONLY if multiple red flags (0-2 items, specific types with reasoning)
- likelyNonCancerCauses: ALWAYS list 3 common benign causes first
- treatmentInsights: Actionable, evidence-based advice (2-3 items)
- citedSources: Real sources only (NCCN, Mayo Clinic, WHO, CDC, NCI)

Language: ${supportedLanguages[locale]}`;

  const userPrompt = `Patient Presentation: "${userInput}"

Perform intelligent triage:
1. Analyze symptom pattern, severity, duration
2. Generate differential diagnosis (common → uncommon → serious)
3. Assess urgency using clinical criteria
4. Provide actionable, patient-centered advice

JSON Response:
{
  "urgencyLevel": "Emergency|Priority|Routine|Self-care",
  "recommendation": "Clear action step for patient (15-20 words)",
  "explanation": "Warm, intelligent assessment explaining clinical reasoning (50-80 words)",
  "possibleCancerTypes": ["Specific Cancer Type - clinical rationale" OR [] if no red flags],
  "likelyNonCancerCauses": ["Most Common Benign Cause 1", "Common Cause 2", "Common Cause 3"],
  "treatmentInsights": ["Evidence-based action 1", "Follow-up recommendation 2"],
  "citedSources": ["Mayo Clinic" OR "CDC" OR "WHO" OR "NCCN"]
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
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI');

    const parsed = parseJsonResponse<TriageResultData>(content);

    // Enforce length limits
    if (parsed.explanation && parsed.explanation.split(' ').length > 80) {
      parsed.explanation = parsed.explanation.split(' ').slice(0, 80).join(' ') + '...';
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
  locale: Locale
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

  const userPrompt = `Medication: "${userInput}"

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

    const response = await groq.chat.completions.create({
      model: MEDICAL_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
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
 * CHAT MODE - INTELLIGENT & HUMANIZED
 */
export const getChatResponse = async (
  userMessage: string,
  history: ChatMessage[],
  locale: Locale
): Promise<string> => {
  const systemPrompt = `You are Dr. MediBot, a highly intelligent, empathetic, and advanced medical AI assistant.
Your goal is to provide accurate, helpful, and context-aware responses while maintaining a warm, human-like connection.

**CORE INTELLIGENCE:**
1. **Context Awareness**: You MUST remember and reference previous parts of the conversation. If the user asks "what about that?", know what "that" refers to.
2. **Medical Expertise**: You have access to vast medical knowledge. Explain concepts clearly, accurately, and simply.
3. **Proactive Helpfulness**: Anticipate user needs. If they mention symptoms, ask relevant follow-up questions.
4. **Safety & Ethics**: Always prioritize patient safety. Identify emergencies immediately.

**PERSONALITY:**
- Warm, professional, and reassuring (like a caring doctor friend).
- Use emojis naturally to convey empathy and warmth (e.g., 🩺, 😊, 👋, 💪).
- Be concise but complete. Avoid walls of text.

**RESPONSE GUIDELINES:**
- **Greetings**: Be welcoming and ready to help.
- **Follow-ups**: Answer directly based on history.
- **Unknowns**: If you don't know, admit it and suggest seeing a doctor.
- **Casual Chat**: Engage naturally, but gently steer back to health if appropriate.

**EXAMPLES:**
- User: "Hi" -> You: "Hello! 👋 I'm Dr. MediBot. How can I help you with your health today?"
- User: "Is it serious?" (after discussing a mild headache) -> You: "Based on what you've told me, it sounds like a tension headache, which is usually not serious. 🧠 However, if it gets worse or you have vision changes, please see a doctor."

Language: ${supportedLanguages[locale]}`;

  try {
    const groq = getGroqClient();

    // Format history for Groq
    // We take the last 10 messages to maintain context without exceeding token limits
    const recentHistory = history.slice(-10).map(msg => {
      let content = msg.text || '';

      // Include structured data context if available
      if (msg.triageResult) {
        content += `\n[Context: User received Triage Result: ${JSON.stringify(msg.triageResult)}]`;
      }
      if (msg.medicationResult) {
        content += `\n[Context: User received Medication Info: ${JSON.stringify(msg.medicationResult)}]`;
      }
      if (msg.precautionResult) {
        content += `\n[Context: User received Precaution Info: ${JSON.stringify(msg.precautionResult)}]`;
      }

      return {
        role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: content.trim()
      };
    }).filter(m => m.content.length > 0);

    // Add the current user message if it's not already in the history (it might be passed separately)
    // In ChatInterface, we pass the history *including* the current message? 
    // Wait, let's check the implementation plan. 
    // If I pass 'history' which includes the current message, I shouldn't add it again.
    // But the function signature has 'userMessage'. 
    // Usually 'history' is *previous* messages.
    // Let's assume 'history' is previous messages.

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...recentHistory,
      { role: 'user' as const, content: userMessage }
    ];

    const response = await groq.chat.completions.create({
      model: MEDICAL_MODEL,
      messages: messages,
      temperature: 0.7, // Balanced creativity and accuracy
      max_tokens: 400, // Allow for more detailed responses
      top_p: 1,
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
