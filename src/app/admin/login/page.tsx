'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loginWithGoogle, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already logged in, redirect immediately
  useEffect(() => {
    fetch('/api/admin/auth/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.isAdmin) {
          router.push('/admin');
        }
      })
      .catch((err) => console.error('Auth check error', err));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || !user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, email: user.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const allowedEmail = 'just.darshan510@gmail.com';
  const isAuthorizedEmail = user && user.email && user.email.toLowerCase() === allowedEmail.toLowerCase();

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 select-none">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-slow-zoom pointer-events-none opacity-20"
        style={{ backgroundImage: "url('/front_bg.png')", filter: 'blur(10px)' }}
      />
      
      <div className="w-full max-w-md glass glass-elevated p-8 relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/80">
              CricBid Secure Portal
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white" style={{ letterSpacing: '-0.025em' }}>
            Admin Login
          </h1>
          <p className="text-sm text-white/60">
            Secure admin authentication using Google SSO &amp; Password keys.
          </p>
        </div>

        {error && (
          <div 
            className="text-xs font-semibold p-3.5 rounded-xl text-center border bg-red-500/10 border-red-500/30 text-red-400"
          >
            {error}
          </div>
        )}

        {!user ? (
          // STEP 1: Google Authentication
          <div className="space-y-4 text-center">
            <p className="text-xs text-white/50 leading-relaxed">
              CricBid administrative routes require authorization via Google Sign-In. Please sign in to verify your identity.
            </p>
            <button
              type="button"
              onClick={loginWithGoogle}
              className="btn-primary w-full py-4 text-sm font-bold flex justify-center items-center gap-2 text-neutral-900 bg-white hover:bg-neutral-100"
              style={{ borderRadius: '14px' }}
            >
              🔑 Sign In with Google
            </button>
          </div>
        ) : (
          // STEP 2: Password Entry & Email check
          <div className="space-y-4">
            {/* User credentials panel */}
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex items-center justify-between text-xs gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-white/40 block text-[9px] font-bold uppercase tracking-wider">Signed In As</span>
                <span className="font-bold text-white truncate block">{user.email}</span>
              </div>
              <div>
                {isAuthorizedEmail ? (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold border border-green-500/30 whitespace-nowrap">
                    Authorized
                  </span>
                ) : (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30 whitespace-nowrap">
                    Blocked
                  </span>
                )}
              </div>
            </div>

            {isAuthorizedEmail ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="section-label block text-white/50">Admin Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="form-input text-center tracking-widest text-lg font-mono focus:border-white/40"
                    style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-sm font-bold flex justify-center items-center gap-2"
                  style={{ borderRadius: '14px' }}
                >
                  {loading ? 'Authenticating…' : 'Access Dashboard'}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="text-xs p-3.5 rounded-xl border bg-red-500/10 border-red-500/20 text-red-400 leading-relaxed font-semibold">
                  This Google account ({user.email}) is not authorized to access administrative controls.
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="btn-secondary w-full py-3.5 text-xs font-bold hover:bg-white/10"
                  style={{ borderRadius: '12px' }}
                >
                  Switch Google Account
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
