# ScamShield - Elder Fraud Prevention Assistant

An AI-powered assistant built with **Gemini 3 Pro** to help elderly users and their families identify and prevent fraud by analyzing messages, images, and audio in real-time.

## 🎯 Problem Statement

Elder fraud is a growing crisis, with seniors losing billions of dollars annually to scams. Many elderly individuals struggle to identify sophisticated scam tactics, especially when scammers use emotional manipulation, urgency, and impersonation.

## 💡 Solution

ScamShield leverages Gemini 3 Pro's advanced reasoning and native multimodality to:

1. **Analyze suspicious content** - Text messages, screenshots, and audio recordings
2. **Provide real-time call monitoring** - Live transcription during phone calls with instant scam detection
3. **Explain in simple language** - Results are presented in elder-friendly, non-technical terms
4. **Suggest safe actions** - Clear, practical next steps to protect the user
5. **Enable family involvement** - One-click sharing of alerts to family members

## 🚀 Key Features

### Multi-Modal Analysis
- **Text Analysis**: Paste suspicious messages for instant evaluation
- **Image Analysis**: Upload screenshots of texts, emails, or popups
- **Audio Analysis**: Record or upload phone calls for transcription and analysis

### Live Call Monitoring
Using Gemini's native audio capabilities:
- Real-time speech-to-text transcription
- Live scam detection during calls
- Visual audio feedback with 3D visualizer

### Web Verification
Automatically searches the web for known scam patterns using Gemini's Google Search integration.

### Accessibility Features
- Text-to-Speech for reading results aloud
- Large text options
- Dark mode support
- Simple, elder-friendly UI

## 🛠️ Technical Implementation

### Gemini 3 Pro Capabilities Used

1. **Advanced Reasoning** (`gemini-3-pro-preview`)
   - Deep analysis of scam patterns
   - Context-aware threat assessment
   - Structured JSON output for consistent results

2. **Native Multimodality**
   - Image understanding for screenshot analysis
   - Audio processing for call recordings
   - Text comprehension for message analysis

3. **Live Audio API** (`gemini-2.5-flash-native-audio-preview`)
   - Real-time audio streaming
   - Live transcription during calls
   - Speaker identification

4. **Text-to-Speech** (`gemini-2.5-flash-preview-tts`)
   - Read analysis results aloud
   - Accessibility for visually impaired users

5. **Google Search Integration**
   - Verify content against known scam databases
   - Find similar reported scams online

## 📁 Project Structure

```text
scamshield/
├── App.tsx                 # Main application component
├── index.tsx               # Entry point
├── index.html              # HTML template with Tailwind config
├── types.ts                # TypeScript type definitions
├── constants.ts            # AI system prompts
├── metadata.json           # AI Studio app metadata
├── components/
│   ├── LayoutShell.tsx     # Main layout wrapper
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── ResultCard.tsx      # Analysis results display
│   ├── FollowUpChat.tsx    # Follow-up Q&A interface
│   └── InputSection.tsx    # File upload component
├── views/
│   ├── CheckMessageView.tsx    # Main analysis view
│   ├── HistoryView.tsx         # Past analyses
│   ├── LearnView.tsx           # Scam education
│   ├── HelpSettingsView.tsx    # Settings & help
│   └── ExtensionPromoView.tsx  # Gmail extension
├── services/
│   └── geminiService.ts    # Gemini API integration
├── context/
│   └── ThemeContext.tsx    # Theme management
└── hooks/
    └── useScamHistory.ts   # Local history storage
```

## 🎨 Design Philosophy

- **Elder-First Design**: Large buttons, clear typography, high contrast
- **Reassuring Language**: Gentle, non-alarming explanations
- **Actionable Guidance**: Specific steps, not vague warnings
- **Family Integration**: Easy sharing to involve trusted family members

## 🔒 Privacy

- No data stored on servers
- Analysis happens in real-time
- History stored locally in browser only
- No personal information collected

## 🏆 Impact

ScamShield addresses a critical social need by:
- Protecting vulnerable populations from financial exploitation
- Empowering elderly users with AI-powered protection
- Reducing the emotional toll of fraud on families
- Making advanced AI technology accessible to non-technical users

## 🚀 Setup & Deployment

### For AI Studio (Recommended)

This app is designed to run in **Google AI Studio**, which automatically handles API key injection and provides the required environment.

1. Import this repository into AI Studio
2. AI Studio will automatically inject the Gemini API key as `process.env.API_KEY`
3. Click "Share" to generate a public app link

### For Local Development

```bash
git clone https://github.com/NikhilChowdhury27/scamshield.git
cd scamshield
npm install
```

Create a `.env` file:
```bash
GEMINI_API_KEY=your_api_key_here
```

Run the development server:
```bash
npm run dev
```

**Note**: The API key is used client-side because this app is designed for AI Studio's browser-based environment. In AI Studio, the key is securely injected by the platform and not exposed to end users.

---

Built with ❤️ for the Google DeepMind - Vibe Code with Gemini 3 Pro Hackathon
