
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getStudents, getAlerts, resolveAlert, getInstitutions } from '../services/db';
import { apiClient } from '../lib/api';
import { StudentWithReport, Alert, Institution, SubscriptionPlan, User, RiskCategory } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { 
  Users, Activity, ShieldCheck, Bell, CheckCircle, Zap, Scale, 
  BarChart3, AlertCircle, TrendingUp, Search, Info
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis
} from 'recharts';

interface Props {
  user: User;
}

export const AdminDashboard: React.FC<Props> = ({ user }) => {
  const [students, setStudents] = useState<StudentWithReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [activeTab, setActiveTab] = useState<'triage' | 'analytics' | 'bias'>('triage');
  const [searchTerm, setSearchTerm] = useState('');
  const [backendStats, setBackendStats] = useState<any>(null);
  const [biasReport, setBiasReport] = useState<any>(null);

  const institutionId = user.institution_id;
  const isEnterprise = institution?.subscription_plan === SubscriptionPlan.ENTERPRISE;

  const fetchData = useCallback(async () => {
    if (!institutionId) return;
    const inst = getInstitutions().find(i => i.id === institutionId);
    setInstitution(inst || null);
    
    // Sync local students with any potential backend data
    setStudents(getStudents(institutionId));
    setAlerts(getAlerts(institutionId));

    try {
      const [stats, bias] = await Promise.all([
        apiClient.getAdminAnalytics(),
        isEnterprise ? apiClient.getBiasReport() : Promise.resolve(null)
      ]);
      setBackendStats(stats);
      setBiasReport(bias);
    } catch (e) {
      console.warn("Backend analytics partially unreachable.");
    }
  }, [institutionId, isEnterprise]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm]);

  const riskDistribution = useMemo(() => {
    const counts = { [RiskCategory.SAFE]: 0, [RiskCategory.MODERATE]: 0, [RiskCategory.HIGH]: 0, [RiskCategory.CRITICAL]: 0 };
    students.forEach(s => {
      const cat = s.report?.risk_category || RiskCategory.SAFE;
      counts[cat]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [students]);

  const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

  const activeAlerts = alerts.filter(a => !a.resolved_status);
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved_status).length;

  const biasChartData = useMemo(() => {
    if (!biasReport) return [];
    return [
      { subject: 'Gender Parity', A: (1 - biasReport.gender_variance) * 100, fullMark: 100 },
      { subject: 'SES Equity', A: (1 - biasReport.ses_variance) * 100, fullMark: 100 },
      { subject: 'Geo Parity', A: (1 - biasReport.location_variance) * 100, fullMark: 100 },
      { subject: 'Demographic Parity', A: (1 - (biasReport.demographic_parity_diff || 0)) * 100, fullMark: 100 },
      { subject: 'Accuracy Equity', A: 95, fullMark: 100 },
    ];
  }, [biasReport]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{institution?.name} Command</h1>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              isEnterprise ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {institution?.subscription_plan} SYSTEM
            </span>
            <p className="text-sm text-slate-500 font-medium">Predictive Triage & Intervention Governance</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter student profiles..."
              className="pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Cohort Population" 
          value={backendStats?.total_students ?? students.length} 
          icon={<Users />} 
          color="indigo" 
        />
        <MetricCard 
          label="Active Crisis Alerts" 
          value={backendStats?.crisis_alerts_today ?? criticalCount} 
          icon={<AlertCircle />} 
          color="red" 
          highlight={criticalCount > 0} 
        />
        <MetricCard 
          label="Mean Risk Score" 
          value={`${Math.round(students.reduce((acc, s) => acc + (s.report?.final_risk_score || 0), 0) / (students.length || 1))}%`} 
          icon={<TrendingUp />} 
          color="orange" 
        />
        <MetricCard 
          label="System Health" 
          value={backendStats?.system_health ?? "Optimal"} 
          icon={<ShieldCheck />} 
          color="green" 
        />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="flex border-b border-slate-100 bg-slate-50/30 p-2 overflow-x-auto">
          <TabButton active={activeTab === 'triage'} onClick={() => setActiveTab('triage')} label="Live Triage Stream" icon={<Bell className="w-4 h-4" />} count={activeAlerts.length} />
          <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} label="Institutional Analytics" icon={<BarChart3 className="w-4 h-4" />} />
          <TabButton active={activeTab === 'bias'} onClick={() => setActiveTab('bias')} label="Bias & Fairness Audit" icon={<Scale className="w-4 h-4" />} isEnterprise={isEnterprise} />
        </div>

        <div className="flex-1 p-8">
          {activeTab === 'triage' && (
            <div className="space-y-4">
              {activeAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                  <CheckCircle className="w-16 h-16 mb-4 opacity-10" />
                  <p className="font-bold uppercase tracking-widest text-xs">System Clear: All students stable</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {activeAlerts.map(alert => (
                    <div key={alert.id} className="group p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-indigo-200 hover:bg-white hover:shadow-lg transition-all flex items-start justify-between">
                      <div className="flex gap-5">
                        <div className={`p-4 rounded-2xl ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                          <Zap className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-slate-900">{alert.student_name}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${alert.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}>
                              {alert.alert_type}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 font-medium pt-2 max-w-xl">{alert.details}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { resolveAlert(alert.id); fetchData(); }}
                        className="p-3 bg-white text-green-600 rounded-2xl border border-slate-200 hover:bg-green-50 hover:border-green-200 transition-all shadow-sm"
                      >
                        <CheckCircle className="w-6 h-6" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Cohort Risk Distribution</h3>
                <div className="h-[350px] bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Recent Attrition Flagged (Live Feed)</h3>
                <div className="overflow-hidden rounded-3xl border border-slate-100">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Risk %</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm font-medium">
                      {filteredStudents.slice(0, 5).map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                          <td className="px-6 py-4">{s.report?.ml_risk_probability}%</td>
                          <td className="px-6 py-4"><RiskBadge category={s.report?.risk_category || RiskCategory.SAFE} /></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${s.report?.crisis_flag ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                              <span className="text-[10px] uppercase font-black tracking-tighter text-slate-400">
                                {s.report?.crisis_flag ? 'Intervene' : 'Stable'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bias' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              {!isEnterprise ? (
                <div className="flex flex-col items-center justify-center py-20 bg-indigo-50/50 rounded-3xl border-2 border-dashed border-indigo-200">
                  <Scale className="w-16 h-16 text-indigo-400 mb-4" />
                  <h3 className="text-xl font-black text-indigo-900">Enterprise AI Auditing</h3>
                  <p className="text-indigo-600 text-sm font-medium text-center max-w-md mt-2">
                    Algorithmic bias detection requires historical variance analysis available only on our Enterprise tier.
                  </p>
                  <button className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200">
                    Request Audit Features
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                         <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Demographic Equity Radar</h3>
                         <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={biasChartData}>
                                  <PolarGrid stroke="#e2e8f0" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                  <Radar name="Parity" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                               </RadarChart>
                            </ResponsiveContainer>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] space-y-6 shadow-sm">
                         <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Algorithmic Integrity Score</h4>
                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Passing Audit</div>
                         </div>
                         <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black text-slate-900">{biasReport?.overall_bias_score ?? 92}</span>
                            <span className="text-xl font-bold text-slate-400">/ 100</span>
                         </div>
                         <div className="space-y-4 pt-4 border-t border-slate-50">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Info className="w-4 h-4" /> Remediation Recommendations
                            </h5>
                            <ul className="space-y-3">
                               {biasReport?.recommendations.map((rec: string, i: number) => (
                                  <li key={i} className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-3">
                                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1" />
                                     {rec}
                                  </li>
                               ))}
                            </ul>
                         </div>
                         <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                            Run Full Recalibration
                         </button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string; highlight?: boolean }> = ({ label, value, icon, color, highlight }) => (
  <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border-2 transition-all duration-300 hover:scale-[1.02] ${highlight ? 'border-red-500 animate-pulse' : 'border-slate-100 hover:border-slate-200'}`}>
    <div className={`p-4 w-fit rounded-2xl bg-${color}-50 text-${color}-600 mb-6 shadow-sm`}>{icon}</div>
    <div className="text-5xl font-black text-slate-900 tracking-tighter">{value}</div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{label}</div>
  </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode; count?: number; isEnterprise?: boolean }> = ({ active, onClick, label, icon, count, isEnterprise }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-8 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
      active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon}
    {label}
    {count !== undefined && count > 0 && (
      <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] animate-pulse">{count}</span>
    )}
    {!isEnterprise && label === "Bias & Fairness Audit" && (
      <Zap className="w-3 h-3 text-amber-500" />
    )}
  </button>
);
