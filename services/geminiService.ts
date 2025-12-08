
import { GoogleGenAI, Modality } from "@google/genai";
import { SCAM_SHIELD_SYSTEM_PROMPT, FOLLOW_UP_SYSTEM_PROMPT, SEARCH_VERIFICATION_PROMPT } from "../constants";
import { AnalysisResponse, FileInput, ScamAnalysis, SearchVerificationResult } from "../types";

export const analyzeContent = async (
  text: string,
  files: FileInput[]
): Promise<AnalysisResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = [];

  // Add text if present
  if (text.trim()) {
    parts.push({ text: text });
  }

  // Process files
  for (const fileInput of files) {
    const base64Data = await fileToBase64(fileInput.file);
    const mimeType = fileInput.file.type;
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

  try {
    // UPDATED: Use gemini-3-pro-preview with Thinking Config for deeper analysis
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      config: {
        systemInstruction: SCAM_SHIELD_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 32768 } // Max thinking budget for Pro
      },
      contents: {
        role: "user",
        parts: parts,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from the AI.");
    }

    const jsonResponse = JSON.parse(responseText) as AnalysisResponse;
    return jsonResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("I had trouble analyzing that. Please try again or ask a family member for help.");
  }
};

export const verifyScamWithSearch = async (text: string): Promise<SearchVerificationResult> => {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        // UPDATED: Use gemini-2.5-flash with Google Search Tool
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: SEARCH_VERIFICATION_PROMPT,
                tools: [{ googleSearch: {} }]
            },
            contents: {
                role: "user",
                parts: [{ text: `Check this content for scam reports: ${text.substring(0, 500)}` }]
            }
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((c: any) => c.web ? { uri: c.web.uri, title: c.web.title } : null)
            .filter((s: any) => s !== null) || [];

        return {
            text: response.text || "No online information found.",
            sources: sources
        };
    } catch (error) {
        console.error("Search Verification Error:", error);
        return { text: "Could not verify online at this time.", sources: [] };
    }
}

export const generateSpeech = async (text: string): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        // UPDATED: Use gemini-2.5-flash-preview-tts for Text-to-Speech
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: {
                parts: [{ text: text }]
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' } // Calm, helpful voice
                    }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio generated");
        return base64Audio;
    } catch (error) {
        console.error("TTS Error:", error);
        throw error;
    }
}

export const askFollowUpQuestion = async (
  analysis: ScamAnalysis,
  question: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing.");
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

    try {
        // Use flash for quick follow-ups
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: FOLLOW_UP_SYSTEM_PROMPT,
            },
            contents: {
                role: "user",
                parts: [{ text: context }]
            }
        });
        return response.text || "I'm sorry, I couldn't understand that. Please ask a trusted family member.";
    } catch (error) {
        console.error("Follow up error", error);
        return "I'm having trouble connecting right now. Please try again later.";
    }
}

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

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

