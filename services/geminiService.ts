
import { GoogleGenAI, Type } from "@google/genai";
import { EmotionalAnalysis, Intervention, EmotionalState } from "../types";

// Note: process.env.API_KEY is expected to be present
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeEmotionalState = async (text: string): Promise<EmotionalAnalysis> => {
  if (!text.trim()) {
    return {
      emotional_state: EmotionalState.NORMAL,
      emotional_score: 0,
      crisis_flag: false,
      confidence_score: 100
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze: "${text}"`,
      config: {
        systemInstruction: "Detect emotional state (Normal, Stress, Burnout, Anxiety, Depression Signs, Crisis). Output JSON with emotional_state, emotional_score (0-100), crisis_flag (boolean), confidence_score.",
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

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.warn("LLM Service Unavailable. Using local heuristics.");
    const crisisKeywords = ["suicide", "kill myself", "end it", "worthless", "hopeless", "hurt myself"];
    const isCrisis = crisisKeywords.some(kw => text.toLowerCase().includes(kw));
    
    return {
      emotional_state: isCrisis ? EmotionalState.CRISIS : EmotionalState.NORMAL,
      emotional_score: isCrisis ? 100 : 20,
      crisis_flag: isCrisis,
      confidence_score: 60,
    };
  }
};

export const generateInterventionPlan = async (name: string, reportData: any): Promise<Intervention> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: ${JSON.stringify(reportData)}. Student: ${name}`,
      config: {
        systemInstruction: "Generate a supportive 2-week recovery plan. Output JSON: {message: string, recovery_plan: string[], recommendations: string[]}",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            recovery_plan: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["message", "recovery_plan", "recommendations"],
        },
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    return {
      message: "Our systems are temporarily overloaded, but we've logged your status for a human counselor to review.",
      recovery_plan: ["Reach out to academic support.", "Focus on one assignment today."],
      recommendations: ["Self-care is priority.", "Schedule a chat with a mentor."],
    };
  }
};
