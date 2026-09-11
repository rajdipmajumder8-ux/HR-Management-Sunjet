import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ArrowRight, 
  PlusCircle, 
  UserCheck, 
  ShieldAlert, 
  Eye, 
  Filter 
} from 'lucide-react';
import { getAllEmployees } from '../../services/employeeService';
import { getAllKYCDocuments } from '../../services/kycService';
import { getAllLeaveRequests } from '../../services/leaveService';
import { Employee, KYCDocument, LeaveRequest, KYCStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
  onSelectEmployee?: (employee: Employee) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onNavigate,
  onSelectEmployee 
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [kycDocs, setKycDocs] = useState<KYCDocument[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state for the embedded employee list
  const [searchQuery, setSearchQuery] = useState('');
  const [kycFilter, setKycFilter] = useState<string>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [emps, docs, leaves] = await Promise.all([
        getAllEmployees(),
        getAllKYCDocuments(),
        getAllLeaveRequests(),
      ]);
      setEmployees(emps);
      setKycDocs(docs);
      setLeaveRequests(leaves);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics
  const totalEmployees = employees.length;
  const pendingKYC = employees.filter((e) => e.kycStatus === 'pending').length;
  const verifiedKYC = employees.filter((e) => e.kycStatus === 'verified').length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending').length;

  // Filter employees for the list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesKyc = 
      kycFilter === 'all' || emp.kycStatus === kycFilter;

    return matchesSearch && matchesKyc;
  });

  if (loading) {
    return <LoadingSpinner message="Loading Admin & HR operational metrics..." fullHeight />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            HR Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time workforce metrics, pending verification queues, and approval workflows
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin_employees')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Manage All Employees</span>
          </button>
        </div>
      </div>

      {/* 4 Core Admin Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div 
          onClick={() => onNavigate('admin_employees')}
          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Employees
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">
            {totalEmployees}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Active company roster in Firestore</p>
        </div>

        {/* Pending KYC Count */}
        <div 
          onClick={() => onNavigate('admin_kyc')}
          className={`rounded-3xl p-5 border shadow-xs cursor-pointer transition-all ${
            pendingKYC > 0 
              ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
              Pending KYC
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-800 tracking-tight">
            {pendingKYC}
          </div>
          <p className="text-[11px] text-amber-700/80 mt-2">Awaiting verification review</p>
        </div>

        {/* Verified KYC Count */}
        <div 
          onClick={() => onNavigate('admin_kyc')}
          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verified KYC
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-700 tracking-tight">
            {verifiedKYC}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Fully compliant employee profiles</p>
        </div>

        {/* Pending Leave Requests */}
        <div 
          onClick={() => onNavigate('admin_leaves')}
          className={`rounded-3xl p-5 border shadow-xs cursor-pointer transition-all ${
            pendingLeaves > 0 
              ? 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-300' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">
              Pending Leaves
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-indigo-700 tracking-tight">
            {pendingLeaves}
          </div>
          <p className="text-[11px] text-indigo-600 mt-2">Requires HR manager review</p>
        </div>
      </div>

      {/* Action Alerts & Shortcuts */}
      {(pendingLeaves > 0 || pendingKYC > 0) && (
        <div className="p-4 rounded-2xl bg-indigo-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-200 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">HR Pending Action Queue</h4>
              <p className="text-xs text-indigo-200 mt-0.5">
                You have {pendingLeaves} leave {pendingLeaves === 1 ? 'request' : 'requests'} and {pendingKYC} KYC {pendingKYC === 1 ? 'submission' : 'submissions'} waiting for your approval.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {pendingLeaves > 0 && (
              <button
                onClick={() => onNavigate('admin_leaves')}
                className="px-3 py-1.5 bg-white text-indigo-900 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Review Leaves ({pendingLeaves})
              </button>
            )}
            {pendingKYC > 0 && (
              <button
                onClick={() => onNavigate('admin_kyc')}
                className="px-3 py-1.5 bg-indigo-700 text-white text-xs font-semibold rounded-xl hover:bg-indigo-600 border border-indigo-500 transition-colors"
              >
                Verify KYC ({pendingKYC})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Employee List Section with Search & KYC Filter */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Company Employee Roster</h2>
            <p className="text-xs text-slate-400">Search and filter active staff records</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, ID, team..."
                className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* KYC Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 px-1">KYC:</span>
              <select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                className="bg-white text-xs font-semibold text-slate-700 py-1 px-2 rounded-lg border border-slate-200 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="not_submitted">Not Submitted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-3">Employee</th>
                <th className="pb-3 px-3">Designation & Team</th>
                <th className="pb-3 px-3">CTC</th>
                <th className="pb-3 px-3">Joining Date</th>
                <th className="pb-3 px-3">KYC Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No employees found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {emp.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{emp.fullName}</span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {emp.employeeId} • {emp.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className="font-semibold text-slate-800 block">{emp.position}</span>
                      <span className="text-slate-500 text-[11px]">{emp.department}</span>
                    </td>
                    <td className="py-4 px-3 font-mono font-semibold text-emerald-700">
                      {emp.ctc}
                    </td>
                    <td className="py-4 px-3 text-slate-600 whitespace-nowrap">
                      {emp.joiningDate}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <Badge type="kyc" value={emp.kycStatus} />
                    </td>
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (onSelectEmployee) onSelectEmployee(emp);
                          onNavigate('admin_employees');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
