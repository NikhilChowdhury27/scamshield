# 🛡️ ScamShield

<div align="center">
  <img src="./scamshield-cover.png" alt="ScamShield - Real-time AI analysis & protection" width="100%" style="border-radius: 20px;" />
  <br />
  <br />
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/Built_with-React-61DAFB?style=for-the-badge&logo=react" alt="React" />
  </a>
  <a href="https://ai.google.dev/">
    <img src="https://img.shields.io/badge/Powered_by-Gemini_AI-8E75B2?style=for-the-badge&logo=google" alt="Gemini" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Styled_with-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  </a>
</div>

## 🚨 Detect Scam: Real-time AI Analysis & Protection

**ScamShield** is an AI-powered guardian designed to protect elderly users from sophisticated fraud. By combining real-time audio analysis, visual scanning, and location-based intelligence, it acts as a protective layer against modern scams.

It leverages **Google's Gemini 2.5 Flash and Gemini Live API** to listen, read, and reason through potential threats, providing clear, jargon-free advice.

## ✨ Key Features

### 📞 Monitor a Phone Call (Live API)
*   **Real-time Protection**: Select "Monitor Phone Call" and answer incoming calls on speaker.
*   **Instant Detection**: ScamShield listens to the conversation and detects scam patterns (urgency, threats, financial demands) instantly.
*   **Live Transcription**: Visualizes the audio and transcripts for immediate review.

### 💬 Message & Call Analysis
*   **Risk Assessment**: Instantly classifies content as **High**, **Medium**, or **Low** risk.
*   **Red Flags**: Identifies specific threats like "Pressure tactics," "Sensitive information requests," or "Impersonation."
*   **Simple Summaries**: Explains *why* something is a scam in non-technical language.

### 📍 Local Scam Radar
*   **Location-Based Alerts**: Tracks recent scam reports in your specific City, Region, or Country.
*   **Community Awareness**: Stay ahead of trending fraud schemes in your area.

### 🛡️ Next Steps & Safe Actions
*   **Actionable Advice**: Clear buttons to "Report Cybercrime" or "Block Number".
*   **Safety Scripts**: Provides exact sentences (e.g., *"I do not accept unknown numbers..."*) to read if the scammer calls back.

## 🚀 How to Run the Project

### Prerequisites

*   **Node.js** (v18 or higher recommended)
*   **npm** or **yarn**
*   A **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudiocdn.google.com/))

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/scamshield.git
    cd scamshield
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    *   Create a `.env` file in the root directory.
    *   Add your Gemini API Key:
    ```env
    API_KEY=your_actual_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Visit `http://localhost:5173` (or the port shown in your terminal) in your browser.

## 🛠️ Tech Stack

*   **Frontend:** React 18, TypeScript, Vite
*   **AI Model:** Google Gemini 2.5 Flash, Gemini 3 Pro (Fallback), Gemini Live API (WebSockets)
*   **Styling:** Tailwind CSS, Lucide React (Icons)
*   **Audio Visualization:** Three.js
*   **State Management:** React Context API

## ⚠️ Disclaimer

**ScamShield is an AI-powered assistance tool.** 
It is not a replacement for professional legal advice or law enforcement. While we strive for accuracy, AI can make mistakes. Always verify information through official channels (e.g., calling your bank directly) before taking action.

---

**© 2025 ScamShield** - protecting the digital lives of our seniors.
