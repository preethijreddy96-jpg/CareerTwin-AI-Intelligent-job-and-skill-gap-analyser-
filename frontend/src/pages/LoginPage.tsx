import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';
import {
  BrainCircuit,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  RefreshCw,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [step, setStep] = useState<'credentials' | 'verify'>('credentials');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Email format validation
  const emailDomain = email.includes('@') ? email.split('@')[1]?.toLowerCase() : '';
  const isDisposable = [
    'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
    'trashmail.com', 'yopmail.com', 'fake.com', 'test.com', 'invalid.com'
  ].includes(emailDomain);
  const hasDotInDomain = emailDomain.includes('.') && emailDomain.split('.').pop()!.length >= 2;
  const isEmailFormatValid = email.includes('@') && hasDotInDomain && !isDisposable;

  const handleFillDemo = () => {
    setEmail('demo.developer@careertwin.ai');
    setPassword('DemoCareer2026!#');
    setStep('credentials');
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    if (!isEmailFormatValid) {
      showToast('Please provide a valid, active email address with an existing domain.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login({ email, password });

      if (res.data.requires_2fa) {
        setDevCode(res.data.dev_verification_code || null);
        setVerificationCode(res.data.dev_verification_code || '');
        setStep('verify');
        showToast('Security code sent! Please check your email to complete login.', 'info');
      } else {
        login(res.data.access_token, {
          id: res.data.user_id,
          email: res.data.email,
          full_name: res.data.full_name,
        });
        showToast(`Welcome back, ${res.data.full_name}!`, 'success');
        navigate('/dashboard');
      }
    } catch (err: any) {
      let msg = err.response?.data?.detail;
      if (Array.isArray(msg) && msg.length > 0) {
        msg = msg[0]?.msg?.replace('Value error, ', '') || JSON.stringify(msg);
      } else if (typeof msg === 'object' && msg?.msg) {
        msg = msg.msg.replace('Value error, ', '');
      } else if (!err.response && err.message) {
        msg = `Network connection error (${err.message}). Please ensure backend is reachable.`;
      }
      showToast(msg || 'Invalid email or password. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length < 4) {
      showToast('Please enter your 6-digit security code.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.verifyLoginCode({
        email,
        code: verificationCode.trim(),
      });

      login(res.data.access_token, {
        id: res.data.user_id,
        email: res.data.email,
        full_name: res.data.full_name,
      });

      showToast(`Login verified! Welcome back, ${res.data.full_name}!`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid or expired security code.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResending(true);
      const res = await authApi.resendCode({ email });
      if (res.data.dev_verification_code) {
        setDevCode(res.data.dev_verification_code);
        setVerificationCode(res.data.dev_verification_code);
      }
      showToast('A new 6-digit security code has been sent to your email.', 'success');
    } catch (err: any) {
      showToast('Failed to resend code. Please try again in a moment.', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500"></div>

      {step === 'credentials' ? (
        <>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/25">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to CareerTwin</h2>
            <p className="text-xs text-slate-500 mt-1">Verified candidate portal with explainable AI match</p>
          </div>

          {/* Google Authentication Button */}
          <div className="mb-4">
            <GoogleAuthButton label="Continue with Google" />
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">Or continue with verified email</span>
            </div>
          </div>

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Verified Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    email && !isEmailFormatValid
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-indigo-600/20 focus:border-indigo-600'
                  }`}
                  required
                />
              </div>
              {email && !isEmailFormatValid && (
                <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Please provide an existing, permanent email provider (e.g., gmail.com, outlook.com).
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01]"
            >
              {loading ? 'Authenticating & Verifying...' : 'Sign In with Email'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Credentials Button */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-center space-y-2">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl hover:bg-indigo-100 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quick Demo Auto-Fill (Pre-Verified Candidate)</span>
            </button>
            <p className="text-[10px] text-slate-400">
              Username: <span className="font-mono text-slate-600 font-semibold">demo.developer@careertwin.ai</span>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              Register and verify
            </Link>
          </div>
        </>
      ) : (
        /* STEP 2: 2-STEP EMAIL SECURITY CODE VERIFICATION */
        <div className="space-y-5 animate-fadeIn">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">2-Step Email Verification</h3>
            <p className="text-xs text-slate-500 mt-1">
              For your account security, enter the 6-digit code sent to
            </p>
            <p className="text-xs font-bold text-indigo-600 mt-0.5">{email}</p>
          </div>

          {/* Development Security Code Preview Banner */}
          {devCode && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Security Verification Code Dispatched:</span>
              </div>
              <p className="font-mono text-base font-extrabold tracking-widest text-emerald-700 bg-white px-3 py-1 rounded-lg border border-emerald-200 text-center">
                {devCode}
              </p>
              <p className="text-[10px] text-emerald-600 text-center">
                (Simulated real-world email delivery for local testing)
              </p>
            </div>
          )}

          <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                6-Digit Confirmation Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center text-2xl font-mono tracking-widest py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-bold"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01]"
            >
              {loading ? 'Verifying Code...' : 'Confirm Code & Complete Login'}
              {!loading && <Check className="w-4 h-4" />}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>Resend Code</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="text-slate-400 hover:text-slate-600 font-semibold transition-colors"
            >
              Change Email / Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
