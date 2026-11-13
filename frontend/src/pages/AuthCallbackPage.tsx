import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';
import { BrainCircuit } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Check URL query parameters (e.g. from backend redirect)
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
        return;
      }

      // 2. Check URL hash parameters (e.g. from direct Google accounts.google.com OAuth redirect)
      const hash = window.location.hash.substring(1);
      if (hash) {
        const hashParams = new URLSearchParams(hash);
        const hashError = hashParams.get('error');
        if (hashError) {
          showToast(`Google error: ${hashError}`, 'error');
          navigate('/login');
          return;
        }

        const idToken = hashParams.get('id_token');
        const accessToken = hashParams.get('access_token');

        if (idToken) {
          try {
            const res = await authApi.googleAuth({ credential: idToken });
            login(res.data.access_token, {
              id: res.data.user_id,
              email: res.data.email,
              full_name: res.data.full_name,
            });
            showToast(`Welcome back, ${res.data.full_name}! Signed in via Google.`, 'success');
            navigate('/dashboard');
            return;
          } catch (err: any) {
            console.error('Google id_token exchange error:', err);
          }
        }

        if (accessToken) {
          try {
            // Fetch profile using access token directly from Google userinfo API
            const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (userRes.ok) {
              const profile = await userRes.json();
              const res = await authApi.googleAuth({
                email: profile.email,
                full_name: profile.name,
              });
              login(res.data.access_token, {
                id: res.data.user_id,
                email: res.data.email,
                full_name: res.data.full_name,
              });
              showToast(`Welcome back, ${profile.name}! Signed in via Google.`, 'success');
              navigate('/dashboard');
              return;
            }
          } catch (err: any) {
            console.error('Google access_token userinfo error:', err);
          }
        }
      }

      showToast('Authentication was cancelled or failed. Please try again.', 'error');
      navigate('/login');
    };

    handleAuth();
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

