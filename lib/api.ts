
/**
 * API Client for interacting with the FastAPI Backend on Render.
 */

// Use the environment variable if available (for production), otherwise fallback to the hardcoded Render URL.
const BASE_URL = 'https://dropout-ai-backend.onrender.com';
const API_V1 = `${BASE_URL}/api/v1`;

export const apiClient = {
  /**
   * Predicts dropout risk based on academic metrics.
   */
  async predictRisk(studentId: string, data: {
    gpa: number;
    attendance_percentage: number;
    assignment_completion_rate: number;
    backlogs: number;
  }) {
    const response = await fetch(`${API_V1}/risk/predict/${studentId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Backend error: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Analyzes student journal text for emotional distress.
   */
  async analyzeMentalHealth(studentId: string, text: string) {
    const response = await fetch(`${API_V1}/mental-health/log/${studentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text_entry: text }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Backend error: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Fetches the analytics for the admin dashboard.
   */
  async getAdminAnalytics() {
    const response = await fetch(`${API_V1}/admin/analytics`);
    if (!response.ok) {
      throw new Error(`Backend analytics error: ${response.status}`);
    }
    return response.json();
  }
};
