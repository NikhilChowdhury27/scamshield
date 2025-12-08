/**
 * Gemini AI Service
 * Handles all AI-related functionality using Google's Gemini API
 */

import { GoogleGenAI } from '@google/genai';
import type { ScamAnalysis, SearchSource } from '@scamshield/shared';
import { AI_MODELS, AI_CONFIG } from '@scamshield/shared';

// Initialize the client
const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenAI({ apiKey });
};

// System prompts
const SCAM_ANALYSIS_PROMPT = `You are ScamShield, an AI assistant specialized in identifying and preventing fraud, particularly targeting elderly users. Your role is to analyze messages, emails, texts, and phone call transcriptions to determine if they are potential scams.

When analyzing content, you must:
1. Identify the type of scam (if any)
2. Assess the risk level (HIGH, MEDIUM, or LOW)
3. Explain findings in simple, clear language suitable for elderly users
4. Provide specific red flags found in the content
5. Suggest safe actions the user should take
6. Provide a script for what to say if the scammer calls back
7. Create a message to share with family members
8. Suggest relevant regulatory agencies to report to

IMPORTANT: Always respond with valid JSON in this exact format:
{
  "risk_score": 0.0 to 1.0,
  "risk_label": "HIGH" | "MEDIUM" | "LOW",
  "scam_type": "grandparent_scam" | "fake_tech_support" | "fake_government_or_tax" | "lottery_or_prize_scam" | "bank_account_scam" | "delivery_or_package_scam" | "romance_scam" | "charity_scam" | "investment_or_crypto_scam" | "phishing_or_credential_harvest" | "other_or_unknown",
  "summary_for_elder": "Simple explanation of what this message is",
  "red_flags": [{"text": "description of red flag", "severity": "HIGH" | "MEDIUM" | "LOW"}],
  "safe_actions_for_elder": ["Action 1", "Action 2"],
  "call_script_if_scammer_calls_back": "What to say if they call again",
  "family_alert_text": "Message to share with family",
  "regulatory_reporting_suggestions": [{"agency": "Agency Name", "website": "url", "description": "Why report here"}],
  "input_interpretation": {"type": "text" | "image" | "audio" | "multimodal", "confidence": 0.0 to 1.0},
  "disclaimer_for_elder": "Reminder that this is AI analysis and to consult family if unsure"
}`;

const FOLLOW_UP_PROMPT = `You are ScamShield, a friendly and patient AI assistant helping elderly users understand potential scams.

You have already analyzed a message and provided an assessment. The user may have follow-up questions.

Guidelines:
- Use simple, clear language
- Be patient and reassuring
- Avoid technical jargon
- Provide specific, actionable advice
- If you don't know something, say so honestly
- Always encourage consulting with family members for major decisions

Previous analysis context will be provided. Answer the user's question based on this context.`;

const SEARCH_VERIFICATION_PROMPT = `You are a research assistant verifying potential scam reports. Search for information about the described scam and provide:
1. Whether similar scams have been reported
2. Any official warnings from authorities
3. Relevant news articles or alerts

Provide a brief summary of your findings.`;

/**
 * Convert a file to base64 for the API
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Analyze content for potential scams
 */
export async function analyzeContent(
  text: string,
  files: File[] = []
): Promise<Omit<ScamAnalysis, 'id' | 'created_at'>> {
  const client = getClient();

  // Build the content parts
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  // Add text content
  if (text) {
    parts.push({ text: `Please analyze the following content for potential scams:\n\n${text}` });
  }

  // Add file content
  for (const file of files) {
    const base64 = await fileToBase64(file);
    parts.push({
      inlineData: {
        mimeType: file.type,
        data: base64,
      },
    });

    if (file.type.startsWith('audio/')) {
      parts.push({ text: 'Please transcribe this audio and analyze it for potential scams.' });
    } else if (file.type.startsWith('image/')) {
      parts.push({ text: 'Please analyze this image for potential scam indicators.' });
    }
  }

  if (parts.length === 0) {
    throw new Error('No content provided for analysis');
  }

  const response = await client.models.generateContent({
    model: AI_MODELS.ANALYSIS,
    contents: [{ role: 'user', parts }],
    config: {
      systemInstruction: SCAM_ANALYSIS_PROMPT,
      temperature: AI_CONFIG.TEMPERATURE,
      maxOutputTokens: AI_CONFIG.MAX_TOKENS,
      responseMimeType: 'application/json',
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('No response from AI model');
  }

  try {
    const analysis = JSON.parse(responseText);
    return analysis;
  } catch {
    throw new Error('Failed to parse AI response');
  }
}

/**
 * Verify scam with web search
 */
export async function verifyWithSearch(
  query: string
): Promise<{ text: string; sources: SearchSource[] }> {
  const client = getClient();

  const response = await client.models.generateContent({
    model: AI_MODELS.CHAT,
    contents: [{ role: 'user', parts: [{ text: query }] }],
    config: {
      systemInstruction: SEARCH_VERIFICATION_PROMPT,
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || 'Unable to verify through web search.';

  // Extract sources from grounding metadata if available
  const sources: SearchSource[] = [];
  const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
  if (groundingMetadata?.groundingChunks) {
    for (const chunk of groundingMetadata.groundingChunks) {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || 'Source',
          url: chunk.web.uri || '',
        });
      }
    }
  }

  return { text, sources };
}

/**
 * Ask a follow-up question about the analysis
 */
export async function askFollowUp(
  analysis: ScamAnalysis,
  question: string
): Promise<string> {
  const client = getClient();

  const context = `
Previous Analysis Summary:
- Risk Level: ${analysis.risk_label}
- Scam Type: ${analysis.scam_type}
- Summary: ${analysis.summary_for_elder}
- Red Flags: ${analysis.red_flags.map((f) => f.text).join(', ')}
- Recommended Actions: ${analysis.safe_actions_for_elder.join(', ')}
`;

  const response = await client.models.generateContent({
    model: AI_MODELS.CHAT,
    contents: [
      { role: 'user', parts: [{ text: `Context:\n${context}\n\nQuestion: ${question}` }] },
    ],
    config: {
      systemInstruction: FOLLOW_UP_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  return response.text || 'I apologize, but I was unable to process your question. Please try again.';
}

/**
 * Generate speech from text using Gemini TTS
 */
export async function speakText(text: string): Promise<void> {
  const client = getClient();

  try {
    const response = await client.models.generateContent({
      model: AI_MODELS.TTS,
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: AI_CONFIG.TTS_VOICE,
            },
          },
        },
      },
    });

    // Get audio data from response
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (audioData?.data) {
      // Convert base64 to audio and play
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioData.data), (c) => c.charCodeAt(0))],
        { type: audioData.mimeType || 'audio/mp3' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();

      // Cleanup after playing
      audio.onended = () => URL.revokeObjectURL(audioUrl);
    }
  } catch (error) {
    console.error('TTS failed:', error);
    // Fallback to browser speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }
}
