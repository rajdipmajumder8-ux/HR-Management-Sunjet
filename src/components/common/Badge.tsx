import React from 'react';
import { KYCStatus, DocumentVerificationStatus, LeaveStatus, UserRole } from '../../types';

interface BadgeProps {
  type: 'kyc' | 'docStatus' | 'leave' | 'role' | 'holiday';
  value: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = value;

  if (type === 'kyc' || type === 'docStatus') {
    const status = value as KYCStatus | DocumentVerificationStatus;
    if (status === 'verified') {
      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Verified';
    } else if (status === 'pending') {
      bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Pending Review';
    } else if (status === 'rejected') {
      bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Rejected';
    } else if (status === 'not_submitted') {
      bgClass = 'bg-slate-100 text-slate-600 border-slate-200';
      label = 'Not Submitted';
    }
  } else if (type === 'leave') {
    const status = value as LeaveStatus;
    if (status === 'approved') {
      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Approved';
    } else if (status === 'pending') {
      bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Pending Approval';
    } else if (status === 'rejected') {
      bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Rejected';
    }
  } else if (type === 'role') {
    const role = value as UserRole;
    if (role === 'hr_admin') {
      bgClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      label = 'HR / Admin';
    } else {
      bgClass = 'bg-sky-50 text-sky-700 border-sky-200';
      label = 'Employee';
    }
  } else if (type === 'holiday') {
    if (value === 'mandatory') {
      bgClass = 'bg-purple-50 text-purple-700 border-purple-200';
      label = 'Mandatory Holiday';
    } else {
      bgClass = 'bg-slate-50 text-slate-700 border-slate-200';
      label = 'Optional Holiday';
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${bgClass} ${className}`}
    >
      {label}
    </span>
  );
};
