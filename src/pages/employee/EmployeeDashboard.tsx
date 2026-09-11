import React, { useState, useEffect } from 'react';
import { 
  UserCircle2, 
  Calendar, 
  FileCheck2, 
  Clock, 
  Palmtree, 
  ArrowRight, 
  AlertCircle, 
  PlusCircle, 
  DollarSign, 
  Building, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getLeaveBalance, getLeaveRequestsByEmployee } from '../../services/leaveService';
import { getUpcomingHolidays } from '../../services/holidayService';
import { LeaveBalance, LeaveRequest, Holiday } from '../../types';

interface EmployeeDashboardProps {
  onNavigate: (view: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigate }) => {
  const { employee } = useAuth();
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employee) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [balance, leaves, holidays] = await Promise.all([
          getLeaveBalance(employee.uid),
          getLeaveRequestsByEmployee(employee.uid),
          getUpcomingHolidays(),
        ]);
        setLeaveBalance(balance);
        setRecentLeaves(leaves.slice(0, 3));
        setUpcomingHolidays(holidays.slice(0, 4));
      } catch (error) {
        console.error('Error loading employee dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [employee]);

  if (!employee) return null;

  if (loading) {
    return <LoadingSpinner message="Loading your employee dashboard..." fullHeight />;
  }

  const casualRemaining = leaveBalance 
    ? Math.max(0, leaveBalance.casualLeave - (leaveBalance.casualLeaveUsed || 0)) 
    : 0;
  const medicalRemaining = leaveBalance 
    ? Math.max(0, leaveBalance.medicalLeave - (leaveBalance.medicalLeaveUsed || 0)) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Profile Highlights */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0">
              {employee.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Welcome back, {employee.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {employee.employeeId}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                {employee.position} • {employee.department}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('emp_leaves')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
            <button
              onClick={() => onNavigate('emp_kyc')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>KYC Verification</span>
            </button>
          </div>
        </div>

        {/* Essential Employee Profile Data Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Department
            </span>
            <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
              {employee.department}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Reporting Manager
            </span>
            <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
              {employee.manager || 'Executive Lead'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Annual CTC
            </span>
            <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
              {employee.ctc}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Joining Date
            </span>
            <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
              {employee.joiningDate}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              KYC Status
            </span>
            <div className="mt-1">
              <Badge type="kyc" value={employee.kycStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* KYC Alert if not verified */}
      {employee.kycStatus !== 'verified' && (
        <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
          employee.kycStatus === 'rejected'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : employee.kycStatus === 'pending'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-indigo-50 border-indigo-200 text-indigo-900'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">
                {employee.kycStatus === 'rejected'
                  ? 'KYC Verification Action Required'
                  : employee.kycStatus === 'pending'
                  ? 'KYC Documents Under Review'
                  : 'Complete Your KYC Verification'}
              </h4>
              <p className="text-xs mt-0.5 opacity-90">
                {employee.kycStatus === 'rejected'
                  ? 'One or more of your identity documents were rejected by HR. Please re-upload with corrected details.'
                  : employee.kycStatus === 'pending'
                  ? 'Your identity documents have been submitted and are being reviewed by HR/Admin.'
                  : 'Please upload Aadhaar, PAN, or Bank document to complete compliance onboarding.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('emp_kyc')}
            className="shrink-0 px-3 py-1.5 bg-white text-xs font-semibold rounded-xl border border-current shadow-2xs hover:bg-slate-50 transition-colors"
          >
            {employee.kycStatus === 'pending' ? 'View Documents' : 'Upload Documents'}
          </button>
        </div>
      )}

      {/* Main Grid: Leave Balances & Upcoming Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leave Balance Cards & Recent Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leave Balance Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Casual Leave Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500">Casual Leave</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {casualRemaining}
                </span>
                <span className="text-xs text-slate-500">
                  / {leaveBalance?.casualLeave || 12} days available
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      ((casualRemaining / (leaveBalance?.casualLeave || 12)) * 100)
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Used: {leaveBalance?.casualLeaveUsed || 0} days this year
              </p>
            </div>

            {/* Medical Leave Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500">Medical Leave</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {medicalRemaining}
                </span>
                <span className="text-xs text-slate-500">
                  / {leaveBalance?.medicalLeave || 10} days available
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      ((medicalRemaining / (leaveBalance?.medicalLeave || 10)) * 100)
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Used: {leaveBalance?.medicalLeaveUsed || 0} days this year
              </p>
            </div>
          </div>

          {/* Recent Leave Requests */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Recent Leave Requests</h3>
                <p className="text-xs text-slate-400">Latest submitted leave applications</p>
              </div>
              <button
                onClick={() => onNavigate('emp_leaves')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentLeaves.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No leave requests filed yet. Use "Apply for Leave" above.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentLeaves.map((req) => (
                  <div key={req.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 capitalize">
                          {req.leaveType} Leave
                        </span>
                        <span className="text-xs text-slate-400">
                          ({req.daysCount} {req.daysCount === 1 ? 'day' : 'days'})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.startDate} to {req.endDate} • {req.reason}
                      </p>
                    </div>
                    <div>
                      <Badge type="leave" value={req.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Upcoming Holidays Widget */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Palmtree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Upcoming Holidays</h3>
                  <p className="text-[11px] text-slate-400">Company calendar</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('emp_holidays')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                All Holidays
              </button>
            </div>

            {upcomingHolidays.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No upcoming holidays scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcomingHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{holiday.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {holiday.date} ({holiday.dayOfWeek})
                      </p>
                    </div>
                    <Badge type="holiday" value={holiday.type} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Help & HR Contact */}
          <div className="p-5 rounded-3xl bg-linear-to-br from-indigo-900 to-slate-900 text-white">
            <h4 className="text-sm font-bold mb-1">Need HR Assistance?</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Contact People Operations for queries regarding compensation, benefits, or document verification.
            </p>
            <div className="text-xs font-semibold text-indigo-200">
              hr@company.internal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
