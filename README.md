# 🛡️ ScamShield
## Real-time AI Analysis & Protection Against Phone Scams

<div align="center">
  <img width="2400" height="1792" alt="image" src="https://github.com/user-attachments/assets/a047e1c7-c031-4d1c-a0ab-c5198f8b27c8" />
  <br />
  <br />
  
  <h3>🚀 <a href="https://scamshield-120207655828.us-west1.run.app/" target="_blank">Live Demo</a></h3>
  <p><a href="https://scamshield-120207655828.us-west1.run.app/" target="_blank">https://scamshield-120207655828.us-west1.run.app/</a></p>
  
  <br />
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/Built_with-React-61DAFB?style=for-the-badge&logo=react" alt="React" />
  </a>
  <a href="https://ai.google.dev/">
    <img src="https://img.shields.io/badge/Powered_by-Gemini_3_Pro-8E75B2?style=for-the-badge&logo=google" alt="Gemini 3 Pro" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Styled_with-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  </a>
  <a href="https://www.kaggle.com/competitions/gemini-3">
    <img src="https://img.shields.io/badge/Hackathon-Gemini_3_Pro_Challenge-FF6B6B?style=for-the-badge" alt="Hackathon" />
  </a>
</div>

---

## 🎯 Project Overview

**ScamShield** is an AI-powered guardian that protects vulnerable users from phone scams using **Gemini 3 Pro's advanced reasoning and native multimodality**. Built for the [Google DeepMind - Vibe Code with Gemini 3 Pro Hackathon](https://www.kaggle.com/competitions/gemini-3), it demonstrates how cutting-edge AI can solve real-world problems affecting millions globally.

### 🏆 Hackathon Submission

