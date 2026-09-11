import { Employee, KYCDocument, LeaveBalance, LeaveRequest, Holiday } from '../types';
import { INITIAL_COMPANY_HOLIDAYS } from './holidayService';

const STORAGE_KEYS = {
  EMPLOYEES: 'novahr_demo_employees_v2',
  KYC_DOCS: 'novahr_demo_kyc_docs_v2',
  LEAVE_BALANCES: 'novahr_demo_leave_balances_v2',
  LEAVE_REQUESTS: 'novahr_demo_leave_requests_v2',
  HOLIDAYS: 'novahr_demo_holidays_v2',
  ACTIVE_DEMO_UID: 'novahr_demo_active_uid_v2',
};

export const DEMO_ADMIN: Employee = {
  id: 'demo-admin-uid',
  uid: 'demo-admin-uid',
  employeeId: 'HR-1001',
  fullName: 'Sarah Jenkins',
  email: 'admin@company.com',
  phone: '+1 (555) 019-2834',
  position: 'Head of People & Culture',
  department: 'Human Resources',
  manager: 'Executive Board',
  ctc: '$120,000 / yr',
  joiningDate: '2023-01-15',
  kycStatus: 'verified',
  role: 'hr_admin',
  createdAt: '2023-01-15T09:00:00.000Z',
};

export const DEMO_EMPLOYEE: Employee = {
  id: 'demo-employee-uid',
  uid: 'demo-employee-uid',
  employeeId: 'EMP-2045',
  fullName: 'Alex Morgan',
  email: 'alex.morgan@company.com',
  phone: '+1 (555) 384-9120',
  position: 'Senior Software Engineer',
  department: 'Engineering',
  manager: 'Sarah Jenkins',
  ctc: '$105,000 / yr',
  joiningDate: '2024-03-01',
  kycStatus: 'pending',
  role: 'employee',
  createdAt: '2024-03-01T09:00:00.000Z',
};

const DEFAULT_EMPLOYEES: Employee[] = [
  DEMO_ADMIN,
  DEMO_EMPLOYEE,
  {
    id: 'demo-emp-2',
    uid: 'demo-emp-2',
    employeeId: 'EMP-2046',
    fullName: 'David Kim',
    email: 'david.kim@company.com',
    phone: '+1 (555) 492-1082',
    position: 'Product Designer',
    department: 'Product & Design',
    manager: 'Sarah Jenkins',
    ctc: '$95,000 / yr',
    joiningDate: '2024-04-15',
    kycStatus: 'verified',
    role: 'employee',
    createdAt: '2024-04-15T09:00:00.000Z',
  },
  {
    id: 'demo-emp-3',
    uid: 'demo-emp-3',
    employeeId: 'EMP-2047',
    fullName: 'Elena Rostova',
    email: 'elena.r@company.com',
    phone: '+1 (555) 723-9941',
    position: 'DevOps Specialist',
    department: 'Engineering',
    manager: 'Sarah Jenkins',
    ctc: '$110,000 / yr',
    joiningDate: '2024-06-01',
    kycStatus: 'rejected',
    role: 'employee',
    createdAt: '2024-06-01T09:00:00.000Z',
  },
  {
    id: 'demo-emp-4',
    uid: 'demo-emp-4',
    employeeId: 'EMP-2048',
    fullName: 'Priya Sharma',
    email: 'priya.s@company.com',
    phone: '+1 (555) 831-2940',
    position: 'Financial Analyst',
    department: 'Finance & Operations',
    manager: 'Sarah Jenkins',
    ctc: '$90,000 / yr',
    joiningDate: '2024-08-10',
    kycStatus: 'not_submitted',
    role: 'employee',
    createdAt: '2024-08-10T09:00:00.000Z',
  },
];

