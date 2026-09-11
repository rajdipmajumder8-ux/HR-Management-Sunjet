import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  runTransaction 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LeaveBalance, LeaveRequest, LeaveType } from '../types';
import { demoStore } from './demoStore';

const LEAVE_BALANCES_COLLECTION = 'leave_balances';
const LEAVE_REQUESTS_COLLECTION = 'leave_requests';

const DEFAULT_CASUAL_LEAVE = 12;
const DEFAULT_MEDICAL_LEAVE = 10;

export async function getLeaveBalance(employeeUid: string): Promise<LeaveBalance> {
  if (demoStore.isDemoActive() || employeeUid.startsWith('demo-')) {
    return demoStore.getLeaveBalance(employeeUid);
  }

  const docRef = doc(db, LEAVE_BALANCES_COLLECTION, employeeUid);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...(snap.data() as Omit<LeaveBalance, 'id'>) };
  }
  return await initializeLeaveBalance(employeeUid, '');
}

export async function initializeLeaveBalance(
  employeeUid: string, 
  employeeId: string
): Promise<LeaveBalance> {
  const initialBalance: LeaveBalance = {
    id: employeeUid,
    employeeUid,
    employeeId,
    casualLeave: DEFAULT_CASUAL_LEAVE,
    medicalLeave: DEFAULT_MEDICAL_LEAVE,
    casualLeaveUsed: 0,
    medicalLeaveUsed: 0,
    year: new Date().getFullYear(),
  };

  if (demoStore.isDemoActive() || employeeUid.startsWith('demo-')) {
    return demoStore.getLeaveBalance(employeeUid);
  }

  const docRef = doc(db, LEAVE_BALANCES_COLLECTION, employeeUid);
  await setDoc(docRef, initialBalance);
  return initialBalance;
}

export async function createLeaveRequest(
  data: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>
): Promise<LeaveRequest> {
  if (demoStore.isDemoActive() || data.employeeUid.startsWith('demo-')) {
    return demoStore.addLeaveRequest(data);
  }

  const newRequest: Omit<LeaveRequest, 'id'> = {
    ...data,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  const docRef = await addDoc(collection(db, LEAVE_REQUESTS_COLLECTION), newRequest);
  return { id: docRef.id, ...newRequest };
}

export async function getLeaveRequestsByEmployee(employeeUid: string): Promise<LeaveRequest[]> {
  if (demoStore.isDemoActive() || employeeUid.startsWith('demo-')) {
    return demoStore.getLeaveRequestsByEmployee(employeeUid);
  }

  const q = query(
    collection(db, LEAVE_REQUESTS_COLLECTION), 
    where('employeeUid', '==', employeeUid)
  );
  const snap = await getDocs(q);
  const requests = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<LeaveRequest, 'id'>),
  }));
  return requests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export async function getAllLeaveRequests(): Promise<LeaveRequest[]> {
  if (demoStore.isDemoActive()) {
    return demoStore.getLeaveRequests();
  }

  const snap = await getDocs(collection(db, LEAVE_REQUESTS_COLLECTION));
  const requests = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<LeaveRequest, 'id'>),
  }));
  return requests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export async function approveLeaveRequest(
  requestId: string, 
  employeeUid: string, 
  leaveType: LeaveType, 
  daysCount: number, 
  adminName: string
): Promise<void> {
  if (demoStore.isDemoActive() || requestId.startsWith('leave-req-')) {
    demoStore.approveLeaveRequest(requestId, employeeUid, leaveType, daysCount, adminName);
    return;
  }

  await runTransaction(db, async (transaction) => {
    const requestRef = doc(db, LEAVE_REQUESTS_COLLECTION, requestId);
    const balanceRef = doc(db, LEAVE_BALANCES_COLLECTION, employeeUid);

    const requestSnap = await transaction.get(requestRef);
    if (!requestSnap.exists()) {
      throw new Error('Leave request not found');
    }

    const balanceSnap = await transaction.get(balanceRef);
    if (!balanceSnap.exists()) {
      transaction.set(balanceRef, {
        employeeUid,
        employeeId: requestSnap.data().employeeId || '',
        casualLeave: DEFAULT_CASUAL_LEAVE,
        medicalLeave: DEFAULT_MEDICAL_LEAVE,
        casualLeaveUsed: leaveType === 'casual' ? daysCount : 0,
        medicalLeaveUsed: leaveType === 'medical' ? daysCount : 0,
        year: new Date().getFullYear(),
      });
    } else {
      const balanceData = balanceSnap.data() as LeaveBalance;
      if (leaveType === 'casual') {
        transaction.update(balanceRef, {
          casualLeaveUsed: (balanceData.casualLeaveUsed || 0) + daysCount,
        });
      } else {
        transaction.update(balanceRef, {
          medicalLeaveUsed: (balanceData.medicalLeaveUsed || 0) + daysCount,
        });
      }
    }

    transaction.update(requestRef, {
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminName,
      rejectionReason: '',
    });
  });
}

export async function rejectLeaveRequest(
  requestId: string, 
  rejectionReason: string, 
  adminName: string
): Promise<void> {
  if (demoStore.isDemoActive() || requestId.startsWith('leave-req-')) {
    demoStore.rejectLeaveRequest(requestId, rejectionReason, adminName);
    return;
  }

  const docRef = doc(db, LEAVE_REQUESTS_COLLECTION, requestId);
  await updateDoc(docRef, {
    status: 'rejected',
    rejectionReason,
    reviewedAt: new Date().toISOString(),
    reviewedBy: adminName,
  });
}
