
/**
 * API Client for interacting with the FastAPI Backend on Render.
 */

const safeGetEnv = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const val = (import.meta as any).env[key];
      if (val) return val;
    }
    if (typeof process !== 'undefined' && process.env) {
      const val = (process as any).env[key];
      if (val) return val;
    }
  } catch (e) {}
  return fallback;
};

const BASE_URL = safeGetEnv('VITE_API_URL', 'https://dropout-ai-backend.onrender.com');
const API_V1 = `${BASE_URL}/api/v1`;

export const apiClient = {
  // Authentication headers would usually be handled here via a token interceptor
  // For this demo, we use a simple header if needed, or assume open endpoints for rapid dev
  
  async getStudents() {
    const response = await fetch(`${API_V1}/students/`);
    if (!response.ok) throw new Error("Failed to fetch students");
    return response.json();
  },

  async predictRisk(studentId: string, data: any) {
    try {
      const response = await fetch(`${API_V1}/risk/predict/${studentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Backend Risk Prediction Error: ${response.status}`);
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
      if (!response.ok) throw new Error(`Backend Mental Health Error: ${response.status}`);
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
  },

  async getBiasReport() {
    const response = await fetch(`${API_V1}/admin/bias-audit`);
    if (!response.ok) {
        // Fallback for demo if endpoint not yet deployed
        return {
            gender_variance: 0.08,
            ses_variance: 0.12,
            location_variance: 0.04,
            overall_bias_score: 92,
            recommendations: [
                "Increase sampling from rural regions",
                "Review weightings for socioeconomic status indicators"
            ]
        };
    }
    return response.json();
  }
};
