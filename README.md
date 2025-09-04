
 # 🩺 MediBot – AI Health Assistant

> Intelligent, multilingual triage • medication insights • preventative health guidance (RAG‑powered)

**Developer:** Akash S

---

## ✨ Features

- 🧠 **Three Expert Modes**  
    - **Triage:** Symptom + prescription/image analysis → urgency level + recommendation + explanation + potential drug interactions.  
    - **Pharmacy:** Identify a drug from text or pill photo → uses, mechanism, dosage (adult/pediatric), side effects, critical warnings.  
    - **Precautions (RAG):** Reliable preventative advice grounded in a curated knowledge base (no free‑floating hallucinations).
- 🗣️ **Voice Input:** Web Speech API for real‑time dictation.
- 🖼️ **Document & Image Uploads:** Pill photos, prescriptions, lab reports (images, PDF, DOC, DOCX, TXT, RTF, ODT).
- 🌐 **Multilingual UI & Responses:** English, Spanish, French (core); plus on‑demand translation to Kannada, Hindi, Tamil, Telugu, Malayalam.
- 🔊 **Text‑to‑Speech Playback:** Structured, paced reading for accessibility.
- 🧩 **RAG Grounding:** Precautions answers are context‑anchored via local retrieval (`services/knowledgeBase.ts`).
- 🛡️ **Structured JSON Parsing:** Ensures predictable rendering & safer downstream handling.
- ♿ **Accessible & Responsive:** Mobile‑first glass UI with reduced-motion stability (no input field jumping).
- 🔐 **Local-Only Knowledge Source:** No external call for RAG retrieval—privacy friendly.

---

## � Quick Start

### Prerequisites
| Requirement | Version |
|-------------|---------|
| Node.js     | 18+     |
| npm / yarn  | Latest  |

### Install & Run
```bash
git clone <your-repo-url>
cd Medi-bot-
npm install

# Environment variable (development)
echo API_KEY=your_gemini_api_key_here > .env.local

npm run dev
```
Open: http://localhost:5173

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔧 Configuration

| Variable | Purpose | Required |
|----------|---------|----------|
| `API_KEY` | Google Gemini API key (used by `geminiService.ts`) | Yes |

> Note: In Vite, variables normally use the `VITE_` prefix. This project accesses `process.env.API_KEY` directly. If you deploy and the key is undefined in the browser bundle, switch to `import.meta.env.VITE_API_KEY` in code and rename the env var accordingly.

---

## 🧠 RAG (Precautions Mode)

1. 🔍 **Retrieve:** Lightweight keyword matching against the local curated knowledge base.  
2. 🧾 **Augment:** Retrieved passage injected into a strict system instruction.  
3. 🧪 **Generate:** Gemini returns strictly structured JSON (disease, overview, hygiene, diet, lifestyle, checkups).  
4. 🛑 **Guardrails:** If context missing → graceful fallback with disclaimer.

Benefits: Lower hallucination risk • Deterministic structure • Easy post‑processing.

---

## 🏗️ Architecture Overview

- React + TypeScript + Vite frontend.
- Service layer: `geminiService.ts` (schemas + mode-specific system prompts + error normalization).
- RAG helper: `ragService.ts` + `knowledgeBase.ts` (local retrieval).
- Mode‑aware chat orchestrator (messages + typing indicator + result cards).
- Voice capture & speech synthesis utilities via browser APIs.

---

## �️ Tech Stack
- **Framework:** React + TypeScript
- **Build:** Vite
- **Styling:** Tailwind utility classes + custom glass/gradient CSS
- **AI Model:** `gemini-2.5-flash`
- **APIs:** Web Speech Recognition / Speech Synthesis
- **Data Flow:** Local state (no external DB)

---

## 💡 Usage Flow
1. Select mode (Triage | Pharmacy | Precautions).  
2. (Optional) Switch UI language.  
3. Enter text / speak / upload image or document.  
4. Receive structured card (urgency / medication facts / prevention set).  
5. (Optional) Translate or listen via TTS.  
6. Start a new query—previous messages retained until cleared.

---

## 🧪 Structured Outputs (Examples)

### Triage (Example)
```json
{
    "urgencyLevel": "Routine",
    "recommendation": "Monitor symptoms at home and hydrate.",
    "explanation": "Disclaimer: This is an AI-generated analysis... mild viral indicators without red flags.",
    "drugInteractions": [
        { "drugs": "Ibuprofen + Aspirin", "risk": "Increased bleeding risk", "source": "Internal Model Reasoning" }
    ],
    "citedSources": ["Source A", "Source B"]
}
```

### Pharmacy (Example)
```json
{
    "medicationName": "Amoxicillin",
    "commonUses": ["Bacterial infections"],
    "mechanismOfAction": "Inhibits bacterial cell wall synthesis.",
    "dosageInformation": { "adult": "500mg q8h", "pediatric": "Weight-based" },
    "commonSideEffects": ["Nausea", "Rash"],
    "crucialWarnings": ["Allergy risk in penicillin-sensitive patients"]
}
```

### Precautions (Example)
```json
{
    "diseaseName": "Hypertension",
    "overview": "Chronic elevation of arterial pressure requiring lifestyle and sometimes pharmacologic management.",
    "hygienePractices": ["Limit sodium", "Hand hygiene"],
    "dietaryRecommendations": ["DASH-style diet", "High potassium foods"],
    "lifestyleAdjustments": ["Regular aerobic exercise", "Stress reduction"],
    "medicalCheckups": ["Routine BP monitoring", "Annual cardiovascular assessment"]
}
```

---

## ⚙️ Error Handling Philosophy
- Consistent JSON fallback (even on model hiccups).
- User‑safe messaging (no internal stack traces).
- Graceful degradation when API key misconfigured.

---

## 📱 Responsive & Stability Notes
- Fixed-height, non-animated input (eliminates jump & layout shift).
- Hidden scrollbars for immersive feel.
- Progressive enhancement: animations minimized where stability prioritized.

---

## 🚀 Performance Practices
- Lean bundle via Vite.
- No runtime backend round-trip for retrieval.
- Caching layer for translations (simple in-memory map).
- Avoids unnecessary re-renders (memoized mode-bound strings formerly—now simplified for stability).

---

## 🔮 Roadmap Ideas
- [ ] Optional dark/intense contrast accessibility toggle
- [ ] Offline fallback knowledge pack
- [ ] Export/share structured reports (PDF)
- [ ] Add more languages (Arabic, German, Portuguese)
- [ ] Usage analytics (privacy-preserving)

---

## 🧾 Medical Disclaimer
MediBot is **not** a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with questions regarding a medical condition. Emergency symptoms require immediate professional attention.

---

## 👨‍💻 Developer
**Akash S** – Full Stack Developer

---

## 📄 License
MIT License

---

<div align="center">
    <strong>Made with care for accessible, trustworthy health insights 💙</strong>
</div>

