export type UserRole = 'employee' | 'hr_admin';

export type KYCStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

export type KYCDocumentType = 
  | 'Aadhaar'
  | 'PAN'
  | 'Bank document'
  | 'Address proof'
  | 'Other';

export type DocumentVerificationStatus = 'pending' | 'verified' | 'rejected';

export type LeaveType = 'casual' | 'medical';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type HolidayType = 'mandatory' | 'optional';

export interface Employee {
  id: string; // Document ID (usually matches Firebase Auth UID)
  uid: string; // Firebase Auth UID
  employeeId: string; // e.g. EMP-1001
  fullName: string;
  email: string;
  phone: string;
  position: string;
  ctc: string; // e.g. "$75,000 / year" or "₹9,50,000"
  joiningDate: string; // YYYY-MM-DD
  department: string;
  manager: string;
  kycStatus: KYCStatus;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface KYCDocument {
  id: string;
  employeeUid: string;
  employeeId: string;
  employeeName: string;
  documentType: KYCDocumentType;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  status: DocumentVerificationStatus;
  rejectionReason?: string;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface LeaveBalance {
  id: string;
  employeeUid: string;
  employeeId: string;
  casualLeave: number; // allocated (e.g., 12)
  medicalLeave: number; // allocated (e.g., 10)
  casualLeaveUsed: number;
  medicalLeaveUsed: number;
  year: number;
}

export interface LeaveRequest {
  id: string;
  employeeUid: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Holiday {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  type: HolidayType;
  description?: string;
}
