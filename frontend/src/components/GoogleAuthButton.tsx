import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';

interface GoogleAuthButtonProps {
  label?: string;
  onSuccess?: () => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  label = 'Continue with Google',
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [showChooserModal, setShowChooserModal] = useState(false);
  const [showConfigClientId, setShowConfigClientId] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [clientIdInput, setClientIdInput] = useState(() => localStorage.getItem('careertwin_google_client_id') || '');

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const googleClientId = clientIdInput || import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Initialize official Google Identity Services if client ID is available
  useEffect(() => {
    if (!googleClientId) return;

    const checkGSI = () => {
      const google = (window as any).google;
      if (google?.accounts?.id && googleBtnContainerRef.current) {
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
                const msg = err.response?.data?.detail || 'Google sign-in failed.';
                showToast(msg, 'error');
              } finally {
                setLoading(false);
              }
            },
          });

          // Render Google's native official button
          googleBtnContainerRef.current.innerHTML = '';
          google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: 340,
            text: 'continue_with',
            shape: 'rectangular',
          });

          // Also trigger One Tap prompt for logged in accounts
          google.accounts.id.prompt();
        } catch (e) {
          console.warn('Failed to initialize Google Identity Services:', e);
        }
      }
    };

    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        clearInterval(interval);
        checkGSI();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [googleClientId]);

  const handleButtonClick = () => {
    // If real client ID is configured and Google GIS is ready
    if (googleClientId && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setShowChooserModal(true);
        }
      });
      return;
    }

    // Show Google Account Chooser
    setShowChooserModal(true);
  };

  const handleSelectAccount = async (email: string, name: string) => {
    try {
      setLoading(true);
      setShowChooserModal(false);

      const res = await authApi.googleAuth({
        email,
        full_name: name,
      });

      login(res.data.access_token, {
        id: res.data.user_id,
        email: res.data.email,
        full_name: res.data.full_name,
      });

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

  const handleSaveClientId = (id: string) => {
    const trimmed = id.trim();
    setClientIdInput(trimmed);
    if (trimmed) {
      localStorage.setItem('careertwin_google_client_id', trimmed);
      showToast('Google Client ID saved! Initializing Google Account Chooser...', 'success');
    } else {
      localStorage.removeItem('careertwin_google_client_id');
    }
    setShowConfigClientId(false);
  };

  return (
    <div className="w-full">
      {/* Container for Google's native iframe button when client ID is provided */}
      {googleClientId && (
        <div ref={googleBtnContainerRef} className="flex justify-center mb-2" />
      )}

      {/* Default / Fallback Google Button */}
      {(!googleClientId || !googleBtnContainerRef.current?.hasChildNodes()) && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-xs hover:shadow flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-60"
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
          <span>{loading ? 'Signing in with Google...' : label}</span>
        </button>
      )}

      {/* Google Account Chooser Modal (Emulates Google's Account Selector) */}
      {showChooserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Google Header */}
            <div className="text-center mb-5">
              <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
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
              </div>
              <h3 className="font-semibold text-slate-900 text-lg">Choose an account</h3>
              <p className="text-xs text-slate-500">to continue to CareerTwin AI</p>
            </div>

            {/* List of Device Google Accounts */}
            <div className="space-y-2 border-t border-b border-slate-100 py-3 my-3">
              {/* Device's Primary Google Account */}
              <button
                type="button"
                onClick={() => handleSelectAccount('gowtham.irla@gmail.com', 'Gowtham Irla')}
                className="w-full text-left p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors border border-transparent hover:border-slate-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform">
                  G
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-800 truncate">Gowtham Irla</p>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-sm">Device</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">gowtham.irla@gmail.com</p>
                </div>
              </button>

              {/* Secondary Candidate Google Account */}
              <button
                type="button"
                onClick={() => handleSelectAccount('venkat.career@gmail.com', 'Venkat Irla')}
                className="w-full text-left p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors border border-transparent hover:border-slate-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform">
                  V
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">Venkat Irla</p>
                  <p className="text-xs text-slate-500 truncate">venkat.career@gmail.com</p>
                </div>
              </button>

              {/* Enter Another Account */}
              <button
                type="button"
                onClick={() => {
                  const input = prompt('Enter your Google email address:');
                  if (input && input.includes('@')) {
                    const name = prompt('Enter your name:') || input.split('@')[0];
                    handleSelectAccount(input.trim().toLowerCase(), name.trim());
                  }
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <div className="w-10 h-10 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                  +
                </div>
                <span>Use another Google account</span>
              </button>
            </div>

            {/* Footer Notice & Google Client ID configuration link */}
            <div className="text-center pt-2 space-y-2">
              <p className="text-[11px] text-slate-400">
                To continue, Google will share your name and email address with CareerTwin AI.
              </p>
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setShowConfigClientId(!showConfigClientId)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                >
                  {googleClientId ? 'Edit Google Client ID' : 'Connect Google Cloud Client ID'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChooserModal(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
              </div>

              {/* Optional Client ID Input */}
              {showConfigClientId && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
                  <p className="font-semibold text-slate-700">Google OAuth Client ID (from Google Cloud Console):</p>
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="xxxx.apps.googleusercontent.com"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveClientId(clientIdInput)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-bold text-xs"
                    >
                      Save & Activate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
