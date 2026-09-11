import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Employee, UserRole } from '../types';
import { getEmployeeByUid, createEmployeeRecord, getAllEmployees } from '../services/employeeService';
import { initializeLeaveBalance } from '../services/leaveService';
import { demoStore, DEMO_ADMIN, DEMO_EMPLOYEE } from '../services/demoStore';

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  position: string;
  department: string;
  manager: string;
  ctc: string;
  joiningDate: string;
  role?: UserRole;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  employee: Employee | null;
  loading: boolean;
  isHRAdmin: boolean;
  isEmployee: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  quickLogin: (role: 'admin' | 'employee') => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Sync profile from Firestore or demo store
  const fetchProfile = async (uid: string) => {
    if (demoStore.isDemoActive()) {
      const demoEmp = demoStore.getEmployee(uid);
      if (demoEmp) {
        setEmployee(demoEmp);
        return demoEmp;
      }
    }

    try {
      const emp = await getEmployeeByUid(uid);
      setEmployee(emp);
      return emp;
    } catch (err) {
      console.error('Error fetching employee profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check if a demo session is active from localStorage
    if (demoStore.isDemoActive()) {
      const demoUid = demoStore.getActiveDemoUid();
      const demoEmp = demoUid === DEMO_ADMIN.uid ? DEMO_ADMIN : DEMO_EMPLOYEE;
      setEmployee(demoEmp);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsDemoMode(false);
        await fetchProfile(user.uid);
      } else {
        if (!demoStore.isDemoActive()) {
          setEmployee(null);
          setIsDemoMode(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      demoStore.clearActiveDemo();
      setIsDemoMode(false);

      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      setFirebaseUser(cred.user);

      // Check if employee profile exists
      let profile = await fetchProfile(cred.user.uid);
      if (!profile) {
        // If there are no existing employees in the system, promote first user to HR Admin to configure system
        let isFirstOrgUser = false;
        try {
          const existing = await getAllEmployees();
          isFirstOrgUser = existing.length === 0;
        } catch {
          isFirstOrgUser = false;
        }

        const assignedRole: UserRole = isFirstOrgUser ? 'hr_admin' : 'employee';
        const newEmployee = await createEmployeeRecord(cred.user.uid, {
          employeeId: assignedRole === 'hr_admin' ? 'HR-1001' : `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: cred.user.displayName || (cred.user.email ? cred.user.email.split('@')[0] : 'Corporate User'),
          email: cred.user.email || '',
          phone: cred.user.phoneNumber || '+1 (555) 019-2834',
          position: assignedRole === 'hr_admin' ? 'HR Administrator' : 'Staff Associate',
          department: assignedRole === 'hr_admin' ? 'Human Resources' : 'General',
          manager: assignedRole === 'hr_admin' ? 'Executive Board' : 'HR Management',
          ctc: assignedRole === 'hr_admin' ? '$110,000 / yr' : '$75,000 / yr',
          joiningDate: new Date().toISOString().split('T')[0],
          kycStatus: 'not_submitted',
          role: assignedRole,
          createdAt: new Date().toISOString(),
        });
        await initializeLeaveBalance(cred.user.uid, newEmployee.employeeId);
        setEmployee(newEmployee);
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      demoStore.clearActiveDemo();
      setIsDemoMode(false);
      await fetchProfile(cred.user.uid);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      demoStore.clearActiveDemo();
      setIsDemoMode(false);
      const uid = cred.user.uid;

      // 2. Generate clean Employee ID
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const employeeId = `EMP-${randomDigits}`;

      // 3. Create employee document in Firestore
      let determinedRole: UserRole = data.role || 'employee';
      if (!data.role) {
        try {
          const existing = await getAllEmployees();
          if (existing.length === 0) {
            determinedRole = 'hr_admin';
          }
        } catch {
          determinedRole = 'employee';
        }
      }

      const newEmployee = await createEmployeeRecord(uid, {
        employeeId: determinedRole === 'hr_admin' ? `HR-${randomDigits}` : employeeId,
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        position: data.position.trim(),
        department: data.department.trim(),
        manager: data.manager.trim(),
        ctc: data.ctc.trim() || '$75,000 / yr',
        joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
        kycStatus: 'not_submitted',
        role: determinedRole,
        createdAt: new Date().toISOString(),
      });

      // 4. Initialize default leave balance
      await initializeLeaveBalance(uid, employeeId);

      setEmployee(newEmployee);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      demoStore.clearActiveDemo();
      setIsDemoMode(false);
      setEmployee(null);
      setFirebaseUser(null);
      await firebaseSignOut(auth).catch(() => {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (isDemoMode && employee) {
      const updated = demoStore.getEmployee(employee.uid);
      if (updated) setEmployee(updated);
    } else if (firebaseUser) {
      await fetchProfile(firebaseUser.uid);
    }
  };

  // Instant one-click testing in AI Studio without auth/operation-not-allowed errors
  const quickLogin = async (role: 'admin' | 'employee') => {
    setLoading(true);
    try {
      // Set active demo user in demo store
      const demoUser = demoStore.setActiveDemo(role);
      setIsDemoMode(true);
      setEmployee(demoUser);
    } catch (error) {
      console.error('Quick demo login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isHRAdmin = employee?.role === 'hr_admin';
  const isEmployee = employee?.role === 'employee' || !isHRAdmin;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        employee,
        loading,
        isHRAdmin,
        isEmployee,
        isDemoMode,
        login,
        loginWithGoogle,
        register,
        logout,
        quickLogin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
