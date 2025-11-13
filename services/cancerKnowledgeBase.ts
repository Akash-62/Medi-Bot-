/**
 * Cancer Drug Knowledge Base
 * Comprehensive database of oncology medications
 */

export interface CancerDrug {
  name: string;
  genericName?: string;
  brandNames: string[];
  drugClass: 'chemotherapy' | 'immunotherapy' | 'targeted-therapy' | 'hormone-therapy' | 'supportive-care';
  cancerTypes: string[];
  mechanism: string;
  administration: {
    route: 'IV' | 'Oral' | 'Subcutaneous' | 'Intramuscular' | 'Topical';
    dosage: string;
    frequency: string;
  };
  sideEffects: {
    common: string[];
    serious: string[];
    rare: string[];
  };
  monitoring: string[];
  contraindications: string[];
  drugInteractions: Array<{
    drug: string;
    severity: 'Major' | 'Moderate' | 'Minor';
    effect: string;
  }>;
  patientGuidance: string[];
  clinicalNotes?: string;
}

export const cancerDrugDatabase: Record<string, CancerDrug> = {
  'cisplatin': {
    name: 'Cisplatin',
    genericName: 'Cisplatin',
    brandNames: ['Platinol', 'Platinol-AQ'],
    drugClass: 'chemotherapy',
    cancerTypes: ['testicular', 'ovarian', 'bladder', 'lung', 'head-and-neck', 'esophageal'],
    mechanism: 'Platinum-based alkylating agent that crosslinks DNA strands, preventing cell division and inducing apoptosis',
    administration: {
      route: 'IV',
      dosage: '50-100 mg/m² per cycle',
      frequency: 'Every 3-4 weeks (varies by protocol)'
    },
    sideEffects: {
      common: ['Nausea', 'Vomiting', 'Nephrotoxicity', 'Ototoxicity', 'Fatigue', 'Anemia'],
      serious: ['Acute kidney injury', 'Hearing loss', 'Severe myelosuppression', 'Anaphylaxis', 'Neurotoxicity'],
      rare: ['Leukoencephalopathy', 'Hemolytic uremic syndrome', 'Seizures']
    },
    monitoring: [
      'Kidney function (BUN, creatinine) before each dose',
      'Hearing tests (audiometry)',
      'Complete blood count (CBC)',
      'Electrolytes (magnesium, potassium, calcium)',
      'Neurological exam'
    ],
    contraindications: [
      'Severe renal impairment (CrCl <60 mL/min)',
      'Pre-existing hearing impairment',
      'History of severe allergic reaction to platinum compounds',
      'Pregnancy (Category D)'
    ],
    drugInteractions: [
      { drug: 'Aminoglycosides', severity: 'Major', effect: 'Increased nephrotoxicity and ototoxicity' },
      { drug: 'Loop diuretics (furosemide)', severity: 'Major', effect: 'Enhanced ototoxicity' },
      { drug: 'Phenytoin', severity: 'Moderate', effect: 'Decreased phenytoin levels' },
      { drug: 'Live vaccines', severity: 'Major', effect: 'Risk of vaccine-induced infection' }
    ],
    patientGuidance: [
      'Aggressive hydration (2-3L fluids daily) to protect kidneys',
      'Report ringing in ears or hearing changes immediately',
      'Avoid NSAIDs (ibuprofen) during treatment',
      'Use reliable contraception during and 6 months after treatment',
      'Monitor for signs of infection (fever >100.4°F)'
    ],
    clinicalNotes: 'Pre-hydration and post-hydration protocols are critical to minimize nephrotoxicity. Consider mannitol diuresis.'
  },

  'pembrolizumab': {
    name: 'Pembrolizumab',
    genericName: 'Pembrolizumab',
    brandNames: ['Keytruda'],
    drugClass: 'immunotherapy',
    cancerTypes: ['melanoma', 'NSCLC', 'head-and-neck', 'hodgkin-lymphoma', 'urothelial', 'MSI-H/dMMR-tumors', 'gastric', 'cervical'],
    mechanism: 'PD-1 checkpoint inhibitor that blocks PD-1 receptor on T cells, unleashing immune system to attack cancer cells',
    administration: {
      route: 'IV',
      dosage: '200 mg or 400 mg',
      frequency: 'Every 3 weeks (200mg) or every 6 weeks (400mg)'
    },
    sideEffects: {
      common: ['Fatigue', 'Musculoskeletal pain', 'Diarrhea', 'Rash', 'Pruritus', 'Decreased appetite'],
      serious: [
        'Immune-related pneumonitis',
        'Immune-related colitis',
        'Immune-related hepatitis',
        'Immune-related nephritis',
        'Immune-related endocrinopathies (thyroid, adrenal, pituitary)',
        'Severe infusion reactions'
      ],
      rare: ['Myocarditis', 'Encephalitis', 'Guillain-Barré syndrome', 'Type 1 diabetes']
    },
    monitoring: [
      'Thyroid function (TSH, T3, T4) at baseline and periodically',
      'Liver enzymes (ALT, AST, bilirubin)',
      'Kidney function (creatinine)',
      'Blood glucose',
      'Cortisol/ACTH if adrenal insufficiency suspected',
      'Chest imaging if respiratory symptoms'
    ],
    contraindications: [
      'No absolute contraindications, but use caution in autoimmune disease history',
      'Pregnancy (can cause fetal harm)',
      'Active severe immune-mediated conditions'
    ],
    drugInteractions: [
      { drug: 'Immunosuppressants', severity: 'Major', effect: 'May reduce pembrolizumab efficacy' },
      { drug: 'Systemic corticosteroids', severity: 'Moderate', effect: 'Use only for immune-related adverse events' },
      { drug: 'Live vaccines', severity: 'Major', effect: 'Avoid during treatment and for 3 months after' }
    ],
    patientGuidance: [
      'Report any new or worsening cough, shortness of breath immediately',
      'Watch for severe diarrhea or abdominal pain (colitis warning)',
      'Monitor for signs of thyroid dysfunction (fatigue, weight changes)',
      'Report unusual weakness or dizziness (adrenal insufficiency)',
      'Infusion reactions usually occur during first few doses',
      'Carry medical alert card indicating immunotherapy treatment'
    ],
    clinicalNotes: 'Immune-related adverse events can occur weeks to months after last dose. May require permanent discontinuation and high-dose steroids.'
  },

  'trastuzumab': {
    name: 'Trastuzumab',
    genericName: 'Trastuzumab',
    brandNames: ['Herceptin', 'Herzuma', 'Ogivri', 'Ontruzant', 'Trazimera'],
    drugClass: 'targeted-therapy',
    cancerTypes: ['HER2-positive breast cancer', 'HER2-positive gastric/GEJ cancer'],
    mechanism: 'Monoclonal antibody targeting HER2 protein, blocking HER2 signaling and promoting antibody-dependent cellular cytotoxicity',
    administration: {
      route: 'IV',
      dosage: 'Loading: 8 mg/kg, then 6 mg/kg maintenance',
      frequency: 'Every 3 weeks (or weekly 4mg/kg after 8mg/kg load)'
    },
    sideEffects: {
      common: ['Headache', 'Diarrhea', 'Nausea', 'Chills', 'Fever', 'Infection', 'Insomnia'],
      serious: ['Cardiotoxicity (decreased LVEF)', 'Congestive heart failure', 'Infusion reactions', 'Pulmonary toxicity'],
      rare: ['Anaphylaxis', 'Severe pulmonary reactions', 'Embryo-fetal toxicity']
    },
    monitoring: [
      'Left ventricular ejection fraction (LVEF) via ECHO or MUGA at baseline and every 3 months',
      'Discontinue if LVEF drops >10% from baseline or falls below institutional limits',
      'Monitor for infusion reactions during administration',
      'Pregnancy test before initiation (teratogenic)'
    ],
    contraindications: [
      'Pre-existing cardiac dysfunction or heart failure',
      'Recent myocardial infarction',
      'Uncontrolled arrhythmias',
      'Pregnancy (Category D)'
    ],
    drugInteractions: [
      { drug: 'Anthracyclines (doxorubicin)', severity: 'Major', effect: 'Significantly increased cardiotoxicity risk' },
      { drug: 'Paclitaxel', severity: 'Moderate', effect: 'Additive cardiotoxicity' },
      { drug: 'Cyclophosphamide', severity: 'Moderate', effect: 'Possible increased cardiac risk' }
    ],
    patientGuidance: [
      'Report shortness of breath, swelling, or rapid weight gain immediately (heart failure)',
      'Avoid becoming pregnant during treatment and 7 months after last dose',
      'First infusion takes 90 minutes; subsequent infusions 30 minutes if tolerated',
      'Premedication with acetaminophen/diphenhydramine may reduce infusion reactions',
      'Continue cardiac monitoring even after treatment completion'
    ],
    clinicalNotes: 'Cardiotoxicity is cumulative and may be irreversible. Risk higher with prior anthracycline exposure or chest radiation.'
  },

  'paclitaxel': {
    name: 'Paclitaxel',
    genericName: 'Paclitaxel',
    brandNames: ['Taxol', 'Abraxane (nab-paclitaxel)'],
    drugClass: 'chemotherapy',
    cancerTypes: ['breast', 'ovarian', 'lung', 'pancreatic', 'kaposi-sarcoma'],
    mechanism: 'Microtubule stabilizer that prevents cell division by disrupting normal microtubule dynamics',
    administration: {
      route: 'IV',
      dosage: '135-175 mg/m² (conventional) or 260 mg/m² (nab-paclitaxel)',
      frequency: 'Every 3 weeks or weekly dosing schedules'
    },
    sideEffects: {
      common: ['Neutropenia', 'Peripheral neuropathy', 'Myalgia/arthralgia', 'Alopecia', 'Nausea', 'Diarrhea'],
      serious: ['Severe hypersensitivity reactions', 'Severe neutropenia with infection', 'Cardiac arrhythmias', 'Severe neuropathy'],
      rare: ['Pneumonitis', 'Hepatotoxicity', 'Stevens-Johnson syndrome']
    },
    monitoring: [
      'Complete blood count before each cycle',
      'Neurological exam for neuropathy',
      'Monitor for hypersensitivity during infusion',
      'Liver function tests'
    ],
    contraindications: [
      'Baseline neutropenia (ANC <1500/mm³)',
      'History of severe hypersensitivity to paclitaxel or Cremophor EL (for conventional)',
      'Pregnancy'
    ],
    drugInteractions: [
      { drug: 'CYP3A4 inhibitors (ketoconazole)', severity: 'Major', effect: 'Increased paclitaxel toxicity' },
      { drug: 'CYP3A4 inducers (rifampin)', severity: 'Moderate', effect: 'Decreased paclitaxel efficacy' },
      { drug: 'Cisplatin', severity: 'Moderate', effect: 'Give paclitaxel before cisplatin to reduce toxicity' }
    ],
    patientGuidance: [
      'MANDATORY premedication: dexamethasone, diphenhydramine, H2-blocker (prevents allergic reactions)',
      'Report tingling, numbness in hands/feet (neuropathy)',
      'Hair loss is common; begins 2-3 weeks after first dose',
      'Avoid grapefruit juice (affects drug metabolism)',
      'Use effective contraception'
    ],
    clinicalNotes: 'Nab-paclitaxel (Abraxane) does not require premedication and has reduced hypersensitivity risk. Peripheral neuropathy may be cumulative.'
  },

  'tamoxifen': {
    name: 'Tamoxifen',
    genericName: 'Tamoxifen citrate',
    brandNames: ['Nolvadex', 'Soltamox'],
    drugClass: 'hormone-therapy',
    cancerTypes: ['ER-positive breast cancer (adjuvant and metastatic)', 'breast cancer risk reduction'],
    mechanism: 'Selective estrogen receptor modulator (SERM) that competitively inhibits estrogen binding to ER+ cancer cells',
    administration: {
      route: 'Oral',
      dosage: '20 mg daily',
      frequency: 'Once daily for 5-10 years (adjuvant)'
    },
    sideEffects: {
      common: ['Hot flashes', 'Vaginal discharge/dryness', 'Irregular menses', 'Fatigue', 'Nausea'],
      serious: ['Venous thromboembolism (DVT/PE)', 'Endometrial cancer', 'Stroke', 'Cataracts'],
      rare: ['Hepatotoxicity', 'Hypercalcemia (with bone metastases)']
    },
    monitoring: [
      'Annual gynecological exam with endometrial thickness assessment',
      'Ophthalmological exam if visual changes',
      'Liver function tests periodically',
      'Report abnormal vaginal bleeding immediately'
    ],
    contraindications: [
      'Active or history of deep vein thrombosis or pulmonary embolism',
      'Concomitant warfarin therapy for anticoagulation',
      'Pregnancy (Category D)'
    ],
    drugInteractions: [
      { drug: 'CYP2D6 inhibitors (paroxetine, fluoxetine)', severity: 'Major', effect: 'Reduced tamoxifen efficacy' },
      { drug: 'Warfarin', severity: 'Major', effect: 'Increased bleeding risk' },
      { drug: 'Rifampin', severity: 'Moderate', effect: 'Decreased tamoxifen levels' }
    ],
    patientGuidance: [
      'Take at same time daily, with or without food',
      'Report leg pain, swelling, chest pain, or shortness of breath (blood clot)',
      'Report abnormal vaginal bleeding (endometrial cancer risk)',
      'Avoid SSRIs that inhibit CYP2D6 (ask pharmacist)',
      'Hot flashes often improve after first few months',
      'Continue taking even if feeling well (cancer prevention)'
    ],
    clinicalNotes: 'Pre-menopausal women preferred. Post-menopausal women may benefit more from aromatase inhibitors. Duration 5-10 years based on risk.'
  },

  'imatinib': {
    name: 'Imatinib',
    genericName: 'Imatinib mesylate',
    brandNames: ['Gleevec'],
    drugClass: 'targeted-therapy',
    cancerTypes: ['CML (chronic myeloid leukemia)', 'GIST (gastrointestinal stromal tumors)', 'ALL (Ph+ acute lymphoblastic leukemia)'],
    mechanism: 'Tyrosine kinase inhibitor targeting BCR-ABL fusion protein, blocking abnormal cell signaling',
    administration: {
      route: 'Oral',
      dosage: '400-800 mg daily (varies by indication)',
      frequency: 'Once or twice daily with food'
    },
    sideEffects: {
      common: ['Edema (especially periorbital)', 'Nausea', 'Muscle cramps', 'Diarrhea', 'Rash', 'Fatigue'],
      serious: ['Severe fluid retention', 'Heart failure', 'Hepatotoxicity', 'Myelosuppression', 'GI perforation'],
      rare: ['Tumor lysis syndrome', 'Severe skin reactions']
    },
    monitoring: [
      'Complete blood count weekly for first month, then monthly',
      'Liver function tests at baseline and monthly',
      'Kidney function',
      'Weight monitoring (fluid retention)',
      'BCR-ABL transcript levels (for CML) every 3 months'
    ],
    contraindications: [
      'Pregnancy (Category D)',
      'No absolute contraindications but dose adjust for hepatic impairment'
    ],
    drugInteractions: [
      { drug: 'CYP3A4 inhibitors (ketoconazole)', severity: 'Major', effect: 'Increased imatinib toxicity' },
      { drug: 'CYP3A4 inducers (rifampin, St. John\'s Wort)', severity: 'Major', effect: 'Decreased imatinib efficacy' },
      { drug: 'Warfarin', severity: 'Moderate', effect: 'Monitor INR closely' },
      { drug: 'Acetaminophen', severity: 'Moderate', effect: 'Increased risk of hepatotoxicity' }
    ],
    patientGuidance: [
      'Take with food and large glass of water to reduce GI upset',
      'Report sudden weight gain or swelling (fluid retention)',
      'Avoid grapefruit juice (affects drug levels)',
      'Do not take St. John\'s Wort or herbal supplements without consulting doctor',
      'Swallow tablets whole; do not crush (bitter taste, esophageal irritation)',
      'Use effective contraception'
    ],
    clinicalNotes: 'Revolutionized CML treatment with >90% 5-year survival. Resistance can develop; monitor BCR-ABL mutations. Lifelong therapy often required.'
  },

  // Add more drugs as needed...
  'doxorubicin': {
    name: 'Doxorubicin',
    genericName: 'Doxorubicin hydrochloride',
    brandNames: ['Adriamycin', 'Doxil (liposomal)'],
    drugClass: 'chemotherapy',
    cancerTypes: ['breast', 'lymphoma', 'sarcoma', 'leukemia', 'bladder', 'thyroid'],
    mechanism: 'Anthracycline that intercalates DNA and inhibits topoisomerase II, generating free radicals',
    administration: {
      route: 'IV',
      dosage: '60-75 mg/m² per cycle',
      frequency: 'Every 21 days'
    },
    sideEffects: {
      common: ['Myelosuppression', 'Nausea/vomiting', 'Alopecia', 'Mucositis', 'Red urine (harmless)', 'Fatigue'],
      serious: ['Cardiotoxicity (CHF)', 'Severe bone marrow suppression', 'Extravasation necrosis', 'Secondary leukemia'],
      rare: ['Anaphylaxis', 'Hepatotoxicity']
    },
    monitoring: [
      'Cardiac function (ECHO/MUGA) at baseline and periodically - cumulative dose limit 450-550 mg/m²',
      'Complete blood count',
      'Liver function (dose reduce if elevated bilirubin)'
    ],
    contraindications: [
      'Pre-existing heart disease or reduced LVEF',
      'Recent myocardial infarction',
      'Severe hepatic impairment',
      'Pregnancy'
    ],
    drugInteractions: [
      { drug: 'Trastuzumab', severity: 'Major', effect: 'Severe cardiotoxicity - avoid concurrent use' },
      { drug: 'Other cardiotoxic agents', severity: 'Major', effect: 'Increased heart failure risk' },
      { drug: 'Paclitaxel', severity: 'Moderate', effect: 'Give doxorubicin after paclitaxel' }
    ],
    patientGuidance: [
      'RED URINE for 1-2 days after treatment is normal (not blood)',
      'Report shortness of breath, swelling, rapid heartbeat (cardiotoxicity)',
      'Complete alopecia expected; hair regrows after treatment',
      'Avoid extravasation - report IV site pain immediately (tissue necrosis risk)',
      'Use effective contraception',
      'Risk of secondary leukemia years after treatment'
    ],
    clinicalNotes: 'Cumulative lifetime dose limits due to cardiotoxicity. Liposomal form (Doxil) reduces cardiac and infusion risks.'
  }
};