**Track:** Overall Track  
**Competition:** [Google DeepMind - Vibe Code with Gemini 3 Pro in AI Studio](https://www.kaggle.com/competitions/gemini-3)  
**Timeline:** December 5-12, 2025

---

## 💡 The Problem We're Solving

**Impact (40%):** Phone scams cost victims billions annually, with elderly users disproportionately affected. ScamShield addresses this by providing:
- **Real-time protection** during live phone calls
- **Accessible, jargon-free explanations** for non-technical users
- **Location-aware scam intelligence** to stay ahead of local fraud patterns
- **Actionable safety guidance** with exact scripts and reporting tools

---

## 🚀 How Gemini 3 Pro Powers ScamShield

### Advanced Reasoning & Multimodality

ScamShield leverages **Gemini 3 Pro's native multimodality** to analyze multiple input types simultaneously:

1. **Real-time Audio Analysis (Gemini Live API)**
   - Live transcription with speaker diarization
   - Continuous scam pattern detection during phone calls
   - Instant risk assessment as conversations unfold

2. **Multimodal Content Analysis**
   - **Text:** SMS, emails, social media messages
   - **Images:** Screenshots of suspicious messages, fake documents
   - **Audio:** Recorded calls, voicemails
   - **Combined:** Analyze text + images + audio together for comprehensive threat assessment

3. **Advanced Reasoning for Context Understanding**
   - Understands scam scripts and pressure tactics
   - Identifies impersonation attempts (IRS, banks, family members)
   - Provides reasoning-backed explanations in simple language
   - Contextual follow-up conversations that remember previous analyses

4. **Dynamic Location-Based Intelligence**
   - Uses Gemini to fetch and analyze real-time scam news
   - Cascading scope (city → region → country → global) for comprehensive coverage
   - Validates and filters news sources automatically

### Technical Implementation

- **Model Selection:**
  - `gemini-3-pro-thinking` for complex reasoning and final analysis
  - `gemini-2.5-flash-native-audio-preview` for live transcription
  - `gemini-1.5-pro` for follow-up conversations with context retention

- **Native Multimodality:**
  - Single API calls handle text, images, and audio simultaneously
  - Structured JSON output with schema validation
  - Real-time streaming for live call monitoring

---

## ✨ Key Features

### 📞 Real-time Call Monitoring
- **Live Transcription:** See conversation transcript as it happens
- **Instant Risk Detection:** Red/yellow/green indicators update in real-time
- **Suspicious Keyword Alerts:** Immediate warnings for danger phrases
- **Speaker Identification:** Automatically labels "Speaker 1" and "Speaker 2"

### 💬 Message & Call Analysis
- **Multimodal Input:** Upload text, images, audio, or all three together
- **Risk Classification:** HIGH, MEDIUM, or LOW with confidence scores
- **Red Flag Detection:** Identifies specific threats (pressure tactics, impersonation, financial demands)
- **Simple Summaries:** Explains scams in non-technical, elder-friendly language

### 📍 Local Scam Radar
- **Dynamic News Fetching:** Uses Gemini to find latest scam reports in your area
- **Location-Aware:** Automatically detects city, state, and country
- **Infinite Scroll:** Loads more news as you scroll
- **Link Validation:** Only shows "Read more" for accessible, working links

### 🛡️ Actionable Protection
- **Safety Scripts:** Exact sentences to read if scammers call back
- **Family Alerts:** Pre-written messages to share with family
- **Reporting Tools:** Direct links to cybercrime reporting resources
- **Follow-up Chat:** Continue the conversation with context-aware AI assistance

---

## 🎨 Creativity & Innovation

**Creativity (20%):** ScamShield demonstrates novel uses of Gemini 3 Pro:

1. **Real-time Multimodal Analysis:** First application to combine live audio transcription with simultaneous scam detection
2. **Context-Aware Follow-ups:** Maintains conversation context across multiple interactions
3. **Location Intelligence:** Dynamic news fetching with cascading scope logic
4. **Accessibility-First Design:** Built specifically for elderly users with large fonts, simple language, and clear visual indicators
5. **Progressive Enhancement:** Works gracefully even without API keys (local fallbacks)

---

## 🛠️ Technical Stack

- **Frontend:** React 18, TypeScript, Vite
- **AI Models:** 
  - Gemini 3 Pro (reasoning & analysis)
  - Gemini 2.5 Flash Native Audio (live transcription)
  - Gemini 1.5 Pro (follow-up conversations)
- **Styling:** Tailwind CSS, Lucide React Icons
- **Audio Visualization:** Three.js (real-time 3D audio visualizer)
- **State Management:** React Context API
- **Location Services:** Browser Geolocation API

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Google Gemini API Key** ([Get it from Google AI Studio](https://aistudiocdn.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/scamshield.git
   cd scamshield
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Visit `http://localhost:5173` in your browser.

---

## 📝 Submission Requirements

- ✅ **Live Demo:** [https://scamshield-120207655828.us-west1.run.app/](https://scamshield-120207655828.us-west1.run.app/)
- ✅ **Video Demo:** [Link to be added]
- ✅ **Public AI Studio App Link:** [Link to be added]
- ✅ **Kaggle Writeup:** [Link to be added]

---

## ⚠️ Disclaimer

**ScamShield is an AI-powered assistance tool.** It is not a replacement for professional legal advice or law enforcement. While we strive for accuracy, AI can make mistakes. Always verify information through official channels (e.g., calling your bank directly) before taking action.

---

## 📄 License

This project is licensed under **CC BY 4.0** as required by the hackathon rules.

---

## 🙏 Acknowledgments

- **Google DeepMind** for organizing the Gemini 3 Pro Hackathon
- **Google AI Studio** for providing the platform and API access
- Built with ❤️ to protect vulnerable users from scams

---

**© 2025 ScamShield** - Protecting the digital lives of our seniors with Gemini 3 Pro.

---

<div align="center">
  <p><strong>Built for the Google DeepMind - Vibe Code with Gemini 3 Pro Hackathon</strong></p>
  <p>December 5-12, 2025</p>
</div>
