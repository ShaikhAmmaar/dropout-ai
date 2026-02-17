
/**
 * API Client for interacting with the FastAPI Backend on Render.
 * Hardcoded values for direct Vercel deployment as requested.
 */

const API_BASE_URL = 'https://dropout-ai-backend.onrender.com';

export const apiClient = {
  /**
   * Predicts dropout risk based on academic metrics.
   */
  async predictRisk(data: {
    student_id: string;
    gpa: number;
    attendance_percentage: number;
    assignment_completion_rate: number;
    backlogs: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/risk/predict/${data.student_id}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Backend error: ${response.status}`);
    return response.json();
  },

  /**
   * Analyzes student journal text for emotional distress.
   */
  async analyzeMentalHealth(text: string, studentId: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/mental-health/log/${studentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text_entry: text }),
    });
    if (!response.ok) throw new Error(`Backend error: ${response.status}`);
    return response.json();
  },

  /**
   * Fetches the analytics for the admin dashboard.
   */
  async getAdminAnalytics() {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/analytics`);
    if (!response.ok) throw new Error(`Backend error: ${response.status}`);
    return response.json();
  }
};
