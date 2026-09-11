import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Employee views
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfilePage';
import { KYCUploadPage } from './pages/employee/KYCUploadPage';
import { LeaveManagementPage } from './pages/employee/LeaveManagementPage';
import { HolidayListPage } from './pages/employee/HolidayListPage';

// Admin views
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EmployeeManagementPage } from './pages/admin/EmployeeManagementPage';
import { KYCVerificationPage } from './pages/admin/KYCVerificationPage';
import { LeaveApprovalPage } from './pages/admin/LeaveApprovalPage';
import { HolidayManagementPage } from './pages/admin/HolidayManagementPage';
import { Employee } from './types';
import { getAllKYCDocuments } from './services/kycService';
import { getAllLeaveRequests } from './services/leaveService';

const AppContent: React.FC = () => {
  const { firebaseUser, employee, loading, isHRAdmin } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState<string>('emp_dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAdminEmployee, setSelectedAdminEmployee] = useState<Employee | null>(null);

  // Badges count for admin
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [pendingKYCCount, setPendingKYCCount] = useState(0);

  // Set default view on login based on user role
  useEffect(() => {
    if (employee) {
      if (employee.role === 'hr_admin' && currentView === 'emp_dashboard') {
        setCurrentView('admin_dashboard');
      } else if (employee.role === 'employee' && currentView.startsWith('admin_')) {
        setCurrentView('emp_dashboard');
      }
    }
  }, [employee]);

  // Load badge counts for admin
  useEffect(() => {
    if (isHRAdmin) {
      const loadCounts = async () => {
        try {
          const [docs, leaves] = await Promise.all([
            getAllKYCDocuments(),
            getAllLeaveRequests(),
          ]);
          setPendingKYCCount(docs.filter((d) => d.status === 'pending').length);
          setPendingLeavesCount(leaves.filter((l) => l.status === 'pending').length);
        } catch (e) {
          // Non-critical background count
        }
      };
      loadCounts();
    }
  }, [isHRAdmin, currentView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <LoadingSpinner message="Connecting to secure HR workspace..." fullHeight />
      </div>
    );
  }

  // Unauthenticated view
  if (!employee) {
    if (authMode === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
  }

  // Safety guard: Non-admins cannot access admin views
  const effectiveView = (!isHRAdmin && currentView.startsWith('admin_')) ? 'emp_dashboard' : currentView;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        activeView={effectiveView}
        setActiveView={setCurrentView}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar Navigation */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeView={effectiveView}
          setActiveView={setCurrentView}
          pendingLeavesCount={pendingLeavesCount}
          pendingKYCCount={pendingKYCCount}
        />

        {/* Content Container - Offset for fixed sidebar on lg screens */}
        <main className="flex-1 min-w-0 lg:pl-68">
          {effectiveView === 'emp_dashboard' && (
            <EmployeeDashboard onNavigate={setCurrentView} />
          )}

          {effectiveView === 'emp_profile' && (
            <EmployeeProfilePage />
          )}

          {effectiveView === 'emp_kyc' && (
            <KYCUploadPage />
          )}

          {effectiveView === 'emp_leaves' && (
            <LeaveManagementPage />
          )}

          {effectiveView === 'emp_holidays' && (
            <HolidayListPage />
          )}

          {/* Admin Views */}
          {effectiveView === 'admin_dashboard' && isHRAdmin && (
            <AdminDashboard
              onNavigate={setCurrentView}
              onSelectEmployee={(emp) => {
                setSelectedAdminEmployee(emp);
                setCurrentView('admin_employees');
              }}
            />
          )}

          {effectiveView === 'admin_employees' && isHRAdmin && (
            <EmployeeManagementPage initialSelectedEmployee={selectedAdminEmployee} />
          )}

          {effectiveView === 'admin_kyc' && isHRAdmin && (
            <KYCVerificationPage />
          )}

          {effectiveView === 'admin_leaves' && isHRAdmin && (
            <LeaveApprovalPage />
          )}

          {effectiveView === 'admin_holidays' && isHRAdmin && (
            <HolidayManagementPage />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
