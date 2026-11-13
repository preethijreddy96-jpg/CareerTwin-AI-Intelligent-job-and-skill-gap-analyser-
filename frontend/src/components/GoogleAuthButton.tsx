import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';
import { Key, ExternalLink, X, ShieldAlert, Sparkles } from 'lucide-react';

interface GoogleAuthButtonProps {
  label?: string;
  onSuccess?: () => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  label = 'Continue with Google',
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(() => localStorage.getItem('careertwin_google_client_id') || '');

  const googleNativeBtnRef = useRef<HTMLDivElement>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const googleClientId = clientIdInput || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Initialize official Google Identity Services (GSI)
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
  }, [googleClientId]);

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

    // If no Client ID is provided yet, show configuration setup
    setShowConfigModal(true);
  };

  const handleSaveClientId = (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) {
      showToast('Please enter a valid Google Client ID.', 'error');
      return;
    }
    setClientIdInput(trimmed);
    localStorage.setItem('careertwin_google_client_id', trimmed);
    setShowConfigModal(false);
    showToast('Google Client ID saved! Initializing live Google account detection for this device...', 'success');
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

      {/* Google Cloud Client ID Setup Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Real Device Google Authentication</h3>
                  <p className="text-xs text-slate-500">Cross-Device (Mobile & Laptop) Account Detection</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Why a Google Client ID is required by Google:</span>
              </div>
              <p className="leading-relaxed">
                No website in the world is allowed to read the private Google accounts on your phone or laptop using custom code (for user privacy). 
                To have Google's actual domain (<strong>accounts.google.com</strong>) open and display the real accounts signed into <strong>that specific phone or laptop</strong>, Google requires your app's free OAuth Client ID.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Enter your Google Cloud Client ID:
              </label>
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="e.g. 123456789-abcdefg.apps.googleusercontent.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleSaveClientId(clientIdInput)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save & Activate Real Device Detection</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                How to get your free Google Client ID in 1 minute:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-[11px] text-slate-500">
                <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline">Google Cloud Console → Credentials</a></li>
                <li>Click <strong>Create Credentials</strong> → <strong>OAuth Client ID</strong> (Web application)</li>
                <li>Add Authorized JavaScript origins: <code>http://localhost:5173</code> and <code>http://172.16.51.192:5173</code></li>
                <li>Copy the generated <strong>Client ID</strong> and paste it above!</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
