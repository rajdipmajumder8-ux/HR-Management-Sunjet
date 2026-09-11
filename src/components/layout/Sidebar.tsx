import React from 'react';
import { 
  LayoutDashboard, 
  UserCircle, 
  FileCheck, 
  CalendarDays, 
  Palmtree, 
  Users, 
  CheckSquare, 
  ShieldAlert, 
  Settings2, 
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  pendingLeavesCount?: number;
  pendingKYCCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeView,
  setActiveView,
  pendingLeavesCount = 0,
  pendingKYCCount = 0,
}) => {
  const { isHRAdmin, employee } = useAuth();

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const employeeMenuItems = [
    {
      id: 'emp_dashboard',
      label: 'Employee Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics',
    },
    {
      id: 'emp_profile',
      label: 'Employee Profile',
      icon: UserCircle,
      description: 'Personal & work details',
    },
    {
      id: 'emp_kyc',
      label: 'KYC Documents',
      icon: FileCheck,
      description: 'Upload & verification',
      badge: employee?.kycStatus === 'pending' ? 'Pending' : undefined,
      badgeColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'emp_leaves',
      label: 'Leave Management',
      icon: CalendarDays,
      description: 'Balances & requests',
    },
    {
      id: 'emp_holidays',
      label: 'Holiday List',
      icon: Palmtree,
      description: 'Company calendar',
    },
  ];

  const adminMenuItems = [
    {
      id: 'admin_dashboard',
      label: 'Admin Dashboard',
      icon: LayoutDashboard,
      description: 'HR overview & alerts',
    },
    {
      id: 'admin_employees',
      label: 'Employee Management',
      icon: Users,
      description: 'Directory & onboarding',
    },
    {
      id: 'admin_kyc',
      label: 'KYC Verification',
      icon: UserCheck,
      description: 'Review documents',
      badge: pendingKYCCount > 0 ? `${pendingKYCCount}` : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'admin_leaves',
      label: 'Leave Approval',
      icon: CheckSquare,
      description: 'Review & deduct balance',
      badge: pendingLeavesCount > 0 ? `${pendingLeavesCount}` : undefined,
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      id: 'admin_holidays',
      label: 'Holiday Management',
      icon: Palmtree,
      description: 'Add & configure holidays',
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-68 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          {/* HR / Admin View Navigation */}
          {isHRAdmin && (
            <div>
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  HR Management
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  <ShieldAlert className="w-3 h-3" /> Admin
                </span>
              </div>
              <nav className="space-y-1">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Employee Navigation Section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {isHRAdmin ? 'Personal Workspace' : 'Employee Self-Service'}
              </span>
            </div>
            <nav className="space-y-1">
              {employeeMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom card with company info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-700">Small/Medium Org Edition</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Cloud Firestore & Storage Ready</p>
          </div>
        </div>
      </aside>
    </>
  );
};
