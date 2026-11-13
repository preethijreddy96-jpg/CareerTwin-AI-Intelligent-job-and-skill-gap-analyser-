import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';
import { BrainCircuit, Lock, Mail, User, ArrowRight, Check, X, ShieldCheck, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Password requirement tests
  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?~/]/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber && hasSpecial;

  // Email validation tests
  const emailDomain = email.includes('@') ? email.split('@')[1]?.toLowerCase() : '';
  const isDisposable = ['mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'trashmail.com', 'yopmail.com', 'fake.com', 'test.com'].includes(emailDomain);
  const hasDotInDomain = emailDomain.includes('.') && emailDomain.split('.').pop()!.length >= 2;
  const isEmailFormatValid = email.includes('@') && hasDotInDomain && !isDisposable;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (!isEmailFormatValid) {
      showToast('Please provide a valid, real email domain (e.g., gmail.com, outlook.com).', 'error');
      return;
    }
    if (!isPasswordValid) {
      showToast('Please satisfy all password complexity requirements.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.register({
        full_name: fullName,
        email,
        password,
      });

      setDevCode(res.data.dev_verification_code || null);
      setVerificationCode(res.data.dev_verification_code || '');
      setStep('verify');
      showToast('Verification code generated! Please confirm your email.', 'info');
    } catch (err: any) {
      let msg = err.response?.data?.detail;
      if (Array.isArray(msg) && msg.length > 0) {
        msg = msg[0]?.msg?.replace('Value error, ', '') || JSON.stringify(msg);
      } else if (typeof msg === 'object' && msg?.msg) {
        msg = msg.msg.replace('Value error, ', '');
      }
      showToast(msg || 'Registration failed. Please check your information.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      showToast('Please enter the 6-digit confirmation code.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.verifyEmail({
        email,
        code: verificationCode.trim(),
      });

      login(res.data.access_token, {
        id: res.data.user_id,
        email: res.data.email,
        full_name: res.data.full_name,
      });

      showToast('Email verified successfully! Welcome to CareerTwin AI.', 'success');
      navigate('/onboarding');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Verification code failed. Please check the code.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await authApi.resendCode({ email });
      if (res.data.dev_verification_code) {
        setDevCode(res.data.dev_verification_code);
        setVerificationCode(res.data.dev_verification_code);
      }
      showToast('Verification code refreshed!', 'info');
    } catch (err) {
      showToast('Failed to resend code.', 'error');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {step === 'register' ? 'Create your account' : 'Verify your email'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {step === 'register'
            ? 'Start your intelligent career journey today'
            : `Enter the 6-digit confirmation code sent to ${email}`}
        </p>
      </div>

      {step === 'register' && (
        <>
          <div className="mb-4">
            <GoogleAuthButton label="Sign up with Google" />
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">Or register with active email</span>
            </div>
          </div>
        </>
      )}

      {step === 'register' ? (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address (Real & Deliverable Email Only)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                required
              />
            </div>

            {/* Live Email Deliverability Hint */}
            {email.length > 0 && (
              <div className="mt-1 text-[11px] flex items-center gap-1.5">
                {isDisposable ? (
                  <span className="text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Disposable/temporary emails are not accepted.
                  </span>
                ) : isEmailFormatValid ? (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 shrink-0" /> Valid domain format (@{emailDomain})
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Please provide a valid, active email domain (e.g. @gmail.com)
                  </span>
                )}
              </div>
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

            {/* Password Policy Indicator */}
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
              <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">
                Password Security Requirements:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  <span>8+ Characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLetter ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  {hasLetter ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  <span>Letters (A-Z, a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  <span>Numbers (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  {hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  <span>Special (!@#$%^&*)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          >
            {loading ? 'Creating Account...' : 'Continue to Verification'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          {/* Dev Test Code Helper Badge */}
          {devCode && (
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
              <div>
                <span className="font-bold block text-[11px] text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Test Environment Code:
                </span>
                <span className="text-xl font-mono font-black tracking-widest text-indigo-700">{devCode}</span>
              </div>
              <button
                type="button"
                onClick={() => setVerificationCode(devCode)}
                className="px-2.5 py-1 text-[11px] font-bold bg-white border border-indigo-200 text-indigo-700 rounded-lg shadow-xs hover:bg-indigo-100"
              >
                Auto-Fill
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
              Enter 6-Digit Confirmation Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center text-2xl font-mono tracking-widest py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || verificationCode.length < 6}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-100 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Verifying...' : 'Verify & Launch Workspace'}</span>
          </button>

          <div className="flex items-center justify-between text-xs pt-2">
            <button
              type="button"
              onClick={handleResend}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Resend Code
            </button>
            <button
              type="button"
              onClick={() => setStep('register')}
              className="text-slate-400 hover:text-slate-600"
            >
              Back to Details
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
};
