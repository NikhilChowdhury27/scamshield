import { GoogleGenAI, Modality, Type, Schema } from "@google/genai";
import { SCAM_SHIELD_SYSTEM_PROMPT, FOLLOW_UP_SYSTEM_PROMPT, SEARCH_VERIFICATION_PROMPT } from "../constants";
import { AnalysisResponse, FileInput, ScamAnalysis, SearchVerificationResult } from "../types";

// Schema definition for ScamAnalysis to ensure robust JSON output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.OBJECT,
      properties: {
        risk_score: { type: Type.NUMBER },
        risk_label: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
        scam_type: { type: Type.STRING },
        summary_for_elder: { type: Type.STRING },
        transcription: { type: Type.STRING },
        red_flags: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description_for_elder: { type: Type.STRING }
            },
            required: ["title", "description_for_elder"]
          }
        },
        safe_actions_for_elder: { type: Type.ARRAY, items: { type: Type.STRING } },
        call_script_if_scammer_calls_back: { type: Type.STRING },
        family_alert_text: { type: Type.STRING },
        regulatory_reporting_suggestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              region_hint: { type: Type.STRING },
              description: { type: Type.STRING },
              example_contacts: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["description", "example_contacts"]
          }
        },
        input_interpretation: {
          type: Type.OBJECT,
          properties: {
            content_type: { type: Type.STRING },
            language_detected: { type: Type.STRING },
            sender_claimed_identity: { type: Type.STRING },
            requested_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
            requested_payment_methods: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["content_type", "language_detected"]
        },
        disclaimer_for_elder: { type: Type.STRING }
      },
      required: [
        "risk_score", "risk_label", "scam_type", "summary_for_elder", "red_flags",
        "safe_actions_for_elder", "call_script_if_scammer_calls_back", "family_alert_text",
        "regulatory_reporting_suggestions", "input_interpretation", "disclaimer_for_elder"
      ]
    }
  },
  required: ["analysis"]
};

// Helper to sanitize mime type (remove codecs, etc)
const getBaseMimeType = (mimeType: string) => {
  return mimeType.split(';')[0].trim();
};

// Robust check for 503 Overloaded errors including nested JSON structures
const isRetryableError = (error: any): boolean => {
  if (!error) return false;
  
  // Check HTTP status codes (500, 502, 503, 504)
  const status = error.status || error.code || (error.error && error.error.code);
  if ([500, 502, 503, 504].includes(Number(status))) return true;
  
  // Check nested error object status
  if (error.error && error.error.status === 'UNAVAILABLE') return true;
  
  // Check message string content
  const msg = error.message || (error.error && error.error.message) || JSON.stringify(error);
  if (typeof msg === 'string') {
    const lowerMsg = msg.toLowerCase();
    return (
      lowerMsg.includes('overloaded') || 
      lowerMsg.includes('503') || 
      lowerMsg.includes('unavailable') ||
      lowerMsg.includes('resource exhausted') ||
      lowerMsg.includes('no response') ||
      lowerMsg.includes('fetch failed') ||
      lowerMsg.includes('network error')
    );
  }
  
  return false;
};

// Fallback response when API is completely down
const createOfflineAnalysis = (text: string, files: FileInput[]): AnalysisResponse => {
    return {
      analysis: {
        risk_score: 0.5,
        risk_label: "MEDIUM",
        scam_type: "other_or_unknown",
        summary_for_elder: "I'm having trouble connecting to the AI service right now due to high traffic. However, you should always be cautious. If this message asks for money, gift cards, or personal information, assume it is a scam.",
        transcription: "",
        red_flags: [
            {
                title: "Service Unavailable",
                description_for_elder: "The AI service is currently overloaded. Treat this message with extra caution."
            }
        ],
        safe_actions_for_elder: [
          "Do not share personal or financial details.",
          "Verify the sender using an official channel or ask a family member.",
          "Try analyzing this message again in a few minutes."
        ],
        call_script_if_scammer_calls_back: "I cannot talk right now. Please do not call again.",
        family_alert_text: "I received a suspicious message but the AI scanner was offline. Can you help me check it?",
        regulatory_reporting_suggestions: [
          {
            region_hint: "Global",
            description: "Report suspicious messages to your local consumer protection agency.",
            example_contacts: []
          }
        ],
        input_interpretation: {
          content_type: files.length ? "mixed" : "text",
          language_detected: "unknown",
          sender_claimed_identity: "unknown",
          requested_actions: ["unknown_or_none"],
          requested_payment_methods: ["unknown_or_not_applicable"]
        },
        disclaimer_for_elder: "This is an automated fallback message because the AI service is currently busy."
      }
    };
};

