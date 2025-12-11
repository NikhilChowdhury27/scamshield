# 🛡️ ScamShield - AI-Powered Elder Fraud Prevention

<div align="center">
  <img src="https://i.imgur.com/8yv5jMv.png" alt="ScamShield Dashboard" width="800" />
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

## 📖 About The Product

**ScamShield** is an accessible, AI-powered assistant designed specifically to help elderly users and their families identify and prevent fraud. 

Scammers are becoming increasingly sophisticated, using AI voice cloning, complex scripts, and emotional manipulation. ScamShield acts as a protective layer, analyzing suspicious messages, images, and audio in real-time to provide clear, non-technical advice.

It leverages **Google's Gemini 2.5 Flash and Gemini Live API** to listen, read, and reason through potential threats, offering safe next steps and reporting channels based on the user's location.

## ✨ Key Features

*   **🕵️ Multimodal Analysis:** Upload screenshots, paste text, or upload audio files of suspicious voicemails.
*   **🎙️ Live Call Monitoring:** Real-time audio analysis using the Gemini Live API to detect scam patterns during phone calls.
*   **⚡ Instant Risk Assessment:** Classifies content as High, Medium, or Low risk with simple, jargon-free explanations.
*   **📍 Location-Based News:** Fetches recent scam reports specific to the user's city or region.
*   **🗣️ Text-to-Speech:** Reads analysis results aloud for users with visual impairments.
*   **📚 Scamopedia:** An educational library of common fraud schemes (Grandparent scams, Tech support fraud, etc.).
*   **♿ Accessibility First:** Designed with high contrast, large typography, and simple navigation for senior users.

## 📸 Screenshots

### 1. Dashboard & Analysis Input
The main interface allows users to easily input text, upload files, or start a live monitor session.
![Dashboard](https://i.imgur.com/8yv5jMv.png)

### 2. Detailed Analysis Results
Clear, color-coded risk levels with specific "Red Flags" and safe next steps.
<img src="https://i.imgur.com/your-second-screenshot-url.png" alt="Analysis Result" width="800" />

*(Note: Replace the URL above with your actual analysis screenshot)*

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
    *(Note: Ensure your build tool is configured to inject `process.env.API_KEY` or adapt the service code to use `import.meta.env.VITE_API_KEY` if using standard Vite)*.

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
