import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  CalendarDays, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  FileText, 
  ArrowRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getAllLeaveRequests, 
  approveLeaveRequest, 
  rejectLeaveRequest, 
  getLeaveBalance 
} from '../../services/leaveService';
import { LeaveRequest, LeaveBalance, LeaveType } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export const LeaveApprovalPage: React.FC = () => {
  const { employee: currentAdmin } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balancesMap, setBalancesMap] = useState<Record<string, LeaveBalance>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  // Rejection modal
  const [rejectingRequest, setRejectingRequest] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Approve confirmation modal
  const [approvingRequest, setApprovingRequest] = useState<LeaveRequest | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const list = await getAllLeaveRequests();
      setRequests(list);

      // Load balances for employees with pending requests
      const uniqueUids = Array.from(new Set(list.map((r) => r.employeeUid)));
      const balances: Record<string, LeaveBalance> = {};
      await Promise.all(
        uniqueUids.map(async (uid) => {
          try {
            const b = await getLeaveBalance(uid);
            balances[uid] = b;
          } catch (e) {
            // Ignore if individual balance fails
          }
        })
      );
      setBalancesMap(balances);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApproveConfirm = async () => {
    if (!currentAdmin || !approvingRequest) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await approveLeaveRequest(
        approvingRequest.id,
        approvingRequest.employeeUid,
        approvingRequest.leaveType,
        approvingRequest.daysCount,
        currentAdmin.fullName
      );
      setFeedback({
        type: 'success',
        message: `Leave approved! Deducted ${approvingRequest.daysCount} ${approvingRequest.leaveType} leave days from ${approvingRequest.employeeName}'s balance.`,
      });
      setApprovingRequest(null);
      await fetchRequests();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to approve leave request.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin || !rejectingRequest || !rejectionReason.trim()) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await rejectLeaveRequest(
        rejectingRequest.id,
        rejectionReason.trim(),
        currentAdmin.fullName
      );
      setFeedback({
        type: 'success',
        message: `Leave request for ${rejectingRequest.employeeName} was rejected with reason.`,
      });
      setRejectingRequest(null);
      setRejectionReason('');
      await fetchRequests();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reject leave request.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review employee time-off requests with automated balance deduction
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'pending'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'approved'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'rejected'
                ? 'bg-white text-rose-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({requests.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {loading ? (
          <LoadingSpinner message="Loading leave applications..." />
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={statusFilter === 'pending' ? 'No pending leave applications' : 'No requests found'}
            description={
              statusFilter === 'pending'
                ? 'All submitted employee leave applications have been reviewed.'
                : 'No leave applications match the selected filter category.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Employee</th>
                  <th className="pb-3 px-3">Type & Duration</th>
                  <th className="pb-3 px-3">Balance Info</th>
                  <th className="pb-3 px-3">Reason</th>
                  <th className="pb-3 px-3">Submitted</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRequests.map((req) => {
                  const empBalance = balancesMap[req.employeeUid];
                  const casualRemaining = empBalance 
                    ? Math.max(0, empBalance.casualLeave - (empBalance.casualLeaveUsed || 0)) 
                    : 12;
                  const medicalRemaining = empBalance 
                    ? Math.max(0, empBalance.medicalLeave - (empBalance.medicalLeaveUsed || 0)) 
                    : 10;
                  const relevantRemaining = req.leaveType === 'casual' ? casualRemaining : medicalRemaining;

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-3">
                        <span className="font-bold text-slate-900 block">{req.employeeName}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {req.employeeId}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className="font-semibold text-slate-800 capitalize block">
                          {req.leaveType} Leave ({req.daysCount} {req.daysCount === 1 ? 'day' : 'days'})
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {req.startDate} to {req.endDate}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className="text-xs font-semibold text-slate-700 block">
                          {relevantRemaining} days left
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Quota: {req.leaveType === 'casual' ? empBalance?.casualLeave || 12 : empBalance?.medicalLeave || 10}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-slate-600 max-w-xs truncate">
                        {req.reason}
                        {req.rejectionReason && (
                          <span className="block text-[11px] text-rose-600 mt-0.5">
                            Rejection Note: {req.rejectionReason}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(req.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        <Badge type="leave" value={req.status} />
                      </td>
                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        {req.status === 'pending' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              disabled={actionLoading}
                              onClick={() => setApprovingRequest(req)}
                              className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => setRejectingRequest(req)}
                              className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {req.reviewedBy ? `By ${req.reviewedBy}` : 'Processed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve Confirmation Modal */}
      {approvingRequest && (
        <Modal
          isOpen={Boolean(approvingRequest)}
          onClose={() => setApprovingRequest(null)}
          title="Confirm Leave Approval"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-800 space-y-1">
              <p className="font-bold text-sm">Approve {approvingRequest.daysCount}-Day {approvingRequest.leaveType} Leave?</p>
              <p className="text-emerald-700">
                Approving will automatically deduct {approvingRequest.daysCount} day(s) from {approvingRequest.employeeName}'s Firestore leave balance.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee:</span>
                <span className="font-semibold">{approvingRequest.employeeName} ({approvingRequest.employeeId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-semibold">{approvingRequest.startDate} to {approvingRequest.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reason:</span>
                <span className="font-semibold">{approvingRequest.reason}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApprovingRequest(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleApproveConfirm}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Deducting & Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Leave Modal */}
      {rejectingRequest && (
        <Modal
          isOpen={Boolean(rejectingRequest)}
          onClose={() => setRejectingRequest(null)}
          title={`Reject Leave: ${rejectingRequest.employeeName}`}
          maxWidth="md"
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 rounded-xl text-rose-800">
              <span className="font-semibold block">Add Rejection Reason:</span>
              Please explain why this leave cannot be approved (e.g. project deadline, insufficient coverage).
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain the reason for denying this leave request..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Leave Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
