import React, { useState } from 'react';
import { 
  UserCircle, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  UserCheck, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  Save, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { updateEmployeeRecord } from '../../services/employeeService';

export const EmployeeProfilePage: React.FC = () => {
  const { employee, refreshProfile } = useAuth();
  const [phone, setPhone] = useState(employee?.phone || '');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!employee) return null;

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setSaving(true);
    try {
      await updateEmployeeRecord(employee.uid, { phone });
      await refreshProfile();
      setSuccessMessage('Contact information updated successfully in Firestore.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update contact information.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Detailed employment profile and official organizational records
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 rounded-3xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-indigo-100">
              {employee.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{employee.fullName}</h2>
                <Badge type="role" value={employee.role} />
              </div>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                {employee.position} • {employee.department}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  ID: {employee.employeeId}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">
                  Joined: {employee.joiningDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              KYC Status
            </span>
            <Badge type="kyc" value={employee.kycStatus} />
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Work Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
              Employment Details
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" /> Designation
                </span>
                <span className="font-semibold text-slate-800">{employee.position}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400" /> Department
                </span>
                <span className="font-semibold text-slate-800">{employee.department}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-slate-400" /> Reporting Manager
                </span>
                <span className="font-semibold text-slate-800">{employee.manager || 'Executive Team'}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Joining Date
                </span>
                <span className="font-semibold text-slate-800">{employee.joiningDate}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" /> Annual CTC
                </span>
                <span className="font-semibold text-emerald-700 font-mono">{employee.ctc}</span>
              </div>
            </div>
          </div>

          {/* Contact & Personal Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
              Contact & Authentication
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> Work Email
                </span>
                <span className="font-medium text-slate-800 font-mono text-xs">{employee.email}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400" /> System Role
                </span>
                <span className="font-semibold text-slate-800 capitalize">{employee.role.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Account Created
                </span>
                <span className="text-xs text-slate-600">
                  {new Date(employee.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Editable Contact Info */}
            <form onSubmit={handleUpdateContact} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Update Contact Information</h4>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Primary Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || phone === employee.phone}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving changes...' : 'Save Contact Updates'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
