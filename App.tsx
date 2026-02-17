
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { GraduationCap, LayoutDashboard, LogOut, ShieldAlert, Building2, Terminal } from 'lucide-react';
import { login, logout, getCurrentUser } from './services/authService';
import { logAction } from './services/db';
import { User, UserRole } from './types';

const App: React.FC = () => {
  // Use a stable initializer for user state to prevent repeated getCurrentUser() calls
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [activeView, setActiveView] = useState<'admin' | 'student'>('student');
  const [isInitializing, setIsInitializing] = useState(true);

  // Derive default view from user role only when the user object actually changes (ID comparison)
  useEffect(() => {
    if (user) {
      const targetView = user.role === UserRole.STUDENT ? 'student' : 'admin';
      if (activeView !== targetView) {
        setActiveView(targetView);
      }
    }
  }, [user?.id, user?.role, activeView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = useCallback((u: User) => {
    login(u);
    setUser(u);
    logAction(u.institution_id, u.id, 'LOGIN');
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-mono">
        <div className="text-indigo-400 flex flex-col items-center gap-4">
          <Terminal className="w-12 h-12 animate-pulse" />
          <p className="text-sm tracking-widest">INITIALIZING ENTERPRISE AI TRIAGE...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-100">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Enterprise AI Portal</h1>
            <p className="text-slate-500 text-sm text-center mt-2">Accessing Phase 5 Optimized Infrastructure</p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin({ id: 'u-admin', institution_id: 'inst-1', role: UserRole.INSTITUTION_ADMIN, name: 'Apex Admin', email: 'admin@apex.edu' })}
              className="w-full flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-2xl hover:bg-indigo-100 transition-all text-left"
            >
              <div className="bg-white p-2 rounded-lg"><LayoutDashboard className="w-6 h-6" /></div>
              <div>
                <div className="font-bold">Enterprise Admin</div>
                <div className="text-[10px] uppercase font-bold opacity-70 tracking-wider">Apex Academy • Pro Access</div>
              </div>
            </button>

            <button 
              onClick={() => handleLogin({ id: 'u-maria', institution_id: 'inst-1', role: UserRole.STUDENT, name: 'Maria Garcia', email: 'maria@apex.edu' })}
              className="w-full flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl hover:bg-slate-100 transition-all text-left"
            >
              <div className="bg-white p-2 rounded-lg"><GraduationCap className="w-6 h-6" /></div>
              <div>
                <div className="font-bold">Student Portal</div>
                <div className="text-[10px] uppercase font-bold opacity-70 tracking-wider">Secure Assessment View</div>
              </div>
            </button>

            <button 
              onClick={() => handleLogin({ id: 'u-basic', institution_id: 'inst-2', role: UserRole.INSTITUTION_ADMIN, name: 'CC Admin', email: 'admin@cc.edu' })}
              className="w-full flex items-center gap-4 p-4 bg-slate-100 border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all text-left grayscale hover:grayscale-0"
            >
              <div className="bg-white p-2 rounded-lg"><Building2 className="w-6 h-6" /></div>
              <div>
                <div className="font-bold">Basic Admin</div>
                <div className="text-[10px] uppercase font-bold opacity-70 tracking-wider">Limited Functional Tier</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 hidden md:block tracking-tight">AI Crisis SaaS</span>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          {user.role !== UserRole.STUDENT && (
            <button
              onClick={() => setActiveView('admin')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Institutional Overview
            </button>
          )}
          <button
            onClick={() => setActiveView('student')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            My Assessments
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-slate-800">{user.name}</span>
            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-tighter">{user.role}</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        {activeView === 'student' ? (
          <StudentDashboard user={user} />
        ) : (
          <AdminDashboard user={user} />
        )}
      </main>

      <footer className="bg-white border-t p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Enterprise Triage Engine • SaaS Phase 5 Stabilization
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold text-green-600">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          AI SERVICES ONLINE (RF v2.5 / GEMINI-FLASH)
        </div>
      </footer>
    </div>
  );
};

export default App;
