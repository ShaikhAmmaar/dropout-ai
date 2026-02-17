const API_BASE_URL = (window as any).process?.env?.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const apiClient = {
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
    return response.json();
  },

  async analyzeMentalHealth(text: string) {
    const response = await fetch(`${API_BASE_URL}/api/analyze-mental-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return response.json();
  },

  async getRiskHistory(studentId: string) {
    const response = await fetch(`${API_BASE_URL}/api/risk-history?student_id=${studentId}`);
    return response.json();
  }
};