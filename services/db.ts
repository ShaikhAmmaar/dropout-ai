
import { StudentWithReport, Institution, User, Alert, AuditLog, SubscriptionPlan, UserRole, RiskCategory } from "../types";

const STORAGE_KEYS = {
  INSTITUTIONS: 'app_institutions_v5',
  USERS: 'app_users_v5',
  STUDENTS: 'app_students_v5',
  ALERTS: 'app_alerts_v5',
  AUDIT_LOGS: 'app_audit_logs_v5'
};

const INITIAL_INSTITUTIONS: Institution[] = [
  { id: 'inst-1', name: 'Apex Enterprise Academy', subscription_plan: SubscriptionPlan.ENTERPRISE, created_at: new Date().toISOString() },
  { id: 'inst-2', name: 'Community College', subscription_plan: SubscriptionPlan.BASIC, created_at: new Date().toISOString() }
];

const INITIAL_STUDENTS: StudentWithReport[] = [
  {
    id: 's-1',
    institution_id: 'inst-1',
    name: 'Maria Garcia',
    email: 'maria@apex.edu',
    attendance_percentage: 85,
    assignment_submission_rate: 90,
    grade_average: 88,
    grade_trend_negative_percentage: 5,
    login_frequency_scaled: 80,
    participation_score: 85,
    disciplinary_flags: 0,
    journal_text: 'I feel a bit overwhelmed but I am managing.',
    gender: 'Female',
    socioeconomic_status: 'Medium',
    urban_or_rural: 'Urban',
    last_updated: new Date().toISOString(),
    history: [],
    report: {
      ml_risk_probability: 22,
      final_risk_score: 22,
      risk_category: RiskCategory.SAFE,
      predicted_30_day_risk: 25,
      crisis_flag: false,
      confidence_score: 94,
      timestamp: new Date().toISOString(),
      feature_importances: [],
      shap_explanation: [
        { feature: 'Attendance', impact: -12 },
        { feature: 'Emotional State', impact: 5 }
      ],
      anomaly_flag: false,
      emotional_drift_flag: false,
      improvement_simulation: { attendance_plus_10: 18, submission_plus_10: 20 }
    }
  },
  {
    id: 's-2',
    institution_id: 'inst-1',
    name: 'James Wilson',
    email: 'james@apex.edu',
    attendance_percentage: 30,
    assignment_submission_rate: 20,
    grade_average: 45,
    grade_trend_negative_percentage: 60,
    login_frequency_scaled: 10,
    participation_score: 5,
    disciplinary_flags: 3,
    journal_text: 'I am not coming back next week. It is too much.',
    gender: 'Male',
    socioeconomic_status: 'Low',
    urban_or_rural: 'Rural',
    last_updated: new Date().toISOString(),
    history: [],
    report: {
      ml_risk_probability: 88,
      final_risk_score: 88,
      risk_category: RiskCategory.HIGH,
      predicted_30_day_risk: 95,
      crisis_flag: true,
      confidence_score: 88,
      timestamp: new Date().toISOString(),
      feature_importances: [],
      shap_explanation: [
        { feature: 'Attendance', impact: 25 },
        { feature: 'Grade Trend', impact: 18 }
      ],
      anomaly_flag: true,
      anomaly_reason: "Sudden attendance drop combined with high negative grade trend.",
      emotional_drift_flag: true,
      improvement_simulation: { attendance_plus_10: 78, submission_plus_10: 84 }
    }
  }
];

export const getInstitutions = (): Institution[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(INITIAL_INSTITUTIONS));
    return INITIAL_INSTITUTIONS;
  }
  return JSON.parse(data);
};

export const getStudents = (institutionId: string): StudentWithReport[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS.filter(s => s.institution_id === institutionId);
  }
  const allStudents: StudentWithReport[] = JSON.parse(data);
  return allStudents.filter(s => s.institution_id === institutionId);
};

export const saveStudent = (student: StudentWithReport) => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    let allStudents: StudentWithReport[] = data ? JSON.parse(data) : [];
    const index = allStudents.findIndex(s => s.id === student.id);
    
    if (index >= 0) allStudents[index] = student;
    else allStudents.push(student);
    
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(allStudents));
    logAction(student.institution_id, 'SYSTEM', 'RISK_ASSESSMENT', student.id);
  } catch (err) {
    console.error("Critical: Failed to save to local storage", err);
  }
};

export const getAlerts = (institutionId: string): Alert[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
  const allAlerts: Alert[] = data ? JSON.parse(data) : [];
  return allAlerts.filter(a => a.institution_id === institutionId);
};

export const addAlert = (alert: Omit<Alert, 'id' | 'timestamp' | 'resolved_status'>) => {
  const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
  let allAlerts: Alert[] = data ? JSON.parse(data) : [];
  const newAlert: Alert = {
    ...alert,
    id: `alt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    resolved_status: false
  };
  allAlerts.unshift(newAlert);
  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(allAlerts));
};

export const resolveAlert = (id: string) => {
  const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
  let allAlerts: Alert[] = data ? JSON.parse(data) : [];
  const index = allAlerts.findIndex(a => a.id === id);
  if (index >= 0) {
    allAlerts[index].resolved_status = true;
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(allAlerts));
  }
};

export const logAction = (instId: string, userId: string, action: string, studentId?: string) => {
  const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  let allLogs: AuditLog[] = data ? JSON.parse(data) : [];
  allLogs.unshift({
    id: `log-${Date.now()}`,
    institution_id: instId,
    user_id: userId,
    action_type: action,
    affected_student_id: studentId,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(allLogs.slice(0, 50)));
};

export const getBiasReport = () => {
  const students = INITIAL_STUDENTS; // In a real app, this would use a larger subset
  const gV = 12; // Sample variance values for demo
  const sV = 18;
  const lV = 5;
  return {
    bias_warning: sV > 15,
    variance_gender: gV,
    variance_status: sV,
    variance_location: lV
  };
};
