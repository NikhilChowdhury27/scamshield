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

export const analyzeContent = async (
  text: string,
  files: FileInput[]
): Promise<AnalysisResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key missing - returning fallback analysis");
    return {
      analysis: {
        risk_score: 0.1,
        risk_label: "LOW",
        scam_type: "other_or_unknown",
        summary_for_elder: "Live analysis is offline because the API key is not set. Please try again later or ask a trusted family member to review this message.",
        transcription: "",
        red_flags: [],
        safe_actions_for_elder: [
          "Do not share personal or financial details.",
          "Verify the sender using an official channel or ask a family member."
        ],
        call_script_if_scammer_calls_back: "I need to verify this with my family. I will call back later.",
        family_alert_text: "Analysis was offline (no API key). Please help review this message.",
        regulatory_reporting_suggestions: [
          {
            region_hint: "Global",
            description: "Report suspicious messages to your local consumer protection agency.",
            example_contacts: []
          }
        ],
        input_interpretation: {
          content_type: files.length ? "mixed" : "text",
          language_detected: "en",
          sender_claimed_identity: "unknown",
          requested_actions: ["unknown_or_none"],
          requested_payment_methods: ["unknown_or_not_applicable"]
        },
        disclaimer_for_elder: "This is a limited offline check. For a full analysis, try again later."
      }
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];

  // Add text if present
  if (text.trim()) {
    parts.push({ text: text });
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

  // Retry logic for 503 Overloaded errors
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Use gemini-2.5-flash for reliability and schema support
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash", 
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

        // Clean up potential markdown code blocks (though schema usually prevents this)
        responseText = responseText.replace(/```json\n?|```/g, "").trim();

        try {
            const jsonResponse = JSON.parse(responseText) as AnalysisResponse;
            return jsonResponse;
        } catch (parseError) {
            console.error("JSON Parse Error. Raw response:", responseText);
            throw new Error("I couldn't understand the AI's response. Please try again.");
        }
        
      } catch (error: any) {
        const isOverloaded = error?.status === 503 || (error?.message && (error.message.includes('overloaded') || error.message.includes('503')));
        
        if (isOverloaded) {
            console.warn(`Model overloaded in analyzeContent, retrying (attempt ${attempt + 1}/${maxRetries})...`);
            if (attempt < maxRetries - 1) {
                // Exponential backoff: 2s, 4s, 8s
                await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, attempt)));
                continue;
            }
        }
        
        console.error("Gemini API Error:", error);
        throw new Error("I had trouble analyzing that. Please check your connection or try again.");
      }
  }
  throw new Error("Service Unavailable. Please try again later.");
};

export const verifyScamWithSearch = async (text: string): Promise<SearchVerificationResult> => {
    if (!process.env.API_KEY || !text.trim()) {
        return { text: "Online verification skipped.", sources: [] };
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Retry logic
    const maxRetries = 2;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
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
            const isOverloaded = error?.status === 503 || (error?.message && (error.message.includes('overloaded') || error.message.includes('503')));
            
            if (isOverloaded && attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }
            console.warn("Search Verification Error (Non-fatal):", error);
            // Return fallback instead of throwing to prevent UI crash
            return { text: "Online verification temporarily unavailable.", sources: [] };
        }
    }
    return { text: "Online verification unavailable.", sources: [] };
}

export const generateSpeech = async (text: string): Promise<string> => {
    if (!process.env.API_KEY) {
        console.warn("API Key missing - TTS skipped");
        return "";
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const maxRetries = 2;
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
             const isOverloaded = error?.status === 503;
            if (isOverloaded && attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
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

    const maxRetries = 2;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                config: {
                    systemInstruction: FOLLOW_UP_SYSTEM_PROMPT,
                },
                contents: {
                    parts: [{ text: context }]
                }
            });
            return response.text || "I'm sorry, I couldn't understand that. Please ask a trusted family member.";
        } catch (error: any) {
             const isOverloaded = error?.status === 503;
            if (isOverloaded && attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }
            return "I'm having trouble connecting right now. Please try again later.";
        }
    }
    return "I'm having trouble connecting right now.";
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

export const fetchScamNews = async (location: {
  city?: string | null;
  region?: string | null;
  country?: string | null;
}): Promise<{ items: ScamNewsItem[]; warning: string | null; error: string | null }> => {
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

  const prompt = `
You are a concise scam news summarizer.
Location: ${locationLine || "unknown"}
Return top 25 scam-related news stories from the last 12 months relevant to the location.
Output JSON only: { "items": [{ "title": "...", "summary": "...", "date": "YYYY-MM-DD", "source": "...", "link": "...", "severity": "high|medium|low", "tags": ["city:<slug>", "global"] }] }
`;

  const maxRetries = 2;
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
       const isOverloaded = err?.status === 503;
      if (isOverloaded && attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
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