
import React, { useState, useEffect, useMemo } from 'react';
import { getStudents, saveStudent, addAlert, getInstitutions } from '../services/db';
import { apiClient } from '../lib/api';
import { analyzeEmotionalState, generateInterventionPlan } from '../services/geminiService';
import { calculateSaaSRisk } from '../services/riskEngine';
import { StudentWithReport, RiskReport, SubscriptionPlan, Institution, User } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { 
  Send, Loader2, ShieldAlert, Info, Zap
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine
} from 'recharts';

interface Props {
  user: User;
}

export const StudentDashboard: React.FC<Props> = ({ user }) => {
  const [student, setStudent] = useState<StudentWithReport | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [journal, setJournal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const userInstId = user.institution_id;
  const userEmail = user.email;

  useEffect(() => {
    const students = getStudents(userInstId);
    const inst = getInstitutions().find(i => i.id === userInstId);
    setInstitution(inst || null);
    
    const match = students.find(s => s.email === userEmail) || students[0] || null;
    setStudent(match);
  }, [userInstId, userEmail]);

  const handleJournalSubmit = async () => {
    if (!student || !journal.trim()) return;
    setIsAnalyzing(true);
    try {
      // 1. Call real backend for Mental Health Analysis
      const mentalHealthResponse = await apiClient.analyzeMentalHealth(student.id, journal);
      
      // 2. Call real backend for Risk Prediction
      const riskResponse = await apiClient.predictRisk(student.id, {
        gpa: student.grade_average / 25, // Convert 0-100 to 0-4 roughly
        attendance_percentage: student.attendance_percentage,
        assignment_completion_rate: student.assignment_submission_rate,
        backlogs: student.disciplinary_flags
      });

      // 3. Optional: LLM Intervention generation (Client-side proxy)
      let intervention = null;
      if (institution?.subscription_plan !== SubscriptionPlan.BASIC && riskResponse.risk_score > 0.4) {
        intervention = await generateInterventionPlan(student.name, { 
          risk_score: riskResponse.risk_score, 
          emotional_state: mentalHealthResponse.emotional_state 
        });
      }

      const updatedReport: RiskReport = {
        ml_risk_probability: Math.round(riskResponse.risk_score * 100),
        final_risk_score: Math.round(riskResponse.risk_score * 100),
        risk_category: riskResponse.risk_level.toUpperCase() as any,
        predicted_30_day_risk: Math.round(riskResponse.risk_score * 110), // Synthetic
        crisis_flag: mentalHealthResponse.crisis_flag,
        confidence_score: 92,
        timestamp: new Date().toISOString(),
        feature_importances: [],
        shap_explanation: Object.entries(riskResponse.shap_values || {}).map(([feature, impact]) => ({
          feature,
          impact: (impact as number) * 100
        })),
        anomaly_flag: false,
        emotional_drift_flag: false,
        improvement_simulation: { attendance_plus_10: 15, submission_plus_10: 12 },
        emotional_analysis: {
          emotional_state: mentalHealthResponse.emotional_state as any,
          emotional_score: mentalHealthResponse.sentiment_score * 100,
          crisis_flag: mentalHealthResponse.crisis_flag,
          confidence_score: 90
        },
        intervention: intervention || undefined,
      };

      const updatedHistory = [...(student.history || []), updatedReport];
      const updatedStudent: StudentWithReport = { 
        ...student, 
        journal_text: journal, 
        report: updatedReport,
        history: updatedHistory,
        last_updated: new Date().toISOString()
      };
      
      saveStudent(updatedStudent);
      setStudent(updatedStudent);

      if (updatedReport.crisis_flag) {
        addAlert({
          institution_id: student.institution_id,
          student_id: student.id,
          student_name: student.name,
          alert_type: 'CRISIS',
          severity: 'CRITICAL',
          details: `Crisis detected by Render Backend: ${journal.substring(0, 50)}...`
        });
      }

      setJournal('');
    } catch (error) {
      console.error("Analysis Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const trendData = useMemo(() => {
    if (!student || !student.history) return [];
    return student.history.slice(-10).map(h => ({
      date: new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      risk: h.ml_risk_probability
    }));
  }, [student]);

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Synchronizing Secure Profile...</p>
        </div>
      </div>
    );
  }

  const plan = institution?.subscription_plan || SubscriptionPlan.BASIC;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Success Portal</h1>
          <p className="text-slate-500 font-medium">{student.name} • {institution?.name}</p>
        </div>
        <div className="flex items-center gap-2">
           {plan === SubscriptionPlan.ENTERPRISE && student.report?.anomaly_flag && (
             <div className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-orange-200">
               <Zap className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-wider">Enterprise Alert: Anomaly Detected</span>
             </div>
           )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Current Risk Probability</h3>
            <div className="flex items-center justify-between mb-6">
              <div className="text-5xl font-black text-slate-900">{student.report?.ml_risk_probability ?? '--'}<span className="text-xl">%</span></div>
              {student.report && <RiskBadge category={student.report.risk_category} />}
            </div>
            <div className="h-32">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <Line 
                      type="monotone" 
                      dataKey="risk" 
                      stroke="#6366f1" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                    />
                  </LineChart>
               </ResponsiveContainer>
            </div>
          </div>

          {plan === SubscriptionPlan.ENTERPRISE && student.report?.shap_explanation && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Info className="w-4 h-4" /> Risk Factor Attribution
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={student.report.shap_explanation} layout="vertical">
                    <XAxis type="number" hide domain={[-30, 30]} />
                    <YAxis dataKey="feature" type="category" width={90} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <ReferenceLine x={0} stroke="#e2e8f0" strokeWidth={2} />
                    <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                      {student.report.shap_explanation.map((e, i) => (
                        <Cell key={i} fill={e.impact > 0 ? '#ef4444' : '#22c55e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium italic">* Real-time SHAP analysis from Render backend.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {plan !== SubscriptionPlan.BASIC && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-indigo-600" /> Academic Intervention Roadmap
              </h3>
              {student.report?.intervention ? (
                <div className="space-y-6">
                  <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                    <p className="text-sm text-indigo-900 leading-relaxed font-medium">"{student.report.intervention.message}"</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next 14 Days Plan</h4>
                      <ul className="space-y-2">
                        {student.report.intervention.recovery_plan.map((s: string, i: number) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="text-indigo-500 font-bold">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-sm text-slate-400 font-medium">Update your journal to generate a personalized AI recovery roadmap.</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reflective Wellness Journal</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">Your entries are processed by the Render Backend for deep sentiment analysis.</p>
            <textarea
              className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none text-slate-700 text-sm font-medium leading-relaxed"
              placeholder="How are your classes going? Is there anything stressing you out lately?"
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
            />
            <div className="flex justify-end mt-6">
              <button 
                disabled={isAnalyzing || !journal.trim()}
                onClick={handleJournalSubmit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Backend Analysis...</>
                ) : (
                  <><Send className="w-5 h-5" /> Submit for Analysis</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