/**
 * Search cancer drug database by name
 */
export const findCancerDrug = (drugName: string): CancerDrug | undefined => {
  const normalized = drugName.toLowerCase().trim();
  
  // Exact match on generic name
  if (cancerDrugDatabase[normalized]) {
    return cancerDrugDatabase[normalized];
  }
  
  // Search by brand names
  for (const [key, drug] of Object.entries(cancerDrugDatabase)) {
    if (drug.brandNames.some(brand => brand.toLowerCase() === normalized)) {
      return drug;
    }
  }
  
  return undefined;
};

/**
 * Get drugs by cancer type
 */
export const getDrugsByCancerType = (cancerType: string): CancerDrug[] => {
  const normalized = cancerType.toLowerCase().trim();
  return Object.values(cancerDrugDatabase).filter(drug => 
    drug.cancerTypes.some(type => type.toLowerCase().includes(normalized))
  );
};

/**
 * Get drugs by class
 */
export const getDrugsByClass = (drugClass: CancerDrug['drugClass']): CancerDrug[] => {
  return Object.values(cancerDrugDatabase).filter(drug => drug.drugClass === drugClass);
};

/**
 * Check drug interactions between two drugs
 */
export const checkDrugInteraction = (drug1Name: string, drug2Name: string): string | null => {
  const drug1 = findCancerDrug(drug1Name);
  if (!drug1) return null;
  
  const interaction = drug1.drugInteractions.find(int => 
    int.drug.toLowerCase().includes(drug2Name.toLowerCase())
  );
  
  return interaction 
    ? `${interaction.severity} interaction: ${interaction.effect}`
    : null;
};
