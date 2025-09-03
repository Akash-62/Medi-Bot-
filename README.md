
# AuraMed - AI Health Assistant

**Developed by Akash S**

## 🚀 Overview

AuraMed is a futuristic, AI-powered health assistant designed to provide intelligent, accessible, and multilingual health information. It combines a sophisticated user interface with the power of the Google Gemini API to offer three distinct modes of operation: Triage, Pharmacy, and Precautions.

## ✨ Key Features

- **Multi-Modal Input**: Interact with AuraMed using text, pill images, or voice-to-text dictation.
- **Three Core AI Modes**:
    1.  **Triage**: Describe symptoms or upload prescription images to receive an AI-driven triage analysis, including urgency level, recommendations, and potential drug interactions.
    2.  **Pharmacy**: Identify medications from text or pill photos. Get detailed information on uses, dosage, side effects, and crucial warnings.
    3.  **Precautions (RAG-Powered)**: Ask for preventative advice on any disease and receive reliable, accurate tips grounded in a curated knowledge base.
- **Advanced Multilingual Support**: The entire user interface and all AI responses are available in English, Spanish, and French.
- **On-Demand Translation**: Instantly translate any AI-generated report into Kannada, Hindi, Tamil, Telugu, or Malayalam.
- **Natural Text-to-Speech**: Make information more accessible with a high-quality, human-like voice that reads results aloud in your selected language, speaking in natural sections for better comprehension.
- **Futuristic UI/UX**: A stunning, modern interface featuring an animated aurora background, sleek glassmorphism effects, and fluid animations for an engaging user experience.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI Backend**: Google Gemini API (`gemini-2.5-flash`)
- **Architecture**: Retrieval-Augmented Generation (RAG) for the Precautions mode.
- **Browser APIs**:
    - Web Speech API (for voice-to-text)
    - Web Speech Synthesis API (for text-to-speech)

## 🧠 RAG Architecture (Precautions Mode)

To ensure the highest level of accuracy and reliability, AuraMed's "Precautions" mode is powered by a **Retrieval-Augmented Generation (RAG)** pipeline. This advanced architecture grounds the AI's responses in a curated, internal knowledge base, minimizing hallucinations and providing trustworthy health information.

### How It Works:

1.  **User Query**: The user asks for precautions for a specific condition (e.g., "precautions for hypertension").
2.  **Retrieve**: A client-side RAG service performs a keyword search against a local, curated **Knowledge Base** (`services/knowledgeBase.ts`) to find the most relevant health document.
3.  **Augment**: The retrieved document's content is injected directly into a specialized system prompt for the Gemini model. The AI is explicitly instructed to base its answer *primarily* on this provided context.
4.  **Generate**: The Gemini model processes the augmented prompt and generates a structured, reliable response that adheres to the curated information.

This process ensures that the advice provided is not just generated, but is **retrieved, verified, and then articulated** by the AI.

## 💡 How to Use

1.  **Select a Mode**: Use the intuitive switcher in the header to choose between `Triage`, `Pharmacy`, or `Precautions`.
2.  **Choose a Language**: Select your preferred language for the interface and AI responses.
3.  **Interact**:
    - Type your query in the input box.
    - Click the paperclip icon to upload an image (e.g., a prescription or a pill).
    - Click the microphone icon to speak your query.
4.  **Review the Results**: AuraMed will provide a structured, detailed analysis in a custom card.
5.  **Translate & Listen**: Use the controls on the result card to translate the information into various languages or have it read aloud.

## 🤖 Example AI Responses

Below are examples of the detailed, structured advice AuraMed provides in **Precautions Mode**.

### Example 1: Precautions for Diabetes

-   **Condition**: Diabetes Mellitus
-   **Overview**: A chronic condition affecting how your body regulates blood sugar. Management involves lifestyle choices to maintain stable glucose levels and prevent complications.
-   **Dietary Recommendations**:
    -   Focus on complex carbs (whole grains, vegetables).
    -   Increase fiber intake to control blood sugar.
    -   Choose lean proteins like fish and beans.
    -   Limit sugars and highly processed foods.
-   **Lifestyle Adjustments**:
    -   Aim for 150 minutes of moderate exercise per week (e.g., brisk walking).
    -   Maintain a healthy weight.
    -   Manage stress through relaxation techniques like meditation or yoga.
    -   Ensure 7-9 hours of quality sleep per night.
-   **Medical Check-ups**:
    -   Monitor blood sugar levels as advised by your doctor.
    -   Schedule annual dilated eye exams to check for retinopathy.
    -   Perform daily foot checks for sores or changes.

### Example 2: Precautions for the Common Cold

-   **Condition**: Common Cold
-   **Overview**: A mild viral infection of the nose and throat. It's typically harmless, with symptoms resolving in about a week. Prevention focuses on hygiene and immune support.
-   **Hygiene Practices**:
    -   Wash hands frequently with soap and water for at least 20 seconds.
    -   Use an alcohol-based hand sanitizer when soap is unavailable.
    -   Avoid touching your eyes, nose, and mouth with unwashed hands.
    -   Clean and disinfect frequently touched surfaces (doorknobs, phones).
-   **Lifestyle Adjustments**:
    -   Get adequate rest to support your immune system.
    -   Stay hydrated by drinking plenty of water and clear broths.
    -   Eat a balanced diet rich in vitamins and minerals.
    -   Avoid close contact with people who are sick.
-   **Medical Check-ups**:
    -   The common cold usually does not require medical attention.
    -   Consult a doctor if symptoms are severe, last more than 10 days, or if you have a high fever.