const DEFAULT_KYC_DOCS: KYCDocument[] = [
  {
    id: 'kyc-doc-1',
    employeeUid: 'demo-employee-uid',
    employeeId: 'EMP-2045',
    employeeName: 'Alex Morgan',
    documentType: 'Aadhaar',
    fileName: 'alex_aadhaar_card.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    fileSize: 524288,
    mimeType: 'application/pdf',
    status: 'pending',
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'kyc-doc-2',
    employeeUid: 'demo-emp-3',
    employeeId: 'EMP-2047',
    employeeName: 'Elena Rostova',
    documentType: 'Address proof',
    fileName: 'utility_bill_proof.jpg',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    fileSize: 842000,
    mimeType: 'image/jpeg',
    status: 'rejected',
    rejectionReason: 'Document edges are cut off and address text is illegible. Please re-scan with high contrast.',
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    verifiedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    verifiedBy: 'Sarah Jenkins',
  },
  {
    id: 'kyc-doc-3',
    employeeUid: 'demo-emp-2',
    employeeId: 'EMP-2046',
    employeeName: 'David Kim',
    documentType: 'PAN',
    fileName: 'pan_card_copy.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    fileSize: 420000,
    mimeType: 'application/pdf',
    status: 'verified',
    uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    verifiedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    verifiedBy: 'Sarah Jenkins',
  },
];

const DEFAULT_LEAVE_BALANCES: LeaveBalance[] = [
  {
    id: 'demo-employee-uid',
    employeeUid: 'demo-employee-uid',
    employeeId: 'EMP-2045',
    casualLeave: 12,
    medicalLeave: 10,
    casualLeaveUsed: 3,
    medicalLeaveUsed: 1,
    year: new Date().getFullYear(),
  },
  {
    id: 'demo-admin-uid',
    employeeUid: 'demo-admin-uid',
    employeeId: 'HR-1001',
    casualLeave: 12,
    medicalLeave: 10,
    casualLeaveUsed: 1,
    medicalLeaveUsed: 0,
    year: new Date().getFullYear(),
  },
  {
    id: 'demo-emp-2',
    employeeUid: 'demo-emp-2',
    employeeId: 'EMP-2046',
    casualLeave: 12,
    medicalLeave: 10,
    casualLeaveUsed: 2,
    medicalLeaveUsed: 0,
    year: new Date().getFullYear(),
  },
  {
    id: 'demo-emp-3',
    employeeUid: 'demo-emp-3',
    employeeId: 'EMP-2047',
    casualLeave: 12,
    medicalLeave: 10,
    casualLeaveUsed: 0,
    medicalLeaveUsed: 2,
    year: new Date().getFullYear(),
  },
];

const DEFAULT_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-req-1',
    employeeUid: 'demo-employee-uid',
    employeeId: 'EMP-2045',
    employeeName: 'Alex Morgan',
    leaveType: 'casual',
    startDate: '2026-09-21',
    endDate: '2026-09-23',
    daysCount: 3,
    reason: 'Family gathering and personal travel',
    status: 'pending',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'leave-req-2',
    employeeUid: 'demo-emp-2',
    employeeId: 'EMP-2046',
    employeeName: 'David Kim',
    leaveType: 'medical',
    startDate: '2026-08-12',
    endDate: '2026-08-13',
    daysCount: 2,
    reason: 'Medical recovery following dental surgery',
    status: 'approved',
    submittedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    reviewedAt: new Date(Date.now() - 86400000 * 19).toISOString(),
    reviewedBy: 'Sarah Jenkins',
  },
  {
    id: 'leave-req-3',
    employeeUid: 'demo-emp-3',
    employeeId: 'EMP-2047',
    employeeName: 'Elena Rostova',
    leaveType: 'casual',
    startDate: '2026-08-04',
    endDate: '2026-08-05',
    daysCount: 2,
    reason: 'Relocation assistance',
    status: 'rejected',
    rejectionReason: 'Scheduled during core platform release window; please coordinate with backup lead.',
    submittedAt: new Date(Date.now() - 86400000 * 35).toISOString(),
    reviewedAt: new Date(Date.now() - 86400000 * 34).toISOString(),
    reviewedBy: 'Sarah Jenkins',
  },
];

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return defaultVal;
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    // ignore
  }
}

