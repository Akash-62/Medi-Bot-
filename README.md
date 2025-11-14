
# 🩺 MediBot – AI Health Assistant
AI-driven, multilingual medical triage & health guidance platform with **specialized cancer analysis**.

**Deploy:** Vite + React + TypeScript

---

## 🚀 Overview
MediBot is an intelligent health assistant that provides instant medical triage, medication information, and preventive health guidance. **Built with specialized oncology knowledge**, it excels at cancer symptom analysis, risk assessment, and differential diagnosis. Powered by advanced AI trained on clinical guidelines (including NCCN, WHO, and medical literature), it offers multilingual support with native voice capabilities for accessibility.

### 🎯 Cancer Specialization
- **Oncology-trained AI** with comprehensive cancer knowledge base
- **Differential diagnosis** for cancer vs. non-cancer symptoms
- **Treatment insights** based on NCCN guidelines and clinical standards
- **Risk stratification** with cited medical sources
- **Precautions database** including cancer prevention strategies

---

## ✨ Features

| Area | Description |
|------|-------------|
| **🧠 AI Triage** | Symptom analysis → urgency level + recommendation + clinical reasoning + **cancer differential diagnosis** |
| **🎗️ Cancer Analysis** | Specialized oncology assessment with possible cancer types, non-cancer causes, and treatment insights |
| **💊 Pharmacy Mode** | Pill identification + usage + dosage + side effects + warnings |
| **🛡️ Precautions (RAG)** | Evidence-based preventive health guidance from curated medical knowledge including cancer prevention |
| **🗣️ Voice Input** | Real-time voice dictation via Web Speech API |
| **🖼️ Document Upload** | Analyze prescriptions, lab reports, pill photos (PDF, DOC, images) |
| **🌐 Multilingual** | English, Spanish, French + Hindi, Tamil, Telugu, Malayalam, Kannada |
| **🔊 Native TTS** | Gemini-powered translation + ResponsiveVoice API for natural Indian language speech |
| **📱 Responsive** | Mobile-first glassmorphism UI with accessibility features |
| **⚡ Fast Analysis** | Optimized AI inference for quick medical insights |

---

## 🧱 Tech Stack
- **React 19** + **TypeScript**
- **Vite** build tool
- **Tailwind CSS** + custom glassmorphism styles
- **AI-powered** medical analysis with **specialized oncology training**
- **Cancer Knowledge Base** - Curated oncology database with NCCN guidelines
- **Gemini API** - For accurate medical translation + native TTS
- **Groq API (Llama-3.3-70b)** - Fast, accurate medical AI inference
- **ResponsiveVoice API** - Multilingual text-to-speech
- **RAG architecture** - Retrieval-augmented generation for grounded medical knowledge
- **Deployed on Vercel**

---

## ⚙️ Prerequisites
- **Node.js 18+** (recommended LTS)
- Modern browser with Web Speech API support

---

## 🔐 Configuration
Create a `.env` file in the root directory:

