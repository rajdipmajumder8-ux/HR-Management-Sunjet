import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  PlusCircle, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Building, 
  Briefcase, 
  Phone, 
  Mail, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllEmployees, updateEmployeeKYCStatus, updateEmployeeRole } from '../../services/employeeService';
import { getKYCDocumentsByEmployee, verifyKYCDocument, rejectKYCDocument } from '../../services/kycService';
import { getLeaveBalance } from '../../services/leaveService';
import { Employee, KYCDocument, LeaveBalance, KYCStatus, UserRole } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';

interface EmployeeManagementPageProps {
  initialSelectedEmployee?: Employee | null;
}

export const EmployeeManagementPage: React.FC<EmployeeManagementPageProps> = ({
  initialSelectedEmployee = null,
}) => {
  const { employee: currentAdmin } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');

  // Selected employee detail modal
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(initialSelectedEmployee);
  const [employeeDocs, setEmployeeDocs] = useState<KYCDocument[]>([]);
  const [employeeLeaveBalance, setEmployeeLeaveBalance] = useState<LeaveBalance | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Document preview / action
  const [previewDoc, setPreviewDoc] = useState<KYCDocument | null>(null);
  const [rejectingDoc, setRejectingDoc] = useState<KYCDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const list = await getAllEmployees();
      setEmployees(list);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // When selected employee changes, load their documents and leave balance
  useEffect(() => {
    if (!selectedEmployee) {
      setEmployeeDocs([]);
      setEmployeeLeaveBalance(null);
      return;
    }

    const loadEmployeeDetails = async () => {
      try {
        setDetailsLoading(true);
        const [docs, balance] = await Promise.all([
          getKYCDocumentsByEmployee(selectedEmployee.uid),
          getLeaveBalance(selectedEmployee.uid),
        ]);
        setEmployeeDocs(docs);
        setEmployeeLeaveBalance(balance);
      } catch (err) {
        console.error('Error loading employee sub-records:', err);
      } finally {
        setDetailsLoading(false);
      }
    };

    loadEmployeeDetails();
  }, [selectedEmployee]);

  const handleVerifyKYC = async (docItem: KYCDocument) => {
    if (!currentAdmin || !selectedEmployee) return;
    setActionLoading(true);
    try {
      await verifyKYCDocument(docItem.id, selectedEmployee.uid, currentAdmin.fullName);
      // Refresh documents
      const docs = await getKYCDocumentsByEmployee(selectedEmployee.uid);
      setEmployeeDocs(docs);
      await fetchEmployees();
      // Update selected employee status
      setSelectedEmployee((prev) => prev ? { ...prev, kycStatus: 'verified' } : null);
    } catch (err) {
      console.error('Error verifying document:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectKYCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin || !selectedEmployee || !rejectingDoc) return;
    setActionLoading(true);
    try {
      await rejectKYCDocument(
        rejectingDoc.id,
        selectedEmployee.uid,
        rejectionReason.trim(),
        currentAdmin.fullName
      );
      setRejectingDoc(null);
      setRejectionReason('');
      const docs = await getKYCDocumentsByEmployee(selectedEmployee.uid);
      setEmployeeDocs(docs);
      await fetchEmployees();
      setSelectedEmployee((prev) => prev ? { ...prev, kycStatus: 'rejected' } : null);
    } catch (err) {
      console.error('Error rejecting document:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (targetRole: UserRole) => {
    if (!selectedEmployee) return;
    try {
      setActionLoading(true);
      await updateEmployeeRole(selectedEmployee.uid, targetRole);
      setSelectedEmployee((prev) => prev ? { ...prev, role: targetRole } : null);
      setEmployees((prev) =>
        prev.map((e) => (e.uid === selectedEmployee.uid ? { ...e, role: targetRole } : e))
      );
    } catch (err) {
      console.error('Failed to update employee role:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.position.toLowerCase().includes(search.toLowerCase());

    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesKYC = kycFilter === 'all' || emp.kycStatus === kycFilter;

    return matchesSearch && matchesDept && matchesKYC;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Employee Directory & Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access employee records, verify identity documents, and oversee compensation profiles
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 self-start sm:self-auto">
          {filteredEmployees.length} of {employees.length} Employees Active
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, title, email..."
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* KYC Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">KYC:</span>
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="not_submitted">Not Submitted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {loading ? (
          <LoadingSpinner message="Fetching employee directory..." />
        ) : filteredEmployees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees match criteria"
            description="Adjust your search keywords or clear filters to view employee records."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Employee</th>
                  <th className="pb-3 px-3">Designation & Department</th>
                  <th className="pb-3 px-3">Manager</th>
                  <th className="pb-3 px-3">Annual CTC</th>
                  <th className="pb-3 px-3">KYC Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {emp.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{emp.fullName}</span>
                            <Badge type="role" value={emp.role} />
                          </div>
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
                    <td className="py-4 px-3 text-slate-700">
                      {emp.manager || 'Executive Lead'}
                    </td>
                    <td className="py-4 px-3 font-mono font-semibold text-emerald-700">
                      {emp.ctc}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <Badge type="kyc" value={emp.kycStatus} />
                    </td>
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={Boolean(selectedEmployee)}
          onClose={() => setSelectedEmployee(null)}
          title={`Employee File: ${selectedEmployee.fullName}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center">
                  {selectedEmployee.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{selectedEmployee.fullName}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedEmployee.employeeId} • {selectedEmployee.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge type="role" value={selectedEmployee.role} />
                <Badge type="kyc" value={selectedEmployee.kycStatus} />
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Position</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedEmployee.position}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedEmployee.department}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Joining Date</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedEmployee.joiningDate}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Annual CTC</span>
                <span className="font-semibold text-emerald-700 font-mono mt-0.5 block">{selectedEmployee.ctc}</span>
              </div>
            </div>

            {/* Leave Balance summary */}
            {employeeLeaveBalance && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-indigo-900 block">Current Leave Balances</span>
                  <span className="text-indigo-600/80 text-[11px]">
                    Casual: {employeeLeaveBalance.casualLeave - (employeeLeaveBalance.casualLeaveUsed || 0)} available • Medical: {employeeLeaveBalance.medicalLeave - (employeeLeaveBalance.medicalLeaveUsed || 0)} available
                  </span>
                </div>
                <span className="font-mono text-slate-600 text-[11px]">
                  Year {employeeLeaveBalance.year}
                </span>
              </div>
            )}

            {/* Role & Access Management */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">System Access & Role</span>
                <span className="text-slate-500 text-[11px]">
                  {selectedEmployee.role === 'hr_admin' 
                    ? 'User has HR Administrator privileges (leave approval, KYC verification, employee management).' 
                    : 'User has standard Employee access (self-profile, leave requests, document submission).'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {selectedEmployee.role === 'employee' ? (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleRoleChange('hr_admin')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-xs disabled:opacity-50"
                  >
                    Promote to HR Admin
                  </button>
                ) : (
                  <button
                    disabled={actionLoading || selectedEmployee.uid === currentAdmin?.uid}
                    onClick={() => handleRoleChange('employee')}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-lg transition-colors text-xs disabled:opacity-50"
                    title={selectedEmployee.uid === currentAdmin?.uid ? "Cannot change role of your currently active account" : undefined}
                  >
                    Change to Employee
                  </button>
                )}
              </div>
            </div>

            {/* KYC Documents Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Submitted KYC Documents ({employeeDocs.length})
                </h4>
              </div>

              {detailsLoading ? (
                <LoadingSpinner size="sm" message="Loading KYC records..." />
              ) : employeeDocs.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No KYC documents submitted by this employee yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {employeeDocs.map((docItem) => (
                    <div
                      key={docItem.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{docItem.documentType}</span>
                          <Badge type="docStatus" value={docItem.status} />
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {docItem.fileName} • Uploaded {new Date(docItem.uploadedAt).toLocaleDateString()}
                        </p>
                        {docItem.rejectionReason && (
                          <p className="text-[11px] text-rose-600 mt-1">
                            Rejection Note: {docItem.rejectionReason}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => setPreviewDoc(docItem)}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
                        >
                          View
                        </button>

                        {docItem.status !== 'verified' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleVerifyKYC(docItem)}
                            className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold"
                          >
                            Verify
                          </button>
                        )}

                        {docItem.status !== 'rejected' && (
                          <button
                            disabled={actionLoading}
                            onClick={() => setRejectingDoc(docItem)}
                            className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close File
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject KYC with reason modal */}
      {rejectingDoc && (
        <Modal
          isOpen={Boolean(rejectingDoc)}
          onClose={() => setRejectingDoc(null)}
          title={`Reject KYC: ${rejectingDoc.documentType}`}
          maxWidth="md"
        >
          <form onSubmit={handleRejectKYCSubmit} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                Please provide a specific reason for rejecting this document so the employee can correct and re-upload.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rejection Reason *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Document image is blurry, name mismatch, or expired certificate..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingDoc(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm KYC Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Document preview modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`KYC Document Preview: ${previewDoc.documentType}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span>File: {previewDoc.fileName}</span>
              <Badge type="docStatus" value={previewDoc.status} />
            </div>

            <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-auto border border-slate-200">
              {previewDoc.fileUrl.startsWith('data:image') || previewDoc.fileName.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.fileName}
                  className="max-h-[450px] object-contain rounded-xl"
                />
              ) : (
                <iframe
                  src={previewDoc.fileUrl}
                  title="PDF Preview"
                  className="w-full h-[450px] rounded-xl border-none"
                />
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
