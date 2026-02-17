
import { StudentWithReport, RiskReport, RiskCategory, SubscriptionPlan } from "../types";
import { predictRiskAdvanced } from "./mlService";
import { getInstitutions } from "./db";

export const calculateSaaSRisk = (student: StudentWithReport, emotionalScore: number, isCrisis: boolean): RiskReport => {
  const inst = getInstitutions().find(i => i.id === student.institution_id);
  const plan = inst?.subscription_plan || SubscriptionPlan.BASIC;

  const prediction = predictRiskAdvanced(student, emotionalScore, student.history || []);

  // Base Report
  const report: RiskReport = {
    ml_risk_probability: Math.round(prediction.ml_risk_probability),
    final_risk_score: Math.round(prediction.ml_risk_probability),
    risk_category: prediction.ml_risk_probability > 70 ? RiskCategory.HIGH : prediction.ml_risk_probability > 40 ? RiskCategory.MODERATE : RiskCategory.SAFE,
    predicted_30_day_risk: Math.min(100, Math.round(prediction.ml_risk_probability + (student.grade_trend_negative_percentage * 0.7))),
    crisis_flag: isCrisis,
    confidence_score: prediction.confidence_score,
    timestamp: new Date().toISOString(),
    feature_importances: [],
    shap_explanation: [],
    anomaly_flag: false,
    emotional_drift_flag: false,
    improvement_simulation: { attendance_plus_10: 0, submission_plus_10: 0 }
  };

  // Enterprise Feature Injection
  if (plan === SubscriptionPlan.ENTERPRISE) {
    report.shap_explanation = prediction.shap_explanation;
    report.anomaly_flag = prediction.anomaly_flag;
    report.anomaly_reason = prediction.anomaly_reason;
    report.emotional_drift_flag = prediction.emotional_drift_flag;
    report.improvement_simulation = prediction.improvement_simulation;
    report.feature_importances = prediction.shap_explanation.map(s => ({ feature: s.feature, importance: Math.abs(s.impact) }));
  }

  return report;
};
