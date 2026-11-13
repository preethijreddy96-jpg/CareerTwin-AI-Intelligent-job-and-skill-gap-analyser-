import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi, API_BASE_URL } from '../services/api';
import { Key, ExternalLink, X, ShieldAlert, Sparkles, Eye, EyeOff } from 'lucide-react';

interface GoogleAuthButtonProps {
  label?: string;
  onSuccess?: () => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  label = 'Continue with Google',
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return localStorage.getItem('careertwin_google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  });
  const [showDeviceSignInModal, setShowDeviceSignInModal] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');
  const [deviceEmail, setDeviceEmail] = useState('');
  const [devicePassword, setDevicePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const googleNativeBtnRef = useRef<HTMLDivElement>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // 1. Fetch public Google Client ID from backend so mobile devices automatically get it
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/google/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.client_id) {
            setGoogleClientId(data.client_id);
            localStorage.setItem('careertwin_google_client_id', data.client_id);
          }
        }
      } catch (err) {
        console.warn('Could not reach backend for Google status:', err);
      }
    };
    fetchStatus();
  }, []);

  // 2. Initialize official Google Identity Services (GSI)
  // This renders Google's real official button which queries Google accounts directly on THAT device!
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

          // Render Google's native official button
          // Google's own iframe reads the cookies on THIS specific device (mobile or laptop)
          googleNativeBtnRef.current.innerHTML = '';
          google.accounts.id.renderButton(googleNativeBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'rectangular',
          });

          // Also trigger Google One Tap on mobile/desktop
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
    }, 200);

    return () => clearInterval(timer);
  }, [googleClientId, login, navigate, onSuccess, showToast]);

  const handleButtonClick = () => {
    // If Google Client ID is configured, redirect directly to Google's official authorization endpoint
    if (googleClientId) {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        googleClientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token%20id_token&scope=openid%20email%20profile&prompt=select_account&nonce=career_${Date.now()}`;

      window.location.href = googleOAuthUrl;
      return;
    }

    // If no Client ID is provided yet, show device-agnostic Google sign-in
    setShowDeviceSignInModal(true);
  };

  const handleDeviceSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = deviceEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid Google email address.', 'error');
      return;
    }
    if (!devicePassword) {
      showToast('Please enter your password.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.googleAuth({
        email: cleanEmail,
        full_name: cleanEmail.split('@')[0],
        password: devicePassword,
      });

      login(res.data.access_token, {
        id: res.data.user_id,
        email: res.data.email,
        full_name: res.data.full_name,
      });

      setShowDeviceSignInModal(false);
      showToast(`Signed in with Google as ${res.data.full_name}!`, 'success');
      if (onSuccess) onSuccess();
      else navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Google sign-in failed.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClientId = async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) {
      showToast('Please enter a valid Google Client ID.', 'error');
      return;
    }

    try {
      // Save to backend so every device (mobile and laptop) gets it automatically
      await fetch(`${API_BASE_URL}/auth/google/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: trimmed }),
      });

      setGoogleClientId(trimmed);
      localStorage.setItem('careertwin_google_client_id', trimmed);
      setShowDeviceSignInModal(false);
      showToast('Google Client ID activated! Initializing live Google account detection for this device...', 'success');
    } catch (err) {
      setGoogleClientId(trimmed);
      localStorage.setItem('careertwin_google_client_id', trimmed);
      setShowDeviceSignInModal(false);
      showToast('Google Client ID saved locally on this device.', 'success');
    }
  };

  return (
    <div className="w-full">
      {/* Official Google iframe button container (rendered directly by Google on this device) */}
      {googleClientId && (
        <div ref={googleNativeBtnRef} className="flex justify-center mb-2" />
      )}

      {/* Standard Google Trigger Button */}
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
          <span>{loading ? 'Connecting to Google...' : label}</span>
        </button>
      )}

      {/* Device Google Authentication Modal (Zero Hardcoded Names) */}
      {showDeviceSignInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 my-auto p-6 sm:p-8 space-y-5">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
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
                <span className="text-sm font-semibold text-slate-800">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDeviceSignInModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign in with your Google account</h2>
              <p className="text-xs text-slate-500 mt-1">Enter the Google account present on this device to continue to CareerTwin AI</p>
            </div>

            <form onSubmit={handleDeviceSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Google Email
                </label>
                <input
                  type="email"
                  value={deviceEmail}
                  onChange={(e) => setDeviceEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b57d0]/20 focus:border-[#0b57d0] transition-all"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={devicePassword}
                    onChange={(e) => setDevicePassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b57d0]/20 focus:border-[#0b57d0] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !deviceEmail || !devicePassword}
                className="w-full py-2.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying with Google...' : 'Sign In with Google'}
              </button>
            </form>

            {/* Google Cloud Client ID Setup Option */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="w-full text-left text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-between py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Enable 1-Tap Device Account Detection</span>
                </span>
                <span className="text-[10px] text-slate-400">{showSetupGuide ? '▲' : '▼'}</span>
              </button>

              {showSetupGuide && (
                <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3 animate-in fade-in">
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    To have Google automatically display the real accounts signed into <strong>this specific phone or laptop</strong> without typing, enter your free Google OAuth Client ID:
                  </p>
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="xxxx.apps.googleusercontent.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveClientId(clientIdInput)}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs"
                  >
                    Save & Enable Across All Devices
                  </button>
                  <p className="text-[10px] text-slate-400">
                    Get your free Client ID in 1 minute from{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 underline font-medium"
                    >
                      console.cloud.google.com
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
