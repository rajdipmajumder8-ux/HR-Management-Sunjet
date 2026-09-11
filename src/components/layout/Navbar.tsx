import React from 'react';
import { 
  Building2, 
  LogOut, 
  UserCircle2, 
  Menu, 
  ShieldCheck, 
  User,
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onToggleSidebar, 
  activeView, 
  setActiveView 
}) => {
  const { employee, isHRAdmin, logout, quickLogin, isDemoMode, firebaseUser } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {isDemoMode && (
        <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-950 text-white px-1.5 py-0.5 rounded">
              Prototype Sandbox
            </span>
            <span>Operating in simulated demo mode. Real database and storage operations are not affected.</span>
          </div>
          <button
            onClick={logout}
            className="text-[11px] font-bold underline hover:text-amber-900"
          >
            Exit Sandbox to Sign In Live
          </button>
        </div>
      )}
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight block leading-tight">
                NovaHR
              </span>
              <span className="text-[11px] font-medium text-slate-400 hidden sm:block leading-none">
                HR Management Platform
              </span>
            </div>
          </div>
        </div>

        {/* User profile & Quick role switcher */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Status indicator: Live Firebase vs Prototype Sandbox */}
          {isDemoMode ? (
            <div className="hidden md:flex items-center gap-1 bg-amber-50 border border-amber-200 p-1 rounded-xl text-xs">
              <span className="text-[10px] font-bold text-amber-800 px-1.5">Sandbox Role:</span>
              <button
                id="nav-switch-to-admin-btn"
                onClick={async () => {
                  await quickLogin('admin');
                  setActiveView('admin_dashboard');
                }}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                  isHRAdmin 
                    ? 'bg-amber-600 text-white shadow-xs font-semibold' 
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                HR Admin
              </button>
              <button
                id="nav-switch-to-employee-btn"
                onClick={async () => {
                  await quickLogin('employee');
                  setActiveView('emp_dashboard');
                }}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                  !isHRAdmin 
                    ? 'bg-amber-600 text-white shadow-xs font-semibold' 
                    : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                Employee
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] font-medium text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Cloud Firestore</span>
            </div>
          )}

          {employee && (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 sm:border-l border-slate-200">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-900 leading-tight">
                  {employee.fullName}
                </span>
                <span className="text-xs text-slate-500 flex items-center justify-end gap-1">
                  <span>{employee.employeeId}</span>
                  <span>•</span>
                  <span className="capitalize">{employee.position}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge type="role" value={employee.role} />
                <button
                  onClick={() => setActiveView(isHRAdmin ? 'admin_profile' : 'emp_profile')}
                  className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                  title="View Profile"
                >
                  <UserCircle2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
            title="Sign out of system"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