export const analyzeContent = async (
  text: string,
  files: FileInput[],
  userLocation?: string
): Promise<AnalysisResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key missing - returning fallback analysis");
    return createOfflineAnalysis(text, files);
  }

  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];
  
  // Inject location into context if available
  let promptText = text;
  if (userLocation) {
    promptText = `[USER LOCATION CONTEXT: ${userLocation}. Please provide specific regulatory reporting suggestions (emails, phone numbers, websites) relevant to this location in the JSON response.]\n\n${text}`;
  }

  // Add text if present
  if (promptText.trim()) {
    parts.push({ text: promptText });
  }

  // Process files
  for (const fileInput of files) {
    const base64Data = await fileToBase64(fileInput.file);
    const mimeType = getBaseMimeType(fileInput.file.type);
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    });
  }

  if (parts.length === 0) {
    throw new Error("Please provide some text or a file to analyze.");
  }

  const generateWithModel = async (modelName: string) => {
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          config: {
            systemInstruction: SCAM_SHIELD_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
          },
          contents: {
            parts: parts,
          },
        });

        let responseText = response.text;
        if (!responseText) {
          throw new Error("No response received from the AI.");
        }

        responseText = responseText.replace(/```json\n?|```/g, "").trim();
        return JSON.parse(responseText) as AnalysisResponse;
        
      } catch (error: any) {
        if (isRetryableError(error) && attempt < maxRetries - 1) {
            const delay = 1000 * Math.pow(2, attempt); // Reduced delay: 1s, 2s, 4s for faster feedback
            console.warn(`Model ${modelName} issue, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
        }
        throw error;
      }
    }
    throw new Error("Max retries exceeded");
  };

  // Strategy: Try Flash (Fast) -> Fallback to Pro (Powerful) -> Fallback to Offline
  // Changed priority to Flash for speed
  try {
    return await generateWithModel("gemini-2.5-flash");
  } catch (error) {
    console.warn("Gemini 2.5 Flash failed, falling back to Gemini 3 Pro:", error);
    try {
      return await generateWithModel("gemini-3-pro-preview");
    } catch (fallbackError) {
      console.error("All models failed. Returning offline fallback.", fallbackError);
      return createOfflineAnalysis(text, files);
    }
  }
};

export const verifyScamWithSearch = async (text: string): Promise<SearchVerificationResult> => {
    if (!process.env.API_KEY || !text.trim()) {
        return { text: "Online verification skipped.", sources: [] };
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const generateWithModel = async (modelName: string) => {
      const maxRetries = 3;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                config: {
                    systemInstruction: SEARCH_VERIFICATION_PROMPT,
                    tools: [{ googleSearch: {} }]
                },
                contents: {
                    parts: [{ text: `Search for known scams matching this content: "${text.substring(0, 300)}"` }]
                }
            });

            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
                ?.map((c: any) => c.web ? { uri: c.web.uri, title: c.web.title } : null)
                .filter((s: any) => s !== null) || [];

            return {
                text: response.text || "No specific online reports found.",
                sources: sources
            };
        } catch (error: any) {
            if (isRetryableError(error) && attempt < maxRetries - 1) {
                const delay = 1000 * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
      }
      throw new Error("Max retries exceeded");
    };

    try {
        // Use Flash for search as well for better latency
        return await generateWithModel("gemini-2.5-flash");
    } catch (e) {
        console.warn("Search verification with Flash failed, trying Pro fallback...");
        try {
            return await generateWithModel("gemini-3-pro-preview");
        } catch (e2) {
             return { text: "Online verification unavailable due to high traffic.", sources: [] };
        }
    }
}

export const generateSpeech = async (text: string): Promise<string> => {
    if (!process.env.API_KEY) {
        console.warn("API Key missing - TTS skipped");
        return "";
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: {
                    parts: [{ text: text.substring(0, 500) }] // Limit length for TTS
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' }
                        }
                    }
                }
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("No audio generated");
            return base64Audio;
        } catch (error: any) {
            if (isRetryableError(error) && attempt < maxRetries - 1) {
                const delay = 1000 * Math.pow(2, attempt);
                console.warn(`Model overloaded in generateSpeech, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            console.error("TTS Error:", error);
            throw error;
        }
    }
    throw new Error("TTS Service Unavailable");
}

