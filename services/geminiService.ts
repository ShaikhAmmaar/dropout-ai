
import { GoogleGenAI, Type } from "@google/genai";
import { EmotionalAnalysis, Intervention, EmotionalState } from "../types";

/**
 * Service for Gemini-powered emotional and intervention analysis.
 */

export const analyzeEmotionalState = async (text: string): Promise<EmotionalAnalysis> => {
  if (!text.trim()) {
    return {
      emotional_state: EmotionalState.NORMAL,
      emotional_score: 0,
      crisis_flag: false,
      confidence_score: 100
    };
  }

  // Always use process.env.API_KEY and correct initialization format
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze: "${text}"`,
      config: {
        systemInstruction: "Detect emotional state (Normal, Stress, Burnout, Anxiety, Depression Signs, Crisis). Return JSON with emotional_state, emotional_score (0-100), crisis_flag, confidence_score.",
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

    // Access .text property directly
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return fallbackAnalysis(text);
  }
};

const fallbackAnalysis = (text: string): EmotionalAnalysis => {
  const crisisKeywords = ["suicide", "kill", "end it", "hurt myself"];
  const isCrisis = crisisKeywords.some(kw => text.toLowerCase().includes(kw));
  return {
    emotional_state: isCrisis ? EmotionalState.CRISIS : EmotionalState.NORMAL,
    emotional_score: isCrisis ? 100 : 20,
    crisis_flag: isCrisis,
    confidence_score: 50,
  };
};

export const generateInterventionPlan = async (name: string, reportData: any): Promise<Intervention> => {
  // Always use process.env.API_KEY and correct initialization format
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate recovery plan for ${name}. Context: ${JSON.stringify(reportData)}`,
      config: {
        systemInstruction: "Generate a supportive 2-week recovery plan.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            recovery_plan: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["message", "recovery_plan", "recommendations"],
        }
      },
    });

    // Access .text property directly
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return {
      message: "Temporary fallback plan generated.",
      recovery_plan: ["Reach out to student services."],
      recommendations: ["Check institutional help docs."],
    };
  }
};
