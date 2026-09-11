import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  HeartPulse, 
  Palmtree, 
  FileText 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { 
  getLeaveBalance, 
  createLeaveRequest, 
  getLeaveRequestsByEmployee 
} from '../../services/leaveService';
import { LeaveBalance, LeaveRequest, LeaveType } from '../../types';

export const LeaveManagementPage: React.FC = () => {
  const { employee } = useAuth();
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Leave application modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    if (!employee) return;
    try {
      setLoading(true);
      const [bal, reqs] = await Promise.all([
        getLeaveBalance(employee.uid),
        getLeaveRequestsByEmployee(employee.uid),
      ]);
      setBalance(bal);
      setRequests(reqs);
    } catch (err: any) {
      console.error('Error loading leave data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [employee]);

  // Calculate days between start and end (inclusive)
  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 1;
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (d2 < d1) return 0;
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const calculatedDays = calculateDays(startDate, endDate);

  const casualAvailable = balance 
    ? Math.max(0, balance.casualLeave - (balance.casualLeaveUsed || 0)) 
    : 0;
  const medicalAvailable = balance 
    ? Math.max(0, balance.medicalLeave - (balance.medicalLeaveUsed || 0)) 
    : 0;

  const currentAvailable = leaveType === 'casual' ? casualAvailable : medicalAvailable;

  const handleOpenModal = () => {
    setErrorMessage(null);
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setReason('');
    setLeaveType('casual');
    setIsModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setErrorMessage(null);

    if (calculatedDays <= 0) {
      setErrorMessage('End date cannot be earlier than start date.');
      return;
    }

    if (calculatedDays > currentAvailable) {
      setErrorMessage(`Insufficient leave balance! You requested ${calculatedDays} days, but only have ${currentAvailable} ${leaveType} leaves available.`);
      return;
    }

    setSubmitting(true);
    try {
      await createLeaveRequest({
        employeeUid: employee.uid,
        employeeId: employee.employeeId,
        employeeName: employee.fullName,
        leaveType,
        startDate,
        endDate,
        daysCount: calculatedDays,
        reason: reason.trim(),
      });

      setSuccessMessage('Leave application submitted successfully. Awaiting HR approval.');
      setIsModalOpen(false);
      await fetchData();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!employee) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review allocated annual leaves, submit requests, and track approval workflows
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Casual Leave Balance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Palmtree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Casual Leave (CL)</h3>
                <p className="text-xs text-slate-400">Personal & vacation allowance</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
              Quota: {balance?.casualLeave || 12}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Available
              </span>
              <span className="text-2xl font-bold text-indigo-700 mt-0.5 block">
                {casualAvailable}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Used This Year
              </span>
              <span className="text-2xl font-bold text-slate-600 mt-0.5 block">
                {balance?.casualLeaveUsed || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Medical Leave Balance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Medical Leave (ML)</h3>
                <p className="text-xs text-slate-400">Health & sickness allowance</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
              Quota: {balance?.medicalLeave || 10}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Available
              </span>
              <span className="text-2xl font-bold text-emerald-700 mt-0.5 block">
                {medicalAvailable}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Used This Year
              </span>
              <span className="text-2xl font-bold text-slate-600 mt-0.5 block">
                {balance?.medicalLeaveUsed || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Previous Leave Requests</h2>
            <p className="text-xs text-slate-400">Historical records and approval statuses</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
            {requests.length} {requests.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading leave applications..." />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No leave requests filed yet"
            description="When you apply for casual or medical leave, your history and approval updates will show here."
            action={
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Apply for Leave</span>
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Dates</th>
                  <th className="pb-3 px-3">Days</th>
                  <th className="pb-3 px-3">Reason</th>
                  <th className="pb-3 px-3">Submitted</th>
                  <th className="pb-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-3 font-semibold text-slate-900 capitalize">
                      {req.leaveType}
                    </td>
                    <td className="py-4 px-3 font-medium text-slate-700 whitespace-nowrap">
                      {req.startDate} to {req.endDate}
                    </td>
                    <td className="py-4 px-3 font-mono font-semibold text-slate-800">
                      {req.daysCount} {req.daysCount === 1 ? 'day' : 'days'}
                    </td>
                    <td className="py-4 px-3 text-slate-600 max-w-xs truncate">
                      {req.reason}
                      {req.rejectionReason && (
                        <span className="block text-[11px] text-rose-600 mt-0.5">
                          Reason: {req.rejectionReason}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(req.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <Badge type="leave" value={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply for Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Leave Application"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Leave Classification *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLeaveType('casual')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  leaveType === 'casual'
                    ? 'border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-bold text-slate-800">Casual Leave</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Available: {casualAvailable} days
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLeaveType('medical')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  leaveType === 'medical'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-bold text-slate-800">Medical Leave</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Available: {medicalAvailable} days
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Duration Requested:</span>
            <span className="font-bold text-indigo-700 font-mono">
              {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Absence *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a brief reason for your absence..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || calculatedDays <= 0}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit for HR Approval'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