export const askFollowUpQuestion = async (
  analysis: ScamAnalysis,
  question: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        return "I can't reach the analysis service right now. Please try again later.";
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const context = `
    PREVIOUS ANALYSIS:
    Risk Label: ${analysis.risk_label}
    Summary: ${analysis.summary_for_elder}
    Red Flags: ${analysis.red_flags.map(f => f.title).join(', ')}
    
    USER QUESTION:
    ${question}
    `;

    const generateWithModel = async (modelName: string) => {
        const maxRetries = 3;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model: modelName,
                    config: {
                        systemInstruction: FOLLOW_UP_SYSTEM_PROMPT,
                    },
                    contents: {
                        parts: [{ text: context }]
                    }
                });
                if (!response.text) throw new Error("No response");
                return response.text;
            } catch (error: any) {
                if (isRetryableError(error) && attempt < maxRetries - 1) {
                    const delay = 1000 * Math.pow(2, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw error;
            }
        }
        throw new Error("Max retries exceeded");
    };

    try {
        return await generateWithModel("gemini-2.5-flash");
    } catch (e) {
        console.warn("Follow-up with Flash failed, falling back to Pro");
        try {
            return await generateWithModel("gemini-3-pro-preview");
        } catch (e2) {
             return "I'm currently experiencing high traffic and cannot answer. Please try again in a few minutes.";
        }
    }
}

// ---------- Scam News (dynamic) ----------

export interface ScamNewsItem {
  title: string;
  summary: string;
  date: string;
  source: string;
  link?: string;
  severity: "high" | "medium" | "low";
  tags?: string[];
}

export const fetchScamNews = async (
  location: {
    city?: string | null;
    region?: string | null;
    country?: string | null;
  },
  existingTitles: string[] = [], // New parameter for exclusion
  count: number = 6 // Default requested count
): Promise<{ items: ScamNewsItem[]; warning: string | null; error: string | null }> => {
  if (!process.env.API_KEY) {
    const warning = "No API key; showing placeholder news.";
    return { items: [] as ScamNewsItem[], warning, error: warning };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const locationLine = [
    location.city ? `city: ${location.city}` : null,
    location.region ? `region: ${location.region}` : null,
    location.country ? `country: ${location.country}` : null,
  ]
    .filter(Boolean)
    .join("; ");

  // Create exclude clause
  const excludeText = existingTitles.length > 0 
    ? `\nIMPORTANT: Do NOT include these stories which are already shown: ${JSON.stringify(existingTitles)}`
    : "";

  // Optimized prompt: Requests specific count and handles exclusion
  const prompt = `
You are a concise scam news summarizer.
User Location: ${locationLine || "unknown"}

Generate exactly ${count} NEW scam news items relevant to this location from the last 12 months.
${excludeText}

Categorize strictly in the 'tags' array:
- 'city' IF the scam is specific to ${location.city || 'the local city'}
- 'region' IF specific to ${location.region || 'the state/province'}
- 'country' IF specific to ${location.country || 'the country'} (and NOT specific to a single city)
- 'global' IF it is a general trend (worldwide)

JSON Format:
{ "items": [{ "title": "...", "summary": "...", "date": "YYYY-MM-DD", "source": "...", "severity": "high|medium|low", "tags": ["city", "country"] }] }
`;

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [{ text: prompt }] },
        config: { responseMimeType: "application/json" },
      });

      let text = res.text;
      if (!text) throw new Error("Empty response from Gemini");

      text = text.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(text);
      const items = (parsed.items || []) as ScamNewsItem[];
      return { items, warning: null, error: null };
    } catch (err: any) {
      if (isRetryableError(err) && attempt < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, attempt);
        console.warn(`Model overloaded in fetchScamNews, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      return { items: [] as ScamNewsItem[], warning: err.message, error: err.message };
    }
  }

  return { items: [] as ScamNewsItem[], warning: "Service Unavailable", error: "Failed to fetch news." };
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64String = result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};