export const demoStore = {
  isDemoActive(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.ACTIVE_DEMO_UID);
  },

  getActiveDemoUid(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_DEMO_UID);
  },

  setActiveDemo(role: 'admin' | 'employee'): Employee {
    const target = role === 'admin' ? DEMO_ADMIN : DEMO_EMPLOYEE;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DEMO_UID, target.uid);
    return target;
  },

  clearActiveDemo(): void {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_DEMO_UID);
  },

  // Employees
  getEmployees(): Employee[] {
    return getStored<Employee[]>(STORAGE_KEYS.EMPLOYEES, DEFAULT_EMPLOYEES);
  },

  getEmployee(uid: string): Employee | null {
    const list = this.getEmployees();
    return list.find((e) => e.uid === uid || e.id === uid) || null;
  },

  saveEmployee(emp: Employee): void {
    const list = this.getEmployees();
    const index = list.findIndex((e) => e.uid === emp.uid || e.id === emp.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...emp, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(emp);
    }
    setStored(STORAGE_KEYS.EMPLOYEES, list);
  },

  updateEmployeeKYC(uid: string, status: Employee['kycStatus']): void {
    const emp = this.getEmployee(uid);
    if (emp) {
      this.saveEmployee({ ...emp, kycStatus: status });
    }
  },

  // KYC Documents
  getKYCDocs(): KYCDocument[] {
    return getStored<KYCDocument[]>(STORAGE_KEYS.KYC_DOCS, DEFAULT_KYC_DOCS);
  },

  getKYCDocsByEmployee(uid: string): KYCDocument[] {
    return this.getKYCDocs().filter((d) => d.employeeUid === uid);
  },

  addKYCDoc(doc: Omit<KYCDocument, 'id'>): KYCDocument {
    const docs = this.getKYCDocs();
    const newDoc: KYCDocument = {
      id: `kyc-doc-${Date.now()}`,
      ...doc,
    };
    docs.unshift(newDoc);
    setStored(STORAGE_KEYS.KYC_DOCS, docs);
    this.updateEmployeeKYC(doc.employeeUid, 'pending');
    return newDoc;
  },

  verifyKYCDoc(docId: string, employeeUid: string, adminName: string): void {
    const docs = this.getKYCDocs();
    const index = docs.findIndex((d) => d.id === docId);
    if (index >= 0) {
      docs[index] = {
        ...docs[index],
        status: 'verified',
        rejectionReason: '',
        verifiedAt: new Date().toISOString(),
        verifiedBy: adminName,
      };
      setStored(STORAGE_KEYS.KYC_DOCS, docs);

      // Check if all docs for this employee are verified
      const userDocs = docs.filter((d) => d.employeeUid === employeeUid);
      const allVerified = userDocs.length > 0 && userDocs.every((d) => d.status === 'verified');
      if (allVerified) {
        this.updateEmployeeKYC(employeeUid, 'verified');
      }
    }
  },

  rejectKYCDoc(docId: string, employeeUid: string, reason: string, adminName: string): void {
    const docs = this.getKYCDocs();
    const index = docs.findIndex((d) => d.id === docId);
    if (index >= 0) {
      docs[index] = {
        ...docs[index],
        status: 'rejected',
        rejectionReason: reason,
        verifiedAt: new Date().toISOString(),
        verifiedBy: adminName,
      };
      setStored(STORAGE_KEYS.KYC_DOCS, docs);
      this.updateEmployeeKYC(employeeUid, 'rejected');
    }
  },

  // Leave Balances
  getLeaveBalance(uid: string): LeaveBalance {
    const balances = getStored<LeaveBalance[]>(STORAGE_KEYS.LEAVE_BALANCES, DEFAULT_LEAVE_BALANCES);
    const found = balances.find((b) => b.employeeUid === uid);
    if (found) return found;

    const newBal: LeaveBalance = {
      id: uid,
      employeeUid: uid,
      employeeId: this.getEmployee(uid)?.employeeId || '',
      casualLeave: 12,
      medicalLeave: 10,
      casualLeaveUsed: 0,
      medicalLeaveUsed: 0,
      year: new Date().getFullYear(),
    };
    balances.push(newBal);
    setStored(STORAGE_KEYS.LEAVE_BALANCES, balances);
    return newBal;
  },

  // Leave Requests
  getLeaveRequests(): LeaveRequest[] {
    return getStored<LeaveRequest[]>(STORAGE_KEYS.LEAVE_REQUESTS, DEFAULT_LEAVE_REQUESTS);
  },

  getLeaveRequestsByEmployee(uid: string): LeaveRequest[] {
    return this.getLeaveRequests().filter((r) => r.employeeUid === uid);
  },

  addLeaveRequest(data: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>): LeaveRequest {
    const requests = this.getLeaveRequests();
    const newReq: LeaveRequest = {
      id: `leave-req-${Date.now()}`,
      ...data,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    requests.unshift(newReq);
    setStored(STORAGE_KEYS.LEAVE_REQUESTS, requests);
    return newReq;
  },

  approveLeaveRequest(requestId: string, employeeUid: string, leaveType: 'casual' | 'medical', daysCount: number, adminName: string): void {
    const requests = this.getLeaveRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index >= 0) {
      requests[index] = {
        ...requests[index],
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: adminName,
        rejectionReason: '',
      };
      setStored(STORAGE_KEYS.LEAVE_REQUESTS, requests);

      // Deduct balance
      const balances = getStored<LeaveBalance[]>(STORAGE_KEYS.LEAVE_BALANCES, DEFAULT_LEAVE_BALANCES);
      const balIndex = balances.findIndex((b) => b.employeeUid === employeeUid);
      if (balIndex >= 0) {
        if (leaveType === 'casual') {
          balances[balIndex].casualLeaveUsed += daysCount;
        } else {
          balances[balIndex].medicalLeaveUsed += daysCount;
        }
      } else {
        balances.push({
          id: employeeUid,
          employeeUid,
          employeeId: requests[index].employeeId,
          casualLeave: 12,
          medicalLeave: 10,
          casualLeaveUsed: leaveType === 'casual' ? daysCount : 0,
          medicalLeaveUsed: leaveType === 'medical' ? daysCount : 0,
          year: new Date().getFullYear(),
        });
      }
      setStored(STORAGE_KEYS.LEAVE_BALANCES, balances);
    }
  },

  rejectLeaveRequest(requestId: string, reason: string, adminName: string): void {
    const requests = this.getLeaveRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index >= 0) {
      requests[index] = {
        ...requests[index],
        status: 'rejected',
        rejectionReason: reason,
        reviewedAt: new Date().toISOString(),
        reviewedBy: adminName,
      };
      setStored(STORAGE_KEYS.LEAVE_REQUESTS, requests);
    }
  },

  // Holidays
  getHolidays(): Holiday[] {
    const stored = getStored<Holiday[] | null>(STORAGE_KEYS.HOLIDAYS, null);
    if (stored && stored.length > 0) return stored;
    const initial = INITIAL_COMPANY_HOLIDAYS.map((h, i) => ({ id: `demo-hol-${i}`, ...h }));
    setStored(STORAGE_KEYS.HOLIDAYS, initial);
    return initial;
  },

  addHoliday(holiday: Omit<Holiday, 'id'>): Holiday {
    const list = this.getHolidays();
    const newH: Holiday = { id: `demo-hol-${Date.now()}`, ...holiday };
    list.push(newH);
    setStored(STORAGE_KEYS.HOLIDAYS, list);
    return newH;
  },

  deleteHoliday(id: string): void {
    const list = this.getHolidays().filter((h) => h.id !== id);
    setStored(STORAGE_KEYS.HOLIDAYS, list);
  },

  updateHoliday(id: string, updates: Partial<Holiday>): void {
    const list = this.getHolidays();
    const index = list.findIndex((h) => h.id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updates };
      setStored(STORAGE_KEYS.HOLIDAYS, list);
    }
  },
};
