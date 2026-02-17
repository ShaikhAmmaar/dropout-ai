import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { GraduationCap, LayoutDashboard, LogOut, ShieldAlert, Terminal, Loader2 } from 'lucide-react';
import { login, logout, getCurrentUser } from './services/authService';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [activeView, setActiveView] = useState<'admin' | 'student'>('student');
  const [isInitializing, setIsInitializing] = useState(true);

  // Memoized user ID for stable dependencies
  const userId = user?.id;
  const userRole = user?.role;

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (userRole) {
      setActiveView(userRole === UserRole.STUDENT ? 'student' : 'admin');
    }
  }, [userRole]);

  const handleLogin = useCallback((u: User) => {
    login(u);
    setUser(u);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-indigo-500 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-xs font-mono tracking-[0.3em] uppercase">Booting Enterprise AI Systems...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center leading-tight">Crisis AI<br/><span className="text-indigo-600">Secure Access</span></h1>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin({ id: 'u-admin', institution_id: 'inst-1', role: UserRole.INSTITUTION_ADMIN, name: 'Admin User', email: 'admin@apex.edu' })}
              className="w-full flex items-center gap-4 p-5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-3xl hover:bg-indigo-100 transition-all text-left group"
            >
              <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><LayoutDashboard className="w-6 h-6" /></div>
              <div>
                <div className="font-bold text-lg">Institution Admin</div>
                <div className="text-[10px] uppercase font-black opacity-50 tracking-widest">Enterprise Access</div>
              </div>
            </button>

            <button 
              onClick={() => handleLogin({ id: 'u-maria', institution_id: 'inst-1', role: UserRole.STUDENT, name: 'Maria Garcia', email: 'maria@apex.edu' })}
              className="w-full flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 text-slate-700 rounded-3xl hover:bg-slate-100 transition-all text-left group"
            >
              <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><GraduationCap className="w-6 h-6" /></div>
              <div>
                <div className="font-bold text-lg">Student Portal</div>
                <div className="text-[10px] uppercase font-black opacity-50 tracking-widest">Secure Evaluation</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl text-slate-900 tracking-tighter">TRIAGE AI</span>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          {userRole !== UserRole.STUDENT && (
            <button
              onClick={() => setActiveView('admin')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'admin' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Overview
            </button>
          )}
          <button
            onClick={() => setActiveView('student')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'student' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Assessments
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-bold text-slate-900">{user.name}</span>
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{userRole}</span>
          </div>
          <button onClick={handleLogout} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="flex-1">
        {activeView === 'student' ? (
          <StudentDashboard user={user} />
        ) : (
          <AdminDashboard user={user} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Phase 5 Production Infrastructure • Secure Node
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          BACKEND SERVICES: ONLINE
        </div>
      </footer>
    </div>
  );
};

export default App;