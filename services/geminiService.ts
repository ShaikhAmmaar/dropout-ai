
import { GoogleGenAI, Type } from "@google/genai";
import { EmotionalAnalysis, Intervention, EmotionalState } from "../types";

/**
 * Service for Gemini-powered emotional and intervention analysis.
 */

const getApiKey = (): string => {
  try {
    // 1. Check window.process (shimmed in index.html)
    const proc = (window as any).process;
    if (proc?.env?.API_KEY) return proc.env.API_KEY;

    // 2. Check Vite standard
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const env = (import.meta as any).env;
      return env.VITE_GEMINI_API_KEY || env.API_KEY || "";
    }
  } catch (e) {
    console.warn("API Key lookup failed safety check.");
  }
  return "";
};

export const analyzeEmotionalState = async (text: string): Promise<EmotionalAnalysis> => {
  if (!text.trim()) {
    return {
      emotional_state: EmotionalState.NORMAL,
      emotional_score: 0,
      crisis_flag: false,
      confidence_score: 100
    };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Gemini API Key missing. Using local fallback analysis.");
    return fallbackAnalysis(text);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze student entry for distress: "${text}"`,
      config: {
        systemInstruction: "You are a clinical sentiment analyzer. Detect emotional state and return JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotional_state: { type: Type.STRING },
            emotional_score: { type: Type.NUMBER },
            crisis_flag: { type: Type.BOOLEAN },
            confidence_score: { type: Type.NUMBER },
          },
          required: ["emotional_state", "emotional_score", "crisis_flag", "confidence_score"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Gemini call failed:", error);
    return fallbackAnalysis(text);
  }
};

const fallbackAnalysis = (text: string): EmotionalAnalysis => {
  const crisisKeywords = ["suicide", "kill", "end it", "hurt myself", "goodbye"];
  const isCrisis = crisisKeywords.some(kw => text.toLowerCase().includes(kw));
  return {
    emotional_state: isCrisis ? EmotionalState.CRISIS : EmotionalState.NORMAL,
    emotional_score: isCrisis ? 95 : 10,
    crisis_flag: isCrisis,
    confidence_score: 50,
  };
};

export const generateInterventionPlan = async (name: string, reportData: any): Promise<Intervention> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      message: "Direct support required.",
      recovery_plan: ["Contact faculty immediately."],
      recommendations: ["Scheduled counseling session recommended."],
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Intervention for ${name}: ${JSON.stringify(reportData)}`,
      config: {
        systemInstruction: "Generate a supportive academic recovery plan.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            recovery_plan: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["message", "recovery_plan", "recommendations"],
        }
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    return {
      message: "Standard support protocol activated.",
      recovery_plan: ["Review course materials.", "Attend office hours."],
      recommendations: ["Balance study and rest."],
    };
  }
};
