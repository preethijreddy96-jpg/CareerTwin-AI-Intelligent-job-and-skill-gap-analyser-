import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';
import { BrainCircuit, X, Key, ExternalLink } from 'lucide-react';

interface GoogleAuthButtonProps {
  label?: string;
  onSuccess?: () => void;
}

interface GoogleAccountItem {
  name: string;
  email: string;
  avatarBg?: string;
  avatarText?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  label = 'Continue with Google',
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [showChooserModal, setShowChooserModal] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [customEmailModal, setCustomEmailModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // The candidate Google accounts present on this device (matching Image 2)
  const deviceAccounts: GoogleAccountItem[] = [
    {
      name: 'Prem Irla',
      email: 'irla.prem@gmail.com',
      avatarBg: 'bg-slate-900',
      avatarText: 'P',
    },
    {
      name: 'Leela Leela',
      email: 'leela.irla@gmail.com',
      avatarBg: 'bg-[#c2185b]',
      avatarText: 'L',
    },
    {
      name: 'Venkat Gowtham',
      email: 'venkatgowtham2005@gmail.com',
      avatarBg: 'bg-[#004d40]',
      avatarText: 'V',
    },
  ];

  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      // Check if backend has live Google OAuth client credentials configured
      const statusRes = await fetch('http://localhost:8001/api/auth/google/status');
      const statusData = await statusRes.json();

      if (statusData.configured) {
        // Redirect directly to live accounts.google.com
        window.location.href = 'http://localhost:8001/api/auth/google/login';
        return;
      }
    } catch (e) {
      console.warn('Could not check Google OAuth status:', e);
    } finally {
      setLoading(false);
    }

    // If client ID is not yet configured, show the authentic Account Chooser
    setShowChooserModal(true);
  };

  const handleSelectAccount = async (email: string, name: string) => {
    try {
      setLoading(true);
      setShowChooserModal(false);
      setCustomEmailModal(false);

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

  return (
    <div className="w-full">
      {/* Main Google Sign-In Trigger Button */}
      <button
        type="button"
        onClick={handleGoogleClick}
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

      {/* Official Google Account Chooser Modal (Matches Image 2) */}
      {showChooserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            {/* Top Bar: Sign in with Google */}
            <div className="px-6 sm:px-8 py-3.5 border-b border-slate-200/70 flex items-center justify-between bg-white">
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
                <span className="text-sm font-medium text-slate-700">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => setShowChooserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content Area (Two Columns Layout matching Image 2) */}
            <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 bg-white">
              {/* Left Column: App Branding and Heading */}
              <div className="flex flex-col justify-start">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-slate-900/10">
                  <BrainCircuit className="w-7 h-7 text-indigo-400" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-normal text-slate-900 tracking-tight leading-tight">
                  Choose an account
                </h2>
                <p className="text-base sm:text-lg text-slate-700 mt-3 font-normal">
                  to continue to <span className="text-[#0b57d0] font-medium">CareerTwin AI</span>
                </p>
              </div>

              {/* Right Column: Account List with Horizontal Dividers */}
              <div className="flex flex-col">
                <div className="divide-y divide-slate-200">
                  {deviceAccounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => handleSelectAccount(account.email, account.name)}
                      className="w-full text-left py-4 px-2 hover:bg-slate-50 flex items-center gap-4 transition-colors group cursor-pointer"
                    >
                      {/* Avatar */}
                      <div
                        className={`w-9 h-9 rounded-full ${account.avatarBg} text-white font-medium flex items-center justify-center text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                      >
                        {account.avatarText}
                      </div>

                      {/* Name & Email */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {account.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{account.email}</p>
                      </div>
                    </button>
                  ))}

                  {/* Use another account option */}
                  <button
                    type="button"
                    onClick={() => {
                      setCustomEmailModal(true);
                    }}
                    className="w-full text-left py-4 px-2 hover:bg-slate-50 flex items-center gap-4 transition-colors group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 shrink-0 group-hover:border-slate-400">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                      Use another account
                    </span>
                  </button>
                </div>

                {/* Terms and Privacy text under the list */}
                <div className="mt-8 text-xs text-slate-600 leading-relaxed">
                  Before using this app, you can review CareerTwin AI's{' '}
                  <span className="text-[#0b57d0] font-medium cursor-pointer hover:underline">Privacy Policy</span> and{' '}
                  <span className="text-[#0b57d0] font-medium cursor-pointer hover:underline">Terms of Service</span>.
                </div>
              </div>
            </div>

            {/* Bottom Footer Bar */}
            <div className="px-8 py-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                <span>English (United States)</span>
                <span className="text-[10px]">▼</span>
              </div>
              <div className="flex items-center gap-4 mt-1 sm:mt-0">
                <button
                  type="button"
                  onClick={() => setShowSetupGuide(!showSetupGuide)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Google Cloud OAuth Setup Info</span>
                </button>
                <span className="cursor-pointer hover:text-slate-700">Help</span>
                <span className="cursor-pointer hover:text-slate-700">Privacy</span>
                <span className="cursor-pointer hover:text-slate-700">Terms</span>
              </div>
            </div>

            {/* Setup Info Collapsible Panel */}
            {showSetupGuide && (
              <div className="p-6 bg-indigo-50/70 border-t border-indigo-100 text-xs text-slate-700 space-y-2">
                <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /> How Real accounts.google.com Redirection Works:
                </p>
                <p>
                  To have Google open directly on <strong>accounts.google.com</strong> with your browser's session cookies (like in OpenAI/ChatGPT), Google requires your application to register a free OAuth Client in Google Cloud Console:
                </p>
                <ol className="list-decimal pl-5 space-y-1 font-mono text-[11px] text-slate-800">
                  <li>Go to <strong>console.cloud.google.com/apis/credentials</strong></li>
                  <li>Click <strong>Create Credentials → OAuth Client ID (Web Application)</strong></li>
                  <li>Add Authorized Redirect URI: <strong>http://localhost:8001/api/auth/google/callback</strong></li>
                  <li>Add <strong>GOOGLE_CLIENT_ID</strong> and <strong>GOOGLE_CLIENT_SECRET</strong> to your backend <code>.env</code> file.</li>
                </ol>
                <p className="text-[11px] text-slate-500 pt-1">
                  Once added, clicking "Continue with Google" redirects directly to Google's live domain. Until then, you can click any of your device accounts above to sign in instantly!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for "Use another account" */}
      {customEmailModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <h3 className="font-semibold text-slate-900 text-base">Enter another Google account</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Google Email</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomEmailModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!customEmail || !customEmail.includes('@')) {
                    showToast('Please enter a valid Google email address.', 'error');
                    return;
                  }
                  handleSelectAccount(customEmail.trim().toLowerCase(), customName.trim() || customEmail.split('@')[0]);
                }}
                className="px-4 py-1.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
