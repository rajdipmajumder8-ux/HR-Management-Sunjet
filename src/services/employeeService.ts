import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Employee, KYCStatus, UserRole } from '../types';
import { demoStore } from './demoStore';

const EMPLOYEES_COLLECTION = 'employees';

export async function getEmployeeByUid(uid: string): Promise<Employee | null> {
  // Only use demo store if demo mode is explicitly active or testing with a demo ID
  if (demoStore.isDemoActive() || uid.startsWith('demo-')) {
    return demoStore.getEmployee(uid);
  }

  const docRef = doc(db, EMPLOYEES_COLLECTION, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...(docSnap.data() as Omit<Employee, 'id'>) };
  }
  return null;
}

export async function getAllEmployees(): Promise<Employee[]> {
  if (demoStore.isDemoActive()) {
    return demoStore.getEmployees();
  }

  const colRef = collection(db, EMPLOYEES_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Employee, 'id'>),
  }));
}

export async function createEmployeeRecord(
  uid: string, 
  data: Omit<Employee, 'id' | 'uid'>
): Promise<Employee> {
  const employeeData: Employee = {
    id: uid,
    uid,
    ...data,
  };

  if (demoStore.isDemoActive() || uid.startsWith('demo-')) {
    demoStore.saveEmployee(employeeData);
    return employeeData;
  }

  const docRef = doc(db, EMPLOYEES_COLLECTION, uid);
  await setDoc(docRef, {
    ...data,
    uid,
  });
  return employeeData;
}

export async function updateEmployeeRecord(
  uid: string, 
  updates: Partial<Employee>
): Promise<void> {
  if (demoStore.isDemoActive() || uid.startsWith('demo-')) {
    const existing = demoStore.getEmployee(uid);
    if (existing) {
      demoStore.saveEmployee({ ...existing, ...updates });
    }
    return;
  }

  const docRef = doc(db, EMPLOYEES_COLLECTION, uid);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateEmployeeKYCStatus(
  uid: string, 
  status: KYCStatus
): Promise<void> {
  if (demoStore.isDemoActive() || uid.startsWith('demo-')) {
    demoStore.updateEmployeeKYC(uid, status);
    return;
  }

  const docRef = doc(db, EMPLOYEES_COLLECTION, uid);
  await updateDoc(docRef, {
    kycStatus: status,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateEmployeeRole(
  uid: string,
  newRole: UserRole
): Promise<void> {
  if (demoStore.isDemoActive() || uid.startsWith('demo-')) {
    const existing = demoStore.getEmployee(uid);
    if (existing) {
      demoStore.saveEmployee({ ...existing, role: newRole });
    }
    return;
  }

  const docRef = doc(db, EMPLOYEES_COLLECTION, uid);
  await updateDoc(docRef, {
    role: newRole,
    updatedAt: new Date().toISOString(),
  });
}
