
import React, { useState, useEffect, useMemo } from 'react';
import { getStudents, saveStudent, addAlert, getInstitutions, logAction } from '../services/db';
import { analyzeEmotionalState, generateInterventionPlan } from '../services/geminiService';
import { calculateSaaSRisk } from '../services/riskEngine';
import { StudentWithReport, RiskReport, SubscriptionPlan, Institution, User } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { 
  AlertCircle, Send, TrendingUp, Calendar, ShieldAlert, Loader2, History, Info, Zap, Waves
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine
} from 'recharts';

interface Props {
  user: User;
}

export const StudentDashboard: React.FC<Props> = ({ user }) => {
  const [student, setStudent] = useState<StudentWithReport | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [journal, setJournal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Use primitive properties from user to ensure effect doesn't loop if user object identity changes
