import { GoogleGenAI } from '@google/genai';
import type { ScamAnalysis } from '@scamshield/shared';
import { AI_MODELS, AI_CONFIG } from '@scamshield/shared';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

// Initialize Gemini client
const genai = new GoogleGenAI({ apiKey: config.geminiApiKey });

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
  "disclaimer_for_elder": "Reminder that this is AI analysis and to consult family if unsure",
  "transcription": "If audio was provided, include transcription here"
}`;

export const analysisService = {
  /**
   * Analyze content for potential scams
   */
  async analyzeContent(
    text?: string,
    files?: Express.Multer.File[]
  ): Promise<Omit<ScamAnalysis, 'id' | 'created_at'>> {
    try {
      // Build content parts for the API
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      // Add text content
      if (text) {
        parts.push({ text: `Please analyze the following content for potential scams:\n\n${text}` });
      }

      // Add file content
      if (files && files.length > 0) {
        for (const file of files) {
          const base64 = file.buffer.toString('base64');
          parts.push({
            inlineData: {
              mimeType: file.mimetype,
              data: base64,
            },
          });

          if (file.mimetype.startsWith('audio/')) {
            parts.push({ text: 'Please transcribe this audio and analyze it for potential scams.' });
          } else if (file.mimetype.startsWith('image/')) {
            parts.push({ text: 'Please analyze this image for potential scam indicators.' });
          }
        }
      }

      if (parts.length === 0) {
        throw new AppError(400, 'NO_CONTENT', 'No content provided for analysis');
      }

      logger.debug('Sending analysis request to Gemini', {
        model: AI_MODELS.ANALYSIS,
        partsCount: parts.length,
      });

      const response = await genai.models.generateContent({
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
        throw new AppError(500, 'AI_ERROR', 'No response from AI model');
      }

      try {
        const analysis = JSON.parse(responseText);
        logger.info('Analysis completed', {
          riskLevel: analysis.risk_label,
          scamType: analysis.scam_type,
        });
        return analysis;
      } catch {
        logger.error('Failed to parse AI response', undefined, { responseText });
        throw new AppError(500, 'PARSE_ERROR', 'Failed to parse AI response');
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Analysis failed', error);
      throw new AppError(500, 'ANALYSIS_FAILED', 'Content analysis failed');
    }
  },

  /**
   * Verify scam with web search
   */
  async verifyWithSearch(query: string): Promise<{ text: string; sources: { title: string; url: string }[] }> {
    try {
      const response = await genai.models.generateContent({
        model: AI_MODELS.CHAT,
        contents: [{ role: 'user', parts: [{ text: query }] }],
        config: {
          systemInstruction: 'You are a research assistant verifying potential scam reports. Search for information about the described scam and summarize your findings.',
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || 'Unable to verify through web search.';
      const sources: { title: string; url: string }[] = [];

      // Extract sources from grounding metadata
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
    } catch (error) {
      logger.error('Search verification failed', error);
      return { text: 'Unable to verify through web search.', sources: [] };
    }
  },

  /**
   * Ask follow-up question about analysis
   */
  async askFollowUp(context: ScamAnalysis, question: string): Promise<string> {
    try {
      const contextText = `
Previous Analysis Summary:
- Risk Level: ${context.risk_label}
- Scam Type: ${context.scam_type}
- Summary: ${context.summary_for_elder}
- Red Flags: ${context.red_flags.map((f) => f.text).join(', ')}
`;

      const response = await genai.models.generateContent({
        model: AI_MODELS.CHAT,
        contents: [
          { role: 'user', parts: [{ text: `Context:\n${contextText}\n\nQuestion: ${question}` }] },
        ],
        config: {
          systemInstruction: 'You are ScamShield, a friendly AI assistant. Answer questions about scam analysis in simple, clear language.',
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      });

      return response.text || 'I apologize, but I was unable to process your question. Please try again.';
    } catch (error) {
      logger.error('Follow-up question failed', error);
      throw new AppError(500, 'CHAT_ERROR', 'Failed to process follow-up question');
    }
  },
};
