import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, loginWithGoogle, quickLogin, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showOperationNotAllowedNotice, setShowOperationNotAllowedNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowOperationNotAllowedNotice(false);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Sign in attempt failed:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setShowOperationNotAllowedNotice(true);
        setError('Email/Password provider is disabled in this Firebase project. Please use Quick Demo Access or Google Sign-In.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. You can sign in immediately using Quick Demo Access or Google.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid corporate email address.');
      } else {
        setError(err.message || 'An error occurred while signing in. Please try Quick Demo Access.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async (role: 'admin' | 'employee') => {
    setError(null);
    setShowOperationNotAllowedNotice(false);
    setIsSubmitting(true);
    try {
      await quickLogin(role);
    } catch (err: any) {
      setError(`Quick demo sign in failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setShowOperationNotAllowedNotice(false);
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in was not completed.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Logo & Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-100 mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            NovaHR Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise Human Resources & Employee Management
          </p>
        </div>

        {/* Quick Access Sandbox Box */}
        <div className="mb-5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Prototype Sandbox (Isolated Mock Data)
            </span>
            <span className="text-[10px] text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full font-semibold">
              Simulated Mode
            </span>
          </div>
          <p className="text-xs text-amber-900/80 mb-3 leading-relaxed">
            Test the UI in an isolated sandbox with preloaded mock records. Real Firestore data will not be modified:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              id="quick-login-admin-btn"
              disabled={isSubmitting || isGoogleLoading || loading}
              onClick={() => handleDemoSignIn('admin')}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-amber-900 font-semibold text-xs rounded-xl border border-amber-300 hover:border-amber-400 hover:bg-amber-50 hover:shadow-xs transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Sandbox HR Admin</span>
            </button>
            <button
              type="button"
              id="quick-login-employee-btn"
              disabled={isSubmitting || isGoogleLoading || loading}
              onClick={() => handleDemoSignIn('employee')}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-amber-900 font-semibold text-xs rounded-xl border border-amber-300 hover:border-amber-400 hover:bg-amber-50 hover:shadow-xs transition-all disabled:opacity-50"
            >
              <User className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Sandbox Employee</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">Account Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sign in to manage company records or access your profile
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            id="google-signin-btn"
            disabled={isSubmitting || isGoogleLoading || loading}
            onClick={handleGoogleSignIn}
            className="w-full mb-5 flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-all disabled:opacity-60"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider font-medium">
              or email sign in
            </span>
          </div>

          {showOperationNotAllowedNotice && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Firebase Project Notice</p>
                  <p className="leading-relaxed text-amber-800">
                    The Email/Password sign-in provider is not enabled in this Firebase project. You can access all features right now using the <strong>Quick Demo Access</strong> buttons above or <strong>Continue with Google</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && !showOperationNotAllowedNotice && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              id="email-signin-submit-btn"
              disabled={isSubmitting || isGoogleLoading || loading}
              className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New employee?{' '}
              <button
                type="button"
                id="switch-to-register-btn"
                onClick={onSwitchToRegister}
                className="font-semibold text-indigo-600 hover:text-indigo-800 ml-1 transition-colors underline-offset-2 hover:underline"
              >
                Register Employee Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
