
export type AppMode = 'triage' | 'pharmacy' | 'precautions';

export enum TriageLevel {
  EMERGENCY = 'Emergency',
  PRIORITY = 'Priority',
  ROUTINE = 'Routine',
  SELF_CARE = 'Self-care',
}

export interface DrugInteraction {
  drugs: string;
  risk: string;
  source: string;
}

export interface TriageResultData {
  urgencyLevel: TriageLevel;
  recommendation: string;
  explanation: string;
  drugInteractions: DrugInteraction[];
  citedSources: string[];
  // Oncology-specific fields (optional for backward compatibility)
  possibleCancerTypes?: string[];
  likelyNonCancerCauses?: string[];
  treatmentInsights?: string[];
}

export interface MedicationResultData {
    medicationName: string;
    commonUses: string[];
    mechanismOfAction: string;
    dosageInformation: {
        adult: string;
        pediatric: string;
    };
    commonSideEffects: string[];
    crucialWarnings: string[];
}

export interface PrecautionResultData {
    diseaseName: string;
    overview: string;
    hygienePractices: string[];
    dietaryRecommendations: string[];
    lifestyleAdjustments: string[];
    medicalCheckups: string[];
}


export interface Suggestion {
  text: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  imagePreview?: string;
  triageResult?: TriageResultData;
  medicationResult?: MedicationResultData;
  precautionResult?: PrecautionResultData;
  isTyping?: boolean;
  suggestions?: Suggestion[];
}
