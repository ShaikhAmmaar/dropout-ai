
import React, { useState, useEffect, useCallback } from 'react';
import { getStudents, getAlerts, resolveAlert, getInstitutions } from '../services/db';
import { StudentWithReport, Alert, Institution, SubscriptionPlan, User } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { 
  Users, 
  Activity, 
  ShieldCheck,
  Bell,
  CheckCircle,
  LayoutGrid,
  Zap,
  Scale
} from 'lucide-react';

interface Props {
  user: User;
}

export const AdminDashboard: React.FC<Props> = ({ user }) => {
  const [students, setStudents] = useState<StudentWithReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);

  // Stability fix: use primitive ID to prevent infinite loops
  const institutionId = user.institution_id;

  const fetchData = useCallback(() => {
    if (!institutionId) return;
    const inst = getInstitutions().find(i => i.id === institutionId);
    setInstitution(inst || null);
    setStudents(getStudents(institutionId));
    setAlerts(getAlerts(institutionId));
  }, [institutionId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const activeAlerts = alerts.filter(a => !a.resolved_status);
  const highRiskCount = students.filter(s => s.report?.risk_category === 'HIGH').length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{institution?.name || 'Institutional'} Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
              institution?.subscription_plan === SubscriptionPlan.ENTERPRISE ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {institution?.subscription_plan || 'BASIC'} PLAN
            </span>
            <p className="text-sm text-slate-500 font-medium">Risk Management & Intervention Governance Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <Bell className={`w-5 h-5 ${activeAlerts.length > 0 ? 'text-red-500 animate-bounce' : 'text-slate-400'}`} />
            <span className="text-sm font-bold text-slate-700">{activeAlerts.length} Active System Alerts</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Cohort" value={students.length} icon={<Users className="w-5 h-5" />} color="indigo" />
        <MetricCard label="Critical Risk" value={highRiskCount} icon={<Zap className="w-5 h-5" />} color="red" highlight={highRiskCount > 0} />
        <MetricCard label="Crisis Markers" value={alerts.filter(a => a.alert_type === 'CRISIS').length} icon={<Activity className="w-5 h-5" />} color="orange" />
        <MetricCard label="Model Health" value="99.9%" icon={<ShieldCheck className="w-5 h-5" />} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[500px] overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-xs tracking-widest">
              <Bell className="w-4 h-4 text-indigo-600" /> Live Triage Stream
            </h3>
            <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wider">Archive</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <CheckCircle className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">All students currently stable.</p>
              </div>
            ) : (
              activeAlerts.map(alert => (
                <div key={alert.id} className="p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl mt-1 ${
                      alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-none">{alert.student_name} <span className="text-[10px] font-bold text-slate-400 ml-2">[{alert.alert_type}]</span></h4>
                      <p className="text-sm text-slate-600 mt-2 font-medium">{alert.details}</p>
                      <span className="text-[10px] text-slate-400 font-black uppercase mt-3 block">{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => resolveAlert(alert.id)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-all border border-transparent hover:border-green-200"
                    title="Mark Resolved"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-xs uppercase tracking-widest">
             <LayoutGrid className="w-4 h-4 text-indigo-500" /> Service Tier Capabilities
           </h3>
           <div className="space-y-1">
              <FeatureItem label="Explainable AI (SHAP)" active={institution?.subscription_plan === SubscriptionPlan.ENTERPRISE} />
              <FeatureItem label="Algorithmic Bias Audit" active={institution?.subscription_plan === SubscriptionPlan.ENTERPRISE} />
              <FeatureItem label="Real-time Anomaly Detection" active={institution?.subscription_plan === SubscriptionPlan.ENTERPRISE} />
              <FeatureItem label="What-If Counterfactuals" active={institution?.subscription_plan === SubscriptionPlan.ENTERPRISE} />
              <FeatureItem label="LLM Counselor Triage" active={institution?.subscription_plan !== SubscriptionPlan.BASIC} />
           </div>
           {institution?.subscription_plan !== SubscriptionPlan.ENTERPRISE && (
             <div className="mt-10 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
               <p className="text-xs text-indigo-800 font-bold mb-4 leading-relaxed uppercase tracking-tighter">Access Advanced Triage explainability & Bias reports with Enterprise.</p>
               <button className="w-full bg-indigo-600 text-white py-3 rounded-2xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest">
                 Upgrade Tier
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string; highlight?: boolean }> = ({ label, value, icon, color, highlight }) => (
  <div className={`bg-white p-6 rounded-3xl shadow-sm border-2 transition-all ${highlight ? 'border-red-400 animate-pulse' : 'border-slate-100 hover:border-slate-200'}`}>
    <div className={`p-2.5 w-fit rounded-xl bg-${color}-50 text-${color}-600 mb-4`}>{icon}</div>
    <div className="text-4xl font-black text-slate-900 tracking-tighter">{value}</div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</div>
  </div>
);

const FeatureItem: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
    <span className={`text-xs ${active ? 'text-slate-700 font-bold' : 'text-slate-300 font-medium'}`}>{label}</span>
    {active ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Scale className="w-4 h-4 text-slate-200" />}
  </div>
);
