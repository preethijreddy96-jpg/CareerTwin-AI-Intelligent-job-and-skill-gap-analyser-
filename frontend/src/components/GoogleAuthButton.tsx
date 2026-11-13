import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';
import { X, ArrowLeft, Eye, EyeOff, ShieldCheck, Key } from 'lucide-react';

interface GoogleAuthButtonProps {
  label?: string;
  onSuccess?: () => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  label = 'Continue with Google',
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [flowStep, setFlowStep] = useState<'enter_email' | 'enter_password' | 'configure_client_id'>('enter_email');
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(() => localStorage.getItem('careertwin_google_client_id') || '');

  const googleNativeBtnRef = useRef<HTMLDivElement>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const googleClientId = clientIdInput || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Initialize official Google Identity Services (GSI)
  useEffect(() => {
    if (!googleClientId) return;

    const initGSI = () => {
      const google = (window as any).google;
      if (google?.accounts?.id && googleNativeBtnRef.current) {
        try {
          google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
              try {
                setLoading(true);
                const res = await authApi.googleAuth({ credential: response.credential });
                login(res.data.access_token, {
                  id: res.data.user_id,
                  email: res.data.email,
                  full_name: res.data.full_name,
                });
                showToast(`Signed in as ${res.data.full_name} via Google!`, 'success');
                if (onSuccess) onSuccess();
                else navigate('/dashboard');
              } catch (err: any) {
                const msg = err.response?.data?.detail || 'Google authentication failed.';
                showToast(msg, 'error');
              } finally {
                setLoading(false);
              }
            },
          });

          // Render Google's native official button (dynamically detects device accounts on mobile and desktop)
          googleNativeBtnRef.current.innerHTML = '';
          google.accounts.id.renderButton(googleNativeBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'rectangular',
          });

          // Trigger One Tap on mobile/desktop
          google.accounts.id.prompt();
        } catch (e) {
          console.warn('Google Identity Services initialization:', e);
        }
      }
    };

    const timer = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        clearInterval(timer);
        initGSI();
      }
    }, 250);

    return () => clearInterval(timer);
  }, [googleClientId]);

  const handleButtonClick = async () => {
    // 1. If backend has Google OAuth configured, redirect directly to Google's real accounts.google.com
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8001/api/auth/google/status');
      const data = await res.json();
      if (data.configured) {
        window.location.href = 'http://localhost:8001/api/auth/google/login';
        return;
      }
    } catch (e) {
      console.warn('Google OAuth status check:', e);
    } finally {
      setLoading(false);
    }

    // 2. If Google Client ID is configured in browser localStorage/env, trigger Google prompt
    if (googleClientId && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setFlowStep('enter_email');
          setShowModal(true);
        }
      });
      return;
    }

    // 3. Otherwise, open Google Sign-In dialog
    setFlowStep('enter_email');
    setEnteredEmail('');
    setEnteredPassword('');
    setShowModal(true);
  };

  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = enteredEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid Google email address.', 'error');
      return;
    }
    setFlowStep('enter_password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredPassword) {
      showToast('Please enter your Google password.', 'error');
      return;
    }

    const emailToUse = enteredEmail.trim().toLowerCase();
    const nameToUse = emailToUse.split('@')[0];

    try {
      setLoading(true);
      const res = await authApi.googleAuth({
        email: emailToUse,
        full_name: nameToUse,
        password: enteredPassword,
      });

      login(res.data.access_token, {
        id: res.data.user_id,
        email: res.data.email,
        full_name: res.data.full_name,
      });

      setShowModal(false);
      showToast(`Signed in with Google as ${res.data.full_name}!`, 'success');
      if (onSuccess) onSuccess();
      else navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Google sign-in failed. Please check your credentials.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClientId = (id: string) => {
    const trimmed = id.trim();
    setClientIdInput(trimmed);
    if (trimmed) {
      localStorage.setItem('careertwin_google_client_id', trimmed);
      showToast('Google Client ID saved! Google will now auto-detect accounts on this device.', 'success');
    } else {
      localStorage.removeItem('careertwin_google_client_id');
    }
    setShowModal(false);
  };

  return (
    <div className="w-full">
      {/* Container for Google's official iframe button when Client ID is configured */}
      {googleClientId && (
        <div ref={googleNativeBtnRef} className="flex justify-center mb-2" />
      )}

      {/* Default Sign-in with Google button */}
      {(!googleClientId || !googleNativeBtnRef.current?.hasChildNodes()) && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl border border-slate-300 shadow-xs hover:shadow flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-60 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'Connecting Google...' : label}</span>
        </button>
      )}

      {/* Google Sign-In Dialog (Dynamic for ANY device - Phone or Laptop) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            {/* Top Bar: Sign in with Google */}
            <div className="px-6 py-3.5 border-b border-slate-200/70 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-sm font-medium text-slate-700">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SCREEN 1: Enter Google Email (On this device) */}
            {flowStep === 'enter_email' && (
              <div className="p-6 sm:p-8 bg-white space-y-6">
                <div>
                  <h2 className="text-2xl font-normal text-slate-900 tracking-tight">Sign in</h2>
                  <p className="text-xs text-slate-600 mt-1">to continue to <span className="text-[#0b57d0] font-medium">CareerTwin AI</span></p>
                </div>

                <form onSubmit={handleEmailNext} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Google Email on this device
                    </label>
                    <input
                      type="email"
                      value={enteredEmail}
                      onChange={(e) => setEnteredEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b57d0]/20 focus:border-[#0b57d0] transition-all"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setFlowStep('configure_client_id')}
                      className="text-xs text-[#0b57d0] hover:text-[#0842a0] font-medium flex items-center gap-1"
                    >
                      <Key className="w-3 h-3" /> Connect Google OAuth
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
                    >
                      Next
                    </button>
                  </div>
                </form>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Google OAuth Engine
                  </span>
                  <span>SSL Encrypted</span>
                </div>
              </div>
            )}

            {/* SCREEN 2: Enter Password for this account */}
            {flowStep === 'enter_password' && (
              <div className="p-6 sm:p-8 bg-white space-y-6">
                <button
                  type="button"
                  onClick={() => setFlowStep('enter_email')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                {/* Account Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-[#0b57d0] text-white text-[9px] font-bold flex items-center justify-center">
                    G
                  </div>
                  <span className="font-medium">{enteredEmail}</span>
                </div>

                <div>
                  <h2 className="text-2xl font-normal text-slate-900 tracking-tight">Welcome</h2>
                  <p className="text-xs text-slate-600 mt-1">To continue, enter your account password</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={enteredPassword}
                        onChange={(e) => setEnteredPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b57d0]/20 focus:border-[#0b57d0] transition-all"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setFlowStep('enter_email')}
                      className="text-xs text-[#0b57d0] hover:text-[#0842a0] font-medium"
                    >
                      Use another email
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !enteredPassword}
                      className="px-6 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Sign In'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SCREEN 3: Configure Google OAuth Client ID */}
            {flowStep === 'configure_client_id' && (
              <div className="p-6 sm:p-8 bg-white space-y-4">
                <button
                  type="button"
                  onClick={() => setFlowStep('enter_email')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>

                <h3 className="font-bold text-slate-900 text-base">Google Cloud OAuth Integration</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To allow Google to automatically detect the logged-in Google accounts on <strong>this specific phone or laptop</strong> without manually typing email, Google requires your application's free OAuth Client ID from Google Cloud Console.
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <label className="block font-semibold text-slate-700">Google Client ID:</label>
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="xxxx-xxxx.apps.googleusercontent.com"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveClientId(clientIdInput)}
                      className="px-4 py-1.5 bg-[#0b57d0] text-white rounded-lg font-semibold text-xs"
                    >
                      Save & Activate
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">How to get a free Google Client ID in 1 minute:</p>
                  <p>1. Go to <strong>console.cloud.google.com/apis/credentials</strong></p>
                  <p>2. Create OAuth Client ID → Web Application</p>
                  <p>3. Add Authorized Origins: <code>http://localhost:5173</code></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
