import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { KYCDocument, KYCDocumentType } from '../types';
import { updateEmployeeKYCStatus } from './employeeService';
import { demoStore } from './demoStore';

const KYC_COLLECTION = 'kyc_documents';

export async function uploadKYCDocument(
  file: File,
  employeeUid: string,
  employeeId: string,
  employeeName: string,
  documentType: KYCDocumentType
): Promise<KYCDocument> {
  // If explicitly testing in offline demo mode, route to demo store
  if (demoStore.isDemoActive() || employeeUid.startsWith('demo-')) {
    const mockFileUrl = `https://storage.placeholder.internal/kyc/${encodeURIComponent(file.name)}`;
    return demoStore.addKYCDoc({
      employeeUid,
      employeeId,
      employeeName,
      documentType,
      fileName: file.name,
      fileUrl: mockFileUrl,
      fileSize: file.size,
      mimeType: file.type,
      status: 'pending',
      uploadedAt: new Date().toISOString(),
    });
  }

  // 1. Upload to Firebase Storage
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `kyc_documents/${employeeUid}/${Date.now()}_${cleanFileName}`;
  const storageRef = ref(storage, storagePath);
  
  const snapshot = await uploadBytes(storageRef, file);
  const fileUrl = await getDownloadURL(snapshot.ref);

  // 2. Save document metadata to Firestore
  const newDocData: Omit<KYCDocument, 'id'> = {
    employeeUid,
    employeeId,
    employeeName,
    documentType,
    fileName: file.name,
    fileUrl,
    fileSize: file.size,
    mimeType: file.type,
    status: 'pending',
    uploadedAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, KYC_COLLECTION), newDocData);
  await updateEmployeeKYCStatus(employeeUid, 'pending');
  return {
    id: docRef.id,
    ...newDocData,
  };
}

export async function getKYCDocumentsByEmployee(employeeUid: string): Promise<KYCDocument[]> {
  if (demoStore.isDemoActive() || employeeUid.startsWith('demo-')) {
    return demoStore.getKYCDocsByEmployee(employeeUid);
  }

  const q = query(
    collection(db, KYC_COLLECTION), 
    where('employeeUid', '==', employeeUid)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<KYCDocument, 'id'>),
  }));
  return docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function getAllKYCDocuments(): Promise<KYCDocument[]> {
  if (demoStore.isDemoActive()) {
    return demoStore.getKYCDocs();
  }

  const snap = await getDocs(collection(db, KYC_COLLECTION));
  const docs = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<KYCDocument, 'id'>),
  }));
  return docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function verifyKYCDocument(
  docId: string, 
  employeeUid: string, 
  adminName: string
): Promise<void> {
  if (demoStore.isDemoActive() || docId.startsWith('kyc-doc-')) {
    demoStore.verifyKYCDoc(docId, employeeUid, adminName);
    return;
  }

  const docRef = doc(db, KYC_COLLECTION, docId);
  await updateDoc(docRef, {
    status: 'verified',
    rejectionReason: '',
    verifiedAt: new Date().toISOString(),
    verifiedBy: adminName,
  });

  const userDocs = await getKYCDocumentsByEmployee(employeeUid);
  const hasPendingOrRejected = userDocs.some((d) => d.id !== docId && d.status !== 'verified');
  if (!hasPendingOrRejected) {
    await updateEmployeeKYCStatus(employeeUid, 'verified');
  }
}

export async function rejectKYCDocument(
  docId: string, 
  employeeUid: string, 
  rejectionReason: string, 
  adminName: string
): Promise<void> {
  if (demoStore.isDemoActive() || docId.startsWith('kyc-doc-')) {
    demoStore.rejectKYCDoc(docId, employeeUid, rejectionReason, adminName);
    return;
  }

  const docRef = doc(db, KYC_COLLECTION, docId);
  await updateDoc(docRef, {
    status: 'rejected',
    rejectionReason,
    verifiedAt: new Date().toISOString(),
    verifiedBy: adminName,
  });

  await updateEmployeeKYCStatus(employeeUid, 'rejected');
}