```bash
# Required: Groq API Key (Main AI - Free, Fast)
VITE_GROQ_API_KEY=your_groq_api_key_here

# Optional: Gemini API Key (Google AI - For Native TTS Translation)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** 
> - **Groq API Key** is required for AI functionality. Get it free at [console.groq.com](https://console.groq.com/keys)
> - **Gemini API Key** is optional, used for enhanced TTS translation. Get it at [makersuite.google.com](https://makersuite.google.com/app/apikey)
> - Without Gemini, the app uses ResponsiveVoice for Indian language TTS

---

## �️ Local Development

### Quick Start
```bash
git clone https://github.com/Akash-62/Medi-Bot-.git
cd Medi-Bot-
npm install
npm run dev
```
**Open:** http://localhost:5173

---

## 📦 Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server (Vite) |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |

---

## ☁️ Deployment (Vercel)

1. Push to `main` on GitHub
2. Import the repo into Vercel (Framework: Vite detected)
3. Configure environment variables in Vercel dashboard:
   - `VITE_GROQ_API_KEY`
4. Deploy. Output directory: `dist`

**Live Demo:** [https://medi-bot.vercel.app](https://medi-bot.vercel.app)

---

## 💡 Usage Flow

1. **Select Mode:** Triage | Pharmacy | Precautions
2. **Input:** Type, speak, or upload medical documents/images
3. **AI Analysis:** Get structured medical insights with urgency levels
4. **Translate:** View results in your preferred language
5. **Listen:** Text-to-speech in native languages (including Indian languages)
6. **Continue:** Ask follow-up questions or start new analysis

---

## 🧪 Structured Outputs

### Triage Analysis (Cancer-Specialized)
```json
{
  "urgencyLevel": "Priority",
  "recommendation": "See an oncologist within 24-48 hours for evaluation",
  "explanation": "Persistent cough with weight loss warrants immediate oncology evaluation. While these symptoms can be benign, the combination requires professional assessment to rule out lung cancer or other serious conditions.",
  "possibleCancerTypes": [
    "Lung Cancer - Persistent cough, weight loss, and breathing difficulties are key warning signs",
    "Esophageal Cancer - Difficulty swallowing combined with weight loss requires evaluation"
  ],
  "likelyNonCancerCauses": [
    "Chronic Bronchitis - Inflammation causing persistent cough",
    "GERD - Acid reflux causing cough and chest discomfort",
    "Tuberculosis - Infectious disease with similar respiratory symptoms"
  ],
  "treatmentInsights": [
    "Immediate chest X-ray or CT scan recommended",
    "Pulmonology consultation for bronchoscopy if needed",
    "Blood work including tumor markers (CEA, CA 19-9)"
  ],
  "citedSources": [
    "NCCN Guidelines for Lung Cancer Screening",
    "Mayo Clinic - Warning Signs of Cancer",
    "American Cancer Society - Early Detection"
  ]
}
```

### Medication Info
```json
{
  "medicationName": "Amoxicillin",
  "commonUses": ["Bacterial infections"],
  "mechanismOfAction": "Inhibits bacterial cell wall synthesis",
  "dosageInformation": {
    "adult": "500mg every 8 hours",
    "pediatric": "Weight-based dosing"
  },
  "commonSideEffects": ["Nausea", "Diarrhea", "Rash"],
  "crucialWarnings": ["Penicillin allergy contraindication"]
}
```

### Prevention Guidance (Includes Cancer Prevention)
```json
{
  "diseaseName": "Colorectal Cancer Prevention",
  "overview": "Evidence-based strategies to reduce colorectal cancer risk through lifestyle modifications and early screening",
  "hygienePractices": [
    "Regular colorectal cancer screening (colonoscopy every 10 years after age 45)",
    "Monitor for warning signs (blood in stool, persistent abdominal pain)"
  ],
  "dietaryRecommendations": [
    "High-fiber diet rich in fruits, vegetables, and whole grains",
    "Limit red and processed meats",
    "Increase calcium and vitamin D intake",
    "Reduce alcohol consumption"
  ],
  "lifestyleAdjustments": [
    "Maintain healthy weight (BMI 18.5-24.9)",
    "Regular physical activity (150 minutes moderate exercise weekly)",
    "Avoid tobacco use",
    "Limit sedentary behavior"
  ],
  "medicalCheckups": [
    "Annual physical examination",
    "Fecal occult blood test (FOBT) annually",
    "Colonoscopy every 10 years (or as recommended)",
    "Genetic counseling if family history present"
  ]
}
```

---

## 🏗️ Architecture

- **Frontend:** React + TypeScript + Vite
- **AI Service Layer:** Mode-specific prompts + structured JSON parsing
- **RAG System:** Local knowledge base retrieval for grounded responses
- **TTS Integration:** ResponsiveVoice API + browser fallback
- **State Management:** React hooks + context API
- **Styling:** Tailwind utilities + custom glassmorphism CSS

---

## 🧪 Future Enhancements (Roadmap)

- [ ] Real-time doctor consultation integration
- [ ] Health tracking & symptom history
- [ ] PDF export for medical reports
- [ ] Offline mode with cached knowledge base
- [ ] User authentication & personalized health profiles
- [ ] Integration with wearable health devices
- [ ] Medication reminder system
- [ ] Emergency service quick dial
- [ ] More language support (Arabic, German, Portuguese)
- [ ] Dark mode accessibility toggle

---

## 🤝 Contributing

PRs and issue reports welcome! Suggested flow:

1. **Fork** the repo
2. **Create** a feature branch: `git checkout -b feat/your-feature`
3. **Commit** changes: `git commit -m "feat: add your feature"`
4. **Push:** `git push origin feat/your-feature`
5. **Open** a Pull Request

Please write clear commit messages and keep changes focused.

---

## �️ Security & Privacy

- ✅ Secure API credential management
- ✅ Input validation for user-submitted data
- ✅ Environment variables for sensitive configuration
- ✅ No storage of personal health information
- ✅ Regular dependency updates for security patches
- ✅ HTTPS-only communication with AI services

---

## 🧾 Medical Disclaimer

**IMPORTANT:** MediBot is **not** a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with questions regarding a medical condition. Emergency symptoms require immediate professional attention.

This AI assistant is for educational and informational purposes only.

---

## 📄 License

MIT License

---

## 👨‍💻 Maintainer

**Akash S** – Full Stack Developer  
GitHub: [@Akash-62](https://github.com/Akash-62)

---

## � Support

Found a bug or have an idea? [Open an issue](https://github.com/Akash-62/Medi-Bot-/issues) or start a [discussion](https://github.com/Akash-62/Medi-Bot-/discussions).

---

<div align="center">
  <strong>Made with care for accessible, trustworthy health insights 💙</strong>
  <br><br>
  <sub>Enjoy using MediBot! 🩺</sub>
</div>
