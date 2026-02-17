
/**
 * API Client for interacting with the FastAPI Backend.
 * Uses environment variables for the base URL, falling back to localhost for development.
 */

const getApiBaseUrl = () => {
  try {
    // Attempt to get from process.env (Next.js/Vite standard)
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_API_BASE_URL;
    }
    // Attempt to get from window (Common in some CI/CD injections)
    if ((window as any).process?.env?.NEXT_PUBLIC_API_BASE_URL) {
      return (window as any).process.env.NEXT_PUBLIC_API_BASE_URL;
    }
  } catch (e) {
    console.warn("API Base URL environment variable not found, using default.");
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

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
    const response = await fetch(`${API_BASE_URL}/api/predict-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  /**
   * Analyzes student journal text for emotional distress and crisis markers.
   */
  async analyzeMentalHealth(text: string, studentId: string) {
    const response = await fetch(`${API_BASE_URL}/api/analyze-mental-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, student_id: studentId }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  /**
   * Fetches the risk history and trend analysis for a specific student.
   */
  async getRiskHistory(studentId: string) {
    const response = await fetch(`${API_BASE_URL}/api/risk-history?student_id=${studentId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
};
