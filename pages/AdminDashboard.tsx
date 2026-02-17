
import React, { useState, useEffect } from 'react';
import { getStudents, getAlerts, resolveAlert, getInstitutions, logAction } from '../services/db';
import { StudentWithReport, Alert, Institution, SubscriptionPlan, User } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { 
  Users, 
  Activity, 
  ShieldCheck,
  BrainCircuit,
  Eye,
  Scale,
  Bell,
  CheckCircle,
  LayoutGrid,
  Zap
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

interface Props {
  user: User;
}

export const AdminDashboard: React.FC<Props> = ({ user }) => {
  const [students, setStudents] = useState<StudentWithReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);

  const fetchData = React.useCallback(() => {
    if (!user) return;
    const inst = getInstitutions().find(i => i.id === user.institution_id);
    setInstitution(inst || null);
    setStudents(getStudents(user.institution_id));
    setAlerts(getAlerts(user.institution_id));
  }, [user.institution_id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s auto-refresh for "Real-time"
    return () => clearInterval(interval);
  }, [fetchData]);

  const activeAlerts = alerts.filter(a => !a.resolved_status);
  const highRiskCount = students.filter(s => s.report?.risk_category === 'HIGH').length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">{institution?.name} Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              institution?.subscription_plan === SubscriptionPlan.ENTERPRISE ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {institution?.subscription_plan} PLAN
            </span>
            <p className="text-sm text-slate-500">Institutional Governance & Intervention Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
            <Bell className={`w-5 h-5 ${activeAlerts.length > 0 ? 'text-red-500 animate-bounce' : 'text-slate-400'}`} />
            <span className="text-sm font-bold">{activeAlerts.length} Active Alerts</span>
          </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Enrolled Students" value={students.length} icon={<Users />} color="indigo" />
        <MetricCard label="Critical Risk" value={highRiskCount} icon={<Zap />} color="red" highlight={highRiskCount > 0} />
        <MetricCard label="Crisis Incidents" value={alerts.filter(a => a.alert_type === 'CRISIS').length} icon={<Activity />} color="orange" />
        <MetricCard label="System Health" value="99.9%" icon={<ShieldCheck />} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts Center */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" /> Active Alert Stream
            </h3>
            <button className="text-xs font-bold text-indigo-600 hover:underline">View History</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                <CheckCircle className="w-12 h-12 mb-2" />
                <p>No active alerts. System status nominal.</p>
              </div>
            ) : (
              activeAlerts.map(alert => (
                <div key={alert.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg mt-1 ${
                      alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{alert.student_name} <span className="text-xs font-normal text-slate-400">• {alert.alert_type}</span></h4>
                      <p className="text-sm text-slate-600 mt-0.5">{alert.details}</p>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-2 block">{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => resolveAlert(alert.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Plan Feature Gating Info */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
             <LayoutGrid className="w-5 h-5 text-indigo-500" /> Enterprise Insights
           </h3>
           <div className="space-y-4">
              <FeatureItem label="Explainable AI (SHAP)" active={institution?.subscription_plan === SubscriptionPlan.ENTERPRISE} />
              <FeatureItem label="Bias Detection" active={institution?.subscription_plan === SubscriptionPlan.ENTERPRISE} />
              <FeatureItem label="Anomaly Detection" active={institution?.subscription_plan === SubscriptionPlan.ENTERPRISE} />
              <FeatureItem label="What-If Simulations" active={institution?.subscription_plan === SubscriptionPlan.ENTERPRISE} />
              <FeatureItem label="Counselor Triage" active={institution?.subscription_plan !== SubscriptionPlan.BASIC} />
           </div>
           {institution?.subscription_plan !== SubscriptionPlan.ENTERPRISE && (
             <button className="w-full mt-8 bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
               Upgrade to Enterprise
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string; highlight?: boolean }> = ({ label, value, icon, color, highlight }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-all ${highlight ? 'border-red-400 animate-pulse' : 'border-slate-100 hover:border-slate-200'}`}>
    <div className={`p-2 w-fit rounded-lg bg-${color}-100 text-${color}-600 mb-4`}>{icon}</div>
    <div className="text-3xl font-extrabold text-slate-900">{value}</div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

const FeatureItem: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-50">
    <span className={`text-sm ${active ? 'text-slate-700 font-medium' : 'text-slate-300 line-through'}`}>{label}</span>
    {active ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Scale className="w-4 h-4 text-slate-200" />}
  </div>
);
