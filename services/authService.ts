
import { User, UserRole, Institution, SubscriptionPlan } from '../types';

const STORAGE_KEY = 'auth_session';

export const login = (user: User) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const hasPermission = (role: UserRole, action: string): boolean => {
  const permissions: Record<UserRole, string[]> = {
    [UserRole.SUPER_ADMIN]: ['*'],
    [UserRole.INSTITUTION_ADMIN]: ['view_analytics', 'view_bias', 'view_anomalies', 'manage_users'],
    [UserRole.COUNSELOR]: ['view_assigned_students', 'view_alerts'],
    [UserRole.STUDENT]: ['view_own_risk', 'submit_journal']
  };

  const allowed = permissions[role];
  return allowed.includes('*') || allowed.includes(action);
};

export const isFeatureEnabled = (plan: SubscriptionPlan, feature: string): boolean => {
  const planFeatures: Record<SubscriptionPlan, string[]> = {
    [SubscriptionPlan.BASIC]: ['risk_scoring'],
    [SubscriptionPlan.PRO]: ['risk_scoring', 'emotional_analysis', 'intervention'],
    [SubscriptionPlan.ENTERPRISE]: ['risk_scoring', 'emotional_analysis', 'intervention', 'shap', 'bias_detection', 'anomaly_detection', 'what_if']
  };

  return planFeatures[plan].includes(feature);
};
