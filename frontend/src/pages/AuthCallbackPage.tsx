import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BrainCircuit } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const name = searchParams.get('name') || 'Google User';
    const id = searchParams.get('id') ? Number(searchParams.get('id')) : 1;
    const error = searchParams.get('error');

    if (error) {
      showToast(decodeURIComponent(error), 'error');
      navigate('/login');
      return;
    }

    if (token && email) {
      login(token, {
        id,
        email,
        full_name: decodeURIComponent(name),
      });
      showToast(`Welcome back, ${decodeURIComponent(name)}! Signed in with Google.`, 'success');
      navigate('/dashboard');
    } else {
      showToast('Authentication failed. Please try again.', 'error');
      navigate('/login');
    }
  }, [searchParams, login, navigate, showToast]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xl max-w-sm w-full text-center space-y-4">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner animate-pulse">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">Verifying with Google...</h3>
        <p className="text-xs text-slate-500">Completing secure authentication and preparing your career dashboard.</p>
      </div>
    </div>
  );
};

