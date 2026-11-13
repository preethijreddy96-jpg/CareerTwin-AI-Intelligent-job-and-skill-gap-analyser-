import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';
import { BrainCircuit, X, ArrowLeft, Eye, EyeOff } from 'lucide-react';

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

  // Workflow steps: 'choose_account' | 'enter_email' | 'enter_password'
  const [flowStep, setFlowStep] = useState<'choose_account' | 'enter_email' | 'enter_password'>('choose_account');
  const [selectedAccount, setSelectedAccount] = useState<GoogleAccountItem | null>(null);
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // The candidate Google accounts present on this device (matching Image 2)
  const deviceAccounts: GoogleAccountItem[] = [
    {
      name: 'Venkat Gowtham',
      email: 'venkatgowtham2005@gmail.com',
      avatarBg: 'bg-[#004d40]',
      avatarText: 'V',
    },
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
  ];

  const handleOpenModal = () => {
    setFlowStep('choose_account');
    setSelectedAccount(null);
    setEnteredEmail('');
    setEnteredPassword('');
    setShowChooserModal(true);
  };

  const handleSelectDeviceAccount = (account: GoogleAccountItem) => {
    setSelectedAccount(account);
    setEnteredEmail(account.email);
    setFlowStep('enter_password');
  };

  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = enteredEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid Google email address.', 'error');
      return;
    }
    const matched = deviceAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (matched) {
      setSelectedAccount(matched);
    } else {
      setSelectedAccount({
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        avatarBg: 'bg-indigo-600',
        avatarText: cleanEmail[0].toUpperCase(),
      });
    }
    setFlowStep('enter_password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredPassword) {
      showToast('Please enter your password.', 'error');
      return;
    }

    const emailToUse = selectedAccount?.email || enteredEmail.trim().toLowerCase();
    const nameToUse = selectedAccount?.name || emailToUse.split('@')[0];

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

      setShowChooserModal(false);
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

  const handleOneClickSignIn = async (account: GoogleAccountItem) => {
    try {
      setLoading(true);
      setShowChooserModal(false);

      const res = await authApi.googleAuth({
        email: account.email,
        full_name: account.name,
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
        onClick={handleOpenModal}
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
        <span>{loading ? 'Signing in with Google...' : label}</span>
      </button>

      {/* Google Modal Dialog */}
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

            {/* SCREEN 1: Choose an Account (Image 2) */}
            {flowStep === 'choose_account' && (
              <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 bg-white">
                {/* Left Column */}
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

                {/* Right Column: Account List */}
                <div className="flex flex-col">
                  <div className="divide-y divide-slate-200">
                    {deviceAccounts.map((account) => (
                      <div
                        key={account.email}
                        className="py-3.5 px-2 hover:bg-slate-50 flex items-center justify-between transition-colors group cursor-pointer"
                        onClick={() => handleSelectDeviceAccount(account)}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full ${account.avatarBg} text-white font-medium flex items-center justify-center text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                          >
                            {account.avatarText}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                              {account.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{account.email}</p>
                          </div>
                        </div>

                        {/* Quick 1-tap option */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOneClickSignIn(account);
                          }}
                          className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                          title="Instant verified sign-in"
                        >
                          Sign In
                        </button>
                      </div>
                    ))}

                    {/* Use another account option */}
                    <button
                      type="button"
                      onClick={() => {
                        setEnteredEmail('');
                        setEnteredPassword('');
                        setFlowStep('enter_email');
                      }}
                      className="w-full text-left py-4 px-2 hover:bg-slate-50 flex items-center gap-4 transition-colors group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 shrink-0 group-hover:border-slate-400">
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

                  <div className="mt-8 text-xs text-slate-600 leading-relaxed">
                    Before using this app, you can review CareerTwin AI's{' '}
                    <span className="text-[#0b57d0] font-medium cursor-pointer hover:underline">Privacy Policy</span> and{' '}
                    <span className="text-[#0b57d0] font-medium cursor-pointer hover:underline">Terms of Service</span>.
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: Google Email Step ("Use another account") */}
            {flowStep === 'enter_email' && (
              <div className="p-8 sm:p-14 max-w-xl mx-auto bg-white">
                <button
                  type="button"
                  onClick={() => setFlowStep('choose_account')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium mb-6"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to accounts
                </button>

                <h2 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight mb-2">
                  Sign in with Google
                </h2>
                <p className="text-sm text-slate-600 mb-8">
                  Enter your Google email to continue to CareerTwin AI
                </p>

                <form onSubmit={handleEmailNext} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email or phone
                    </label>
                    <input
                      type="email"
                      value={enteredEmail}
                      onChange={(e) => setEnteredEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b57d0]/20 focus:border-[#0b57d0] transition-all"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setFlowStep('choose_account')}
                      className="text-sm text-[#0b57d0] hover:text-[#0842a0] font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm font-semibold rounded-xl shadow-xs transition-all"
                    >
                      Next
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SCREEN 3: Google Password Step */}
            {flowStep === 'enter_password' && (
              <div className="p-8 sm:p-14 max-w-xl mx-auto bg-white">
                <button
                  type="button"
                  onClick={() => setFlowStep('choose_account')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium mb-6"
                >
                  <ArrowLeft className="w-4 h-4" /> Switch account
                </button>

                {/* Account Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full mb-6 text-xs text-slate-700">
                  <div className={`w-5 h-5 rounded-full ${selectedAccount?.avatarBg || 'bg-indigo-600'} text-white text-[10px] font-bold flex items-center justify-center`}>
                    {selectedAccount?.avatarText || 'G'}
                  </div>
                  <span className="font-medium">{selectedAccount?.email || enteredEmail}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight mb-2">
                  Welcome
                </h2>
                <p className="text-sm text-slate-600 mb-8">
                  To continue, enter your Google account password
                </p>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Enter your password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={enteredPassword}
                        onChange={(e) => setEnteredPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b57d0]/20 focus:border-[#0b57d0] transition-all"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setFlowStep('choose_account')}
                      className="text-sm text-[#0b57d0] hover:text-[#0842a0] font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !enteredPassword}
                      className="px-6 py-2.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Next'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Bottom Footer Bar */}
            <div className="px-8 py-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                <span>English (United States)</span>
                <span className="text-[10px]">▼</span>
              </div>
              <div className="flex items-center gap-6 mt-1 sm:mt-0">
                <span className="cursor-pointer hover:text-slate-700">Help</span>
                <span className="cursor-pointer hover:text-slate-700">Privacy</span>
                <span className="cursor-pointer hover:text-slate-700">Terms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
