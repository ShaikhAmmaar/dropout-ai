
/**
 * API Client for interacting with the FastAPI Backend on Render.
 */

const safeGetEnv = (key: string, fallback: string): string => {
  try {
    // 1. Check Vite/Vercel standard
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const val = (import.meta as any).env[key];
      if (val) return val;
    }
    // 2. Safely check process (only if it exists)
    if (typeof process !== 'undefined' && process.env) {
      const val = (process as any).env[key];
      if (val) return val;
    }
  } catch (e) {
    // Silently fail to prevent app crash
  }
  return fallback;
};

// Use the safe helper for the Base URL
const BASE_URL = safeGetEnv('VITE_API_URL', 'https://dropout-ai-backend.onrender.com');
const API_V1 = `${BASE_URL}/api/v1`;

export const apiClient = {
  async predictRisk(studentId: string, data: {
    gpa: number;
    attendance_percentage: number;
    assignment_completion_rate: number;
    backlogs: number;
  }) {
    try {
      const response = await fetch(`${API_V1}/risk/predict/${studentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Backend: ${response.status}`);
      return response.json();
    } catch (err) {
      console.error("PredictRisk failed:", err);
      throw err;
    }
  },

  async analyzeMentalHealth(studentId: string, text: string) {
    try {
      const response = await fetch(`${API_V1}/mental-health/log/${studentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_entry: text }),
      });
      if (!response.ok) throw new Error(`Backend: ${response.status}`);
      return response.json();
    } catch (err) {
      console.error("MentalHealth Analysis failed:", err);
      throw err;
    }
  },

  async getAdminAnalytics() {
    const response = await fetch(`${API_V1}/admin/analytics`);
    if (!response.ok) throw new Error(`Analytics failed: ${response.status}`);
    return response.json();
  }
};
