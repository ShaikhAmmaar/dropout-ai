
export enum RiskCategory {
  SAFE = 'SAFE',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH'
}

export enum EmotionalState {
  NORMAL = 'Normal',
  STRESS = 'Stress',
  BURNOUT = 'Burnout',
  ANXIETY = 'Anxiety',
  DEPRESSION = 'Depression Signs',
  CRISIS = 'Crisis'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  INSTITUTION_ADMIN = 'INSTITUTION_ADMIN',
  COUNSELOR = 'COUNSELOR',
  STUDENT = 'STUDENT'
}

export enum SubscriptionPlan {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface Institution {
  id: string;
  name: string;
  subscription_plan: SubscriptionPlan;
  created_at: string;
}

export interface User {
  id: string;
  institution_id: string;
  role: UserRole;
  name: string;
  email: string;
}

export interface StudentData {
  id: string;
  institution_id: string;
  name: string;
  // Added email to support matching students with their user accounts
  email: string;
  attendance_percentage: number;
  assignment_submission_rate: number;
  grade_average: number;
  grade_trend_negative_percentage: number;
  login_frequency_scaled: number;
  participation_score: number;
  disciplinary_flags: number;
  journal_text: string;
  gender: 'Male' | 'Female' | 'Non-binary';
  socioeconomic_status: 'Low' | 'Medium' | 'High';
  urban_or_rural: 'Urban' | 'Rural';
}

export interface SHAPExplanation {
  feature: string;
  impact: number;
}

export interface ImprovementSimulation {
  attendance_plus_10: number;
  submission_plus_10: number;
}

// Added missing EmotionalAnalysis interface
export interface EmotionalAnalysis {
  emotional_state: EmotionalState;
  emotional_score: number;
  crisis_flag: boolean;
  confidence_score: number;
}

// Added missing Intervention interface
export interface Intervention {
  message: string;
  recovery_plan: string[];
  recommendations: string[];
}

export interface RiskReport {
  ml_risk_probability: number;
  final_risk_score: number;
  risk_category: RiskCategory;
  predicted_30_day_risk: number;
  crisis_flag: boolean;
  confidence_score: number;
  feature_importances: { feature: string; importance: number }[];
  shap_explanation: SHAPExplanation[];
  anomaly_flag: boolean;
  anomaly_reason?: string;
  emotional_drift_flag: boolean;
  improvement_simulation: ImprovementSimulation;
  // Updated from any to specific interfaces
  emotional_analysis?: EmotionalAnalysis;
  intervention?: Intervention;
  timestamp: string;
}

export interface StudentWithReport extends StudentData {
  report?: RiskReport;
  history: RiskReport[];
  last_updated: string;
}

export interface Alert {
  id: string;
  institution_id: string;
  student_id: string;
  student_name: string;
  alert_type: 'CRISIS' | 'ANOMALY' | 'DRIFT';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  resolved_status: boolean;
  details: string;
}

export interface AuditLog {
  id: string;
  institution_id: string;
  user_id: string;
  action_type: string;
  affected_student_id?: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}